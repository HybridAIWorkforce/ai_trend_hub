import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { VOICE_PROFILE } from '@/lib/voice-profile';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, ctaSettings: true }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Get user's CTA settings
    const ctaSettings = user.ctaSettings as any || null;

    const body = await request.json();
    const { trendItemId, angle, title, outline, audience, goal, tone, format, language, useAida } = body;

    if (!trendItemId || !angle || !title || !outline) {
      return new Response(
        JSON.stringify({ error: 'Required fields missing' }),
        { status: 400 }
      );
    }

    // Fetch the trend item
    const trendItem = await prisma.trendItem.findUnique({
      where: { id: trendItemId },
      include: { category: true }
    });

    if (!trendItem) {
      return new Response(JSON.stringify({ error: 'Trend item not found' }), { status: 404 });
    }

    // Determine word count target
    let wordCountTarget = '1000-1500 words';
    if (format === 'short_blog') {
      wordCountTarget = '600-800 words';
    } else if (format === 'deep_dive') {
      wordCountTarget = '2000+ words';
    }

    // Build the outline text
    let outlineText = `## ${outline.introduction.heading}\n`;
    outline.introduction.points.forEach((point: string) => {
      outlineText += `- ${point}\n`;
    });
    outlineText += '\n';

    outline.sections.forEach((section: any) => {
      outlineText += `## ${section.heading}\n`;
      section.points.forEach((point: string) => {
        outlineText += `- ${point}\n`;
      });
      outlineText += '\n';
    });

    outlineText += `## ${outline.conclusion.heading}\n`;
    outline.conclusion.points.forEach((point: string) => {
      outlineText += `- ${point}\n`;
    });

    // Prepare AIDA instructions if enabled
    const aidaInstructions = useAida ? `

**AIDA FRAMEWORK INSTRUCTIONS (CRITICAL - APPLY THROUGHOUT):**

Transform this article by incorporating the AIDA framework (Attention, Interest, Desire, Action) while maintaining informational value and natural readability.

⚠️ **CRITICAL GUARDRAILS - READ FIRST:**

**DO NOT:**
- ❌ Make it sound like a sales pitch or infomercial
- ❌ Use excessive exclamation marks or hype language
- ❌ Oversimplify complex topics to fit the formula
- ❌ Force every section into rigid AIDA boxes
- ❌ Use manipulative urgency ("Act now!" "Limited time!")
- ❌ Sacrifice depth and nuance for persuasion
- ❌ Make the CTA feel like an advertisement

**DO:**
- ✅ Let AIDA enhance the natural flow, not dictate it
- ✅ Keep the tone authentic to the content and audience
- ✅ Blend AIDA steps organically (Interest and Desire can overlap)
- ✅ Preserve intellectual rigor and factual accuracy
- ✅ Make the hook feel natural, not tacked on
- ✅ Ensure CTAs feel like natural next steps, not sales pitches
- ✅ Maintain credibility above conversion

**1. ATTENTION - Craft the Opening Hook (Natural & Authentic):**
- Start with ONE of these hook types:
  • A surprising statistic or fact (must be relevant and true)
  • A thought-provoking question (not rhetorical manipulation)
  • A relatable problem statement (genuine, not exaggerated)
  • A bold/controversial claim (supported by evidence)
  • A vivid scenario or mini-story (realistic, not dramatic)
- Keep the hook under 2 sentences
- Make it directly relevant to the target audience's pain points or interests
- **Authenticity check**: Would this hook feel natural in a conversation with a colleague?
- Add the label **[ATTENTION]** at the start of the opening paragraph

**2. INTEREST - Build the Bridge (Conversational, Not Salesy):**
- In paragraphs 2-4:
  • Identify and articulate the reader's core problem or need
  • Use "you" language naturally, not excessively
  • Include phrases like "If you've ever..." or "You're not alone if..." (but sparingly)
  • Preview the value they'll get from reading (without hype or overselling)
  • Create curiosity gaps that make them want to continue
- **Depth check**: Am I maintaining the complexity of the topic or oversimplifying?
- Add the label **[INTEREST]** at the start of this section

**3. DESIRE - Transform Information into Benefits (Subtle & Evidence-Based):**
- Throughout the body paragraphs:
  • Convert features/facts into clear benefits using:
    - "This means you can..." (use naturally, not repetitively)
    - "As a result, you'll..." (when genuinely applicable)
    - "This allows you to..." (if factually accurate)
  • Include at least one of these elements:
    - A success story or case study (real and verifiable)
    - Before/after scenario (realistic, not exaggerated)
    - Specific measurable outcomes (with proper citations)
    - Social proof (statistics, testimonials, expert quotes - all credible)
  • Use sensory language to help readers visualize the positive outcome
  • Address and overcome likely objections subtly (with logic, not manipulation)
- **Credibility check**: Are all claims backed by evidence? Am I being honest about limitations?
- Add the label **[DESIRE]** at the start of this section

**4. ACTION - Create Clear Next Steps (Helpful, Not Pushy):**
- In the final section:
  • Add a specific, single call-to-action such as:
    - "Try this technique today by..." (educational, not promotional)
    - "Explore these resources..." (genuinely helpful)
    - "Share your experience in the comments..." (community-building)
    - "Consider implementing these steps..." (suggestive, not demanding)
    - "Start by experimenting with..." (invitational)
  • Make the action concrete and achievable within 5 minutes
  • **NO urgency or scarcity tactics** (no "Limited time!" or "Act now!")
  • Include a final benefit reminder in the CTA (but keep it authentic)
- **Natural flow check**: Does this conclusion feel like a natural ending or a tacked-on sales pitch?
- Add the label **[ACTION]** at the start of the conclusion section

**AIDA Quality Checks:**
- Maintain factual accuracy from the source material (non-negotiable)
- Flow naturally without feeling "salesy" (critical)
- Sound conversational and intelligent, not robotic or hype-driven
- Balance education with gentle persuasion (education comes first)
- Keep paragraph lengths appropriate to content complexity
- Use transition phrases naturally ("But here's the thing..." only if it fits the tone)
- **Tone authenticity**: Read it aloud - does it sound like an informed expert or a salesperson?

**AIDA Tone Calibration (Critical - Follow Strictly):**
${goal === 'educate' ? '- **EDUCATE MODE**: Very subtle AIDA. Focus 80% on learning, 20% on action. Hook should be intellectual curiosity, not pain points. CTA should be "explore further" or "try this concept," never "buy" or "sign up."' : ''}
${goal === 'thought_leadership' ? '- **THOUGHT LEADERSHIP MODE**: Medium AIDA. Emphasize unique perspective and expertise. Hook with controversial or novel insight. CTA should invite discussion or deeper engagement, not product promotion.' : ''}
${goal === 'how_to' ? '- **HOW-TO MODE**: Practical AIDA. Hook with the problem they\'re trying to solve. Focus on actionable outcomes and real-world application. CTA should be "try this now" or "implement these steps."' : ''}
${goal === 'news_analysis' ? '- **NEWS ANALYSIS MODE**: Minimal AIDA. Maintain objectivity and journalistic integrity. Hook with the significance of the news. Gentle guidance in conclusion. CTA should be "stay informed" or "follow developments," never promotional.' : ''}

**Final Authenticity Check Before Submission:**
1. Does this article prioritize information over conversion? (Must be YES)
2. Would I be proud to put my name on this as an expert? (Must be YES)
3. Does it avoid sounding like a sales pitch or infomercial? (Must be YES)
4. Are all claims accurate, evidence-based, and honest? (Must be YES)
5. Does the CTA feel helpful rather than pushy? (Must be YES)

**Remember**: AIDA is a guide to enhance engagement, NOT a formula to sacrifice quality. When in doubt, choose depth and authenticity over persuasion.
` : '';

    // Detect industry context from title, angle, trend item content, and category
    const detectIndustryContext = (text: string): Array<{ key: string; score: number }> => {
      const lowerText = text.toLowerCase();
      
      // Map of industry patterns with weighted keywords
      // Each keyword can have an optional boost for highly specific terms
      const industryPatterns: Array<{ key: string; keywords: Array<{ term: RegExp; boost?: number }> }> = [
        { key: 'sales_b2b', keywords: [
          { term: /\bsales\b/ }, { term: /\bselling\b/ }, { term: /\bb2b\b/, boost: 2 },
          { term: /\blead gen\b/, boost: 2 }, { term: /\bprospect\b/ }, { term: /\bpipeline\b/ },
          { term: /\bcrm\b/, boost: 2 }, { term: /\brevenue\b/ }, { term: /\bclose\b/ },
          { term: /\bdeal\b/ }, { term: /\bcold call\b/, boost: 2 }, { term: /\boutbound\b/ },
          { term: /\bquota\b/ }, { term: /\baccount executive\b/, boost: 2 }, { term: /\bsdr\b/, boost: 2 },
          { term: /\bsales enablement\b/, boost: 3 }, { term: /\bsalesforce\b/, boost: 2 },
        ]},
        { key: 'ecommerce_retail', keywords: [
          { term: /\becommerce\b/, boost: 2 }, { term: /\be-commerce\b/, boost: 2 },
          { term: /\bretail\b/ }, { term: /\bshop\b/ }, { term: /\bstore\b/ },
          { term: /\bproduct listing\b/ }, { term: /\bcart\b/ }, { term: /\bcheckout\b/ },
          { term: /\bcustomer experience\b/ }, { term: /\bamazon\b/, boost: 2 },
          { term: /\bshopify\b/, boost: 2 }, { term: /\bdtc\b/, boost: 2 },
          { term: /\bd2c\b/, boost: 2 }, { term: /\bmarketplace\b/ }, { term: /\bfulfillment\b/ },
        ]},
        { key: 'restaurants_hospitality', keywords: [
          { term: /\brestaurant\b/, boost: 2 }, { term: /\bfood\b/ }, { term: /\bdining\b/ },
          { term: /\bhospitality\b/, boost: 2 }, { term: /\bhotel\b/ }, { term: /\bguest\b/ },
          { term: /\breservation\b/ }, { term: /\bmenu\b/ }, { term: /\bchef\b/ },
          { term: /\bkitchen\b/ }, { term: /\bbar\b/ }, { term: /\bcatering\b/ },
          { term: /\btourism\b/ }, { term: /\bfront of house\b/, boost: 2 },
        ]},
        { key: 'healthcare', keywords: [
          { term: /\bhealthcare\b/, boost: 2 }, { term: /\bhealth care\b/, boost: 2 },
          { term: /\bmedical\b/ }, { term: /\bpatient\b/ }, { term: /\bdoctor\b/ },
          { term: /\bhospital\b/ }, { term: /\bclinic\b/ }, { term: /\bpharma\b/, boost: 2 },
          { term: /\bwellness\b/ }, { term: /\btelehealth\b/, boost: 2 },
          { term: /\bdiagnosis\b/ }, { term: /\behr\b/, boost: 2 }, { term: /\bhipaa\b/, boost: 2 },
          { term: /\bclinical trial\b/, boost: 3 },
        ]},
        { key: 'manufacturing_logistics', keywords: [
          { term: /\bmanufacturing\b/, boost: 2 }, { term: /\blogistics\b/, boost: 2 },
          { term: /\bsupply chain\b/, boost: 2 }, { term: /\bproduction\b/ },
          { term: /\bwarehouse\b/ }, { term: /\bshipping\b/ }, { term: /\bfactory\b/ },
          { term: /\bassembly\b/ }, { term: /\binventory\b/ }, { term: /\bprocurement\b/ },
          { term: /\bdistribution\b/ }, { term: /\biot\b/, boost: 2 },
        ]},
        { key: 'professional_services', keywords: [
          { term: /\baccounting\b/ }, { term: /\blegal\b/ }, { term: /\bconsulting\b/ },
          { term: /\bprofessional services\b/, boost: 3 }, { term: /\blaw firm\b/, boost: 2 },
          { term: /\badvisory\b/ }, { term: /\baudit\b/ }, { term: /\btax\b/ },
          { term: /\bcompliance\b/ }, { term: /\bfiduciary\b/ },
        ]},
        { key: 'saas', keywords: [
          { term: /\bsaas\b/, boost: 3 }, { term: /\bsoftware as a service\b/, boost: 3 },
          { term: /\bapp development\b/ }, { term: /\bplatform\b/ },
          { term: /\bsubscription\b/ }, { term: /\bapi\b/ }, { term: /\bcloud\b/ },
          { term: /\bdevops\b/, boost: 2 }, { term: /\bstartup\b/ }, { term: /\bchurn\b/, boost: 2 },
          { term: /\bmrr\b/, boost: 3 }, { term: /\barr\b/, boost: 3 },
          { term: /\bproduct-led\b/, boost: 2 }, { term: /\bonboarding\b/ },
        ]},
        { key: 'education', keywords: [
          { term: /\beducation\b/, boost: 2 }, { term: /\bschool\b/ }, { term: /\buniversity\b/ },
          { term: /\bstudent\b/ }, { term: /\bteacher\b/ }, { term: /\blearning\b/ },
          { term: /\bedtech\b/, boost: 3 }, { term: /\bcurriculum\b/ },
          { term: /\btraining\b/ }, { term: /\blms\b/, boost: 2 },
          { term: /\bcourse\b/ }, { term: /\bupskilling\b/, boost: 2 },
        ]},
        { key: 'fintech', keywords: [
          { term: /\bfintech\b/, boost: 3 }, { term: /\bbanking\b/ }, { term: /\bfinance\b/ },
          { term: /\bpayment\b/ }, { term: /\blending\b/ }, { term: /\binsurance\b/ },
          { term: /\binvestment\b/ }, { term: /\bcrypto\b/, boost: 2 },
          { term: /\bblockchain\b/, boost: 2 }, { term: /\bregtech\b/, boost: 3 },
          { term: /\bneobank\b/, boost: 3 }, { term: /\bunderwriting\b/ },
        ]},
        { key: 'real_estate', keywords: [
          { term: /\breal estate\b/, boost: 3 }, { term: /\bproperty\b/ },
          { term: /\bmortgage\b/, boost: 2 }, { term: /\brealtor\b/, boost: 2 },
          { term: /\bcommercial property\b/, boost: 2 }, { term: /\btenant\b/ },
          { term: /\blease\b/ }, { term: /\bproptech\b/, boost: 3 },
          { term: /\blisting\b/ }, { term: /\bbrokerage\b/, boost: 2 },
        ]},
        { key: 'recruitment', keywords: [
          { term: /\brecruit\b/ }, { term: /\bhiring\b/ }, { term: /\btalent\b/ },
          { term: /\bcandidate\b/ }, { term: /\bjob\b/ }, { term: /\bresume\b/ },
          { term: /\binterview\b/ }, { term: /\bonboard\b/ }, { term: /\bstaffing\b/, boost: 2 },
          { term: /\bheadhunt\b/, boost: 2 }, { term: /\bapplicant\b/ }, { term: /\bworkforce\b/ },
          { term: /\bats\b/, boost: 2 }, { term: /\btalent acquisition\b/, boost: 3 },
        ]},
      ];
      
      // Score each industry by counting weighted keyword matches
      const scored = industryPatterns.map(ip => {
        let score = 0;
        for (const kw of ip.keywords) {
          const matches = lowerText.match(new RegExp(kw.term.source, 'gi'));
          if (matches) {
            score += matches.length * (kw.boost || 1);
          }
        }
        return { key: ip.key, score };
      }).filter(s => s.score > 0).sort((a, b) => b.score - a.score);
      
      // Always include recruitment as Jack's home base with minimum score
      if (!scored.find(s => s.key === 'recruitment')) {
        scored.push({ key: 'recruitment', score: 1 });
      }
      
      return scored;
    };
    
    // Build comprehensive context string for industry detection
    const detectionText = [
      title,
      angle,
      trendItem.title,
      trendItem.summary || '',
      trendItem.content || '',
      trendItem.category?.displayName || '',
      audience || '',
      (trendItem.tags || []).join(' '),
    ].join(' ');
    
    const scoredIndustries = detectIndustryContext(detectionText);
    const detectedIndustries = scoredIndustries.map(s => s.key);
    // Primary industry: highest-scoring non-recruitment, or recruitment if that's the only one
    const primaryIndustry = scoredIndustries.find(s => s.key !== 'recruitment')?.key || 'recruitment';
    // Secondary industry for cross-industry prompts
    const secondaryIndustry = scoredIndustries.filter(s => s.key !== primaryIndustry)[0]?.key;
    
    // Build industry-specific IP examples
    const crossIndustryIP = VOICE_PROFILE.cross_industry_applications;
    let industrySpecificExamples = '';
    
    if (detectedIndustries.length > 0) {
      industrySpecificExamples = `

**YOUR INTELLECTUAL PROPERTY FRAMEWORKS (Apply to this topic):**

These are YOUR proven systems - reference them naturally when relevant:

1. **The Skyscraper Foundation Philosophy** ("To build tall, you need to build deep")
   ${primaryIndustry in crossIndustryIP.skyscraper_foundation ? `
   For this context:
   - Foundation: ${crossIndustryIP.skyscraper_foundation[primaryIndustry as keyof typeof crossIndustryIP.skyscraper_foundation].foundation}
   - Floors (Departments): ${crossIndustryIP.skyscraper_foundation[primaryIndustry as keyof typeof crossIndustryIP.skyscraper_foundation].floors}
   - Tools (Top): ${crossIndustryIP.skyscraper_foundation[primaryIndustry as keyof typeof crossIndustryIP.skyscraper_foundation].tools}
   ` : ''}

2. **The 6-Stage Blueprint Cycle**
   ${primaryIndustry in crossIndustryIP.six_stage_cycle ? `
   For this industry: ${crossIndustryIP.six_stage_cycle[primaryIndustry as keyof typeof crossIndustryIP.six_stage_cycle]}
   ` : ''}

3. **The Four Strategic Funnels** (Reference these if relevant):
   ${primaryIndustry in crossIndustryIP.four_funnels_translated.fomo_reactivation ? `
   - FOMO Reactivation: ${crossIndustryIP.four_funnels_translated.fomo_reactivation[primaryIndustry as keyof typeof crossIndustryIP.four_funnels_translated.fomo_reactivation]}
   - "Not Qualified Yet" Funnel: ${crossIndustryIP.four_funnels_translated.not_qualified_yet[primaryIndustry as keyof typeof crossIndustryIP.four_funnels_translated.not_qualified_yet]}
   - Fast Response Co-Pilot: ${crossIndustryIP.four_funnels_translated.fast_response_copilot[primaryIndustry as keyof typeof crossIndustryIP.four_funnels_translated.fast_response_copilot]}
   - Abandoned Application: ${crossIndustryIP.four_funnels_translated.abandoned_application[primaryIndustry as keyof typeof crossIndustryIP.four_funnels_translated.abandoned_application]}
   ` : ''}

4. **The Co-Pilot Accountability System** (AI that ensures humans follow through)
   ${primaryIndustry in crossIndustryIP.copilot_system ? `
   For this context: ${crossIndustryIP.copilot_system[primaryIndustry as keyof typeof crossIndustryIP.copilot_system]}
   ` : ''}

5. **The Improvement Flywheel** (Continuous optimization loop)
   ${primaryIndustry in crossIndustryIP.improvement_flywheel ? `
   For this context: ${crossIndustryIP.improvement_flywheel[primaryIndustry as keyof typeof crossIndustryIP.improvement_flywheel]}
   ` : ''}

6. **Maslow-Based Messaging** (Psychological framework for communication)
   ${primaryIndustry in crossIndustryIP.maslow_messaging ? `
   For this context: ${crossIndustryIP.maslow_messaging[primaryIndustry as keyof typeof crossIndustryIP.maslow_messaging]}
   ` : ''}

**IMPORTANT**: These are YOUR frameworks that you've proven in real business settings. Reference them naturally when relevant to the topic. Don't force them in, but DO use them when they illuminate a point or provide a solution framework.
${detectedIndustries.length > 2 ? `\n**CROSS-INDUSTRY ANGLE**: This topic touches ${detectedIndustries.filter(i => i !== 'recruitment').join(', ')} (ranked by relevance: ${scoredIndustries.slice(0, 4).map(s => `${s.key}:${s.score}`).join(', ')}). Draw parallels between industries to show how YOUR frameworks are universal business wisdom, not industry-specific tricks.` : ''}
${secondaryIndustry && secondaryIndustry !== 'recruitment' ? `\n**SECONDARY INDUSTRY CONTEXT**: Also weave in practical examples from ${secondaryIndustry.replace(/_/g, ' ')} to broaden appeal and show cross-industry applicability.` : ''}
`;
    }

    // Prepare Jack's Voice Profile for the prompt
    const voiceProfileInstructions = `

**CRITICAL: VOICE PROFILE - Write as Jack Whatley**

You are writing as Jack Whatley, AI & Business Transformation Strategist and author of "Reshaping Recruitment". This article MUST sound like Jack wrote it personally.

**Your Background:** You've proven your frameworks in recruitment AND sales, but your IP applies across ALL industries. You're a Hybrid AI Workforce evangelist who happens to have recruiting/sales case studies.

**Jack's Core Philosophy (MUST INFUSE INTO ARTICLE):**
${VOICE_PROFILE.philosophy.hybrid_ai_vision}

**Key Beliefs to Weave In:**
${VOICE_PROFILE.philosophy.core_beliefs.map((belief, i) => `${i + 1}. ${belief}`).join('\n')}

**Your Positioning:**
${VOICE_PROFILE.philosophy.positioning}

**Writing Style Requirements:**
- Tone: ${VOICE_PROFILE.writing_style.tone}
- Use Jack's signature phrases naturally: ${VOICE_PROFILE.intellectual_property.signature_phrases.slice(0, 5).join(', ')}
- Structure: ${VOICE_PROFILE.article_templates.body_structure.slice(0, 3).join(' → ')}
- Vocabulary: ${VOICE_PROFILE.writing_style.vocabulary.preferred}

**Target Audience (Write FOR Them):**
${VOICE_PROFILE.target_audience.who_they_are}

**What They Want:**
${VOICE_PROFILE.target_audience.what_they_want.slice(0, 3).join(', ')}

**Communication Approach:**
${VOICE_PROFILE.target_audience.communication_approach}

**HYBRID AI MESSAGING (CRITICAL - Counter Doom & Gloom):**
Core Message: ${VOICE_PROFILE.hybrid_ai_messaging.core_message}

Key Themes to Emphasize:
${VOICE_PROFILE.hybrid_ai_messaging.key_themes.slice(0, 4).map((theme, i) => `${i + 1}. ${theme}`).join('\n')}

Success Metrics to Reference:
${VOICE_PROFILE.hybrid_ai_messaging.success_metrics.slice(0, 3).join(', ')}

**Opening Hook Style (Choose ONE):**
${VOICE_PROFILE.article_templates.opening_hooks.slice(0, 3).join(', ')}

**Conclusion Formula:**
${VOICE_PROFILE.article_templates.conclusion_formula.slice(0, 3).join(', ')}
${industrySpecificExamples}

**Remember: You are Jack - pragmatic optimist, systems thinker, sales-driven strategist who empowers small businesses to beat bigger competitors with AI. This is about collaboration, NOT replacement. Make it conversational, story-driven, and backed by specific numbers and examples. Your frameworks apply across ALL industries, not just recruitment.**
`;

    // Build CTA instructions based on user settings
    let ctaInstructions = '';
    if (ctaSettings && ctaSettings.enabled) {
      ctaInstructions = `\n\n**CALL-TO-ACTION INSTRUCTIONS (CRITICAL):**\n\n`;
      ctaInstructions += `You MUST include the following call-to-action(s) in your article.\n\n`;
      
      // CTA Style guidance
      const styleGuidance = {
        invitational: "Use Jack's signature invitational style - friendly, not pushy. Phrases like 'If you want to dive deeper...', 'I'd love to show you...', 'Check this out if you're curious...'",
        direct: "Use clear, action-oriented language. Direct but still authentic to Jack's voice. 'Get the book here', 'Watch the video now', 'Click to learn more'",
        educational: "Frame CTAs as learning opportunities. 'Explore more about...', 'Learn how I did this...', 'Discover the full framework...'"
      };
      
      ctaInstructions += `**CTA Style:** ${styleGuidance[ctaSettings.style as keyof typeof styleGuidance]}\n`;
      ctaInstructions += `**CTA Placement:** ${ctaSettings.placement === 'end' ? 'End of article only' : ctaSettings.placement === 'middle' ? 'Middle of article (after 3rd or 4th section)' : 'Both middle and end of article'}\n\n`;
      
      // Book CTA
      if (ctaSettings.book && ctaSettings.book.enabled && ctaSettings.book.title) {
        ctaInstructions += `**📚 BOOK CTA:**\n`;
        ctaInstructions += `- Book Title: "${ctaSettings.book.title}"\n`;
        if (ctaSettings.book.description) {
          ctaInstructions += `- Description: ${ctaSettings.book.description}\n`;
        }
        if (ctaSettings.book.buyLink) {
          ctaInstructions += `- Buy Link: ${ctaSettings.book.buyLink}\n`;
        }
        if (ctaSettings.book.price) {
          ctaInstructions += `- Price: ${ctaSettings.book.price}\n`;
        }
        ctaInstructions += `- Write this CTA in Jack's voice - connect it naturally to the article topic. Example: "If you want the full story of how I built these systems (along with step-by-step blueprints), check out my book [${ctaSettings.book.title}](${ctaSettings.book.buyLink})${ctaSettings.book.price ? ` (${ctaSettings.book.price})` : ''}. ${ctaSettings.book.description || 'It\'s the complete playbook.'}"\n\n`;
      }
      
      // Video CTA
      if (ctaSettings.video && ctaSettings.video.enabled && ctaSettings.video.title) {
        ctaInstructions += `**🎥 VIDEO CTA:**\n`;
        ctaInstructions += `- Video Title: "${ctaSettings.video.title}"\n`;
        if (ctaSettings.video.description) {
          ctaInstructions += `- Description: ${ctaSettings.video.description}\n`;
        }
        if (ctaSettings.video.videoLink) {
          ctaInstructions += `- Video Link: ${ctaSettings.video.videoLink}\n`;
        }
        ctaInstructions += `- Write this CTA in Jack's voice - make it invitational. Example: "Want to see this in action? [Watch my free masterclass](${ctaSettings.video.videoLink}) where I walk through ${ctaSettings.video.description || 'the entire system step-by-step'}. No fluff, just the real playbook."\n\n`;
      }
      
      // Affiliate Products
      if (ctaSettings.affiliateProducts && ctaSettings.affiliateProducts.length > 0) {
        ctaInstructions += `**💼 AFFILIATE PRODUCT CTAs:**\n`;
        ctaSettings.affiliateProducts.forEach((product: any, index: number) => {
          if (product.name && product.link) {
            ctaInstructions += `${index + 1}. **${product.name}**\n`;
            if (product.description) {
              ctaInstructions += `   - Description: ${product.description}\n`;
            }
            ctaInstructions += `   - Link: ${product.link}\n`;
            if (product.commission) {
              ctaInstructions += `   - Disclosure: ${product.commission}\n`;
            }
            ctaInstructions += `   - Example CTA: "I personally use [${product.name}](${product.link}) every single day. ${product.description || 'It\'s been a game-changer.'} ${product.commission ? '(Full disclosure: ' + product.commission + ')' : ''}"\n\n`;
          }
        });
      }
      
      // Custom CTAs
      if (ctaSettings.customCTAs && ctaSettings.customCTAs.length > 0) {
        ctaInstructions += `**🔗 CUSTOM CTAs:**\n`;
        ctaSettings.customCTAs.forEach((cta: any, index: number) => {
          if (cta.text && cta.link) {
            ctaInstructions += `${index + 1}. **${cta.text}**\n`;
            if (cta.description) {
              ctaInstructions += `   - Context: ${cta.description}\n`;
            }
            ctaInstructions += `   - Link: ${cta.link}\n`;
            ctaInstructions += `   - Example CTA: "${cta.description || cta.text} [${cta.text}](${cta.link})"\n\n`;
          }
        });
      }

      ctaInstructions += `**CTA FORMATTING RULES:**\n`;
      ctaInstructions += `1. Format CTAs as natural transitions, not jarring sales pitches\n`;
      ctaInstructions += `2. Use markdown links: [link text](url)\n`;
      ctaInstructions += `3. Place CTAs in their own section with a horizontal rule (---) before them\n`;
      ctaInstructions += `4. Add a heading like "## Want to Go Deeper?" or "## Take Action" before CTAs\n`;
      ctaInstructions += `5. Keep CTAs authentic to Jack's voice - pragmatic, helpful, not pushy\n`;
      ctaInstructions += `6. If multiple CTAs, present them as "Here's where to go next:" with bullet points\n`;
      ctaInstructions += `7. End with an inspirational closer after CTAs (Jack's signature)\n\n`;
      ctaInstructions += `**REMEMBER:** These CTAs should feel like natural next steps, not advertisements. Jack is sharing resources that actually helped him, in the spirit of empowering fellow business owners.\n`;
    }

    // Prepare the prompt for article generation
    const prompt = `You are Jack Whatley, AI & Business Transformation Strategist. You've proven your frameworks in recruitment and sales, but your Hybrid AI Workforce philosophy and systems apply to ANY industry. Write a complete, high-quality article in YOUR voice based on the following information.

**Trend Information:**
Title: ${trendItem.title}
Summary: ${trendItem.summary || 'No summary available'}
Source: ${trendItem.sourceName}
Category: ${trendItem.category.displayName}
Link: ${trendItem.link}

**Selected Angle:**
${angle}

**Article Title:**
${title}

**Outline:**
${outlineText}

**Article Requirements:**
Audience: ${audience || 'Small to mid-size business owners, operators, regular people looking to use AI to solve problems'}
Goal: ${goal || 'Educate'}
Tone: ${tone || 'Conversational yet authoritative - trusted advisor'}
Target Length: ${wordCountTarget}
Language: ${language || 'English'}
${useAida ? 'AIDA Framework: ENABLED - Apply AIDA principles throughout the article' : ''}
${voiceProfileInstructions}

**Instructions:**
1. **CRITICAL:** Write as Jack Whatley using the Voice Profile above - conversational, story-driven, pragmatic optimism
2. Open with one of Jack's signature hooks (personal story, surprising stat, bold question, 'Picture this...', or Dad's life lesson)
3. Use Jack's signature phrases naturally throughout (e.g., "AI Never Sleeps", "This changes the game", "Levels the playing field")
4. Write in short paragraphs (2-4 sentences) for readability
5. Include specific numbers, timelines, and metrics (Jack loves concrete examples)
6. Counter AI doom-and-gloom with Hybrid AI Workforce messaging - collaboration, not replacement
7. Target audience is small business owners/operators who want practical solutions, not theory
8. Use markdown formatting (headings, bold, italic, lists, links)
9. Include relevant examples and real-world applications
10. Follow the outline structure provided
11. Aim for the target word count
12. End with Jack's conclusion formula: recap journey, reinforce Hybrid AI philosophy, invitational CTA, inspirational closer
13. Do NOT include the article title in the content (it will be added separately)${useAida ? '\n14. **CRITICAL:** Apply the AIDA framework instructions below with Jack\'s voice - authentic, not salesy' : ''}
${aidaInstructions}

**Final Reminder: You ARE Jack Whatley. Write like you're having a conversation with a fellow business owner over coffee. Be authentic, be pragmatic, be optimistic. Show them how AI empowers humans to work smarter, not replaces them. This is the antidote to AI fear-mongering.**
${ctaInstructions}

Write the article content in markdown format. Start directly with the introduction paragraph in Jack's voice.`;

    // Stream the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Call the LLM API with streaming
          const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-4.1-mini',
              messages: [
                { role: 'user', content: prompt }
              ],
              stream: true,
              max_tokens: 4000,
              temperature: 0.7
            }),
          });

          if (!response.ok) {
            throw new Error(`LLM API error: ${response.statusText}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No reader available');
          }

          const decoder = new TextDecoder();
          let buffer = '';
          let partialRead = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            partialRead += decoder.decode(value, { stream: true });
            let lines = partialRead.split('\n');
            partialRead = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  // Save the article to database
                  const article = await prisma.article.create({
                    data: {
                      ownerUserId: user.id,
                      sourceTrendItemId: trendItemId,
                      categoryId: trendItem.categoryId,
                      title,
                      angleSummary: angle,
                      audience,
                      goal,
                      format,
                      tone,
                      language,
                      lengthPreference: wordCountTarget,
                      outlineJson: outline,
                      currentContentMarkdown: buffer,
                      status: 'draft'
                    }
                  });

                  // Create first version
                  await prisma.articleVersion.create({
                    data: {
                      articleId: article.id,
                      versionNumber: 1,
                      title,
                      outlineJson: outline,
                      contentMarkdown: buffer,
                      metadataJson: {
                        audience,
                        goal,
                        format,
                        tone,
                        language,
                        useAida: useAida || false
                      }
                    }
                  });

                  // Send completion message
                  const finalData = JSON.stringify({
                    status: 'completed',
                    articleId: article.id
                  });
                  controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
                  controller.close();
                  return;
                }
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  if (content) {
                    buffer += content;
                    // Stream the content back to client
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'generating', content })}\n\n`));
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'error', message: 'Failed to generate article' })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error generating article draft:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate article draft' }),
      { status: 500 }
    );
  }
}