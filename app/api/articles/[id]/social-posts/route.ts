import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { VOICE_PROFILE } from '@/lib/voice-profile';

export const dynamic = 'force-dynamic';

interface PlatformConfig {
  name: string;
  maxChars: number;
  style: string;
  hashtagLimit: number;
  hashtagGuidance: string;
}

const PLATFORMS: Record<string, PlatformConfig> = {
  twitter: {
    name: 'Twitter / X',
    maxChars: 280,
    style: 'Punchy, concise, bold. Use line breaks for impact. One key insight or hot take that makes people stop scrolling. Include hashtags at the end.',
    hashtagLimit: 3,
    hashtagGuidance: 'Use 2-3 highly specific trending hashtags. Mix broad (#AI) with niche (#HybridWorkforce). Avoid generic hashtags like #Tech or #Innovation.',
  },
  linkedin: {
    name: 'LinkedIn',
    maxChars: 3000,
    style: 'Professional storytelling. Open with a bold hook line (1 sentence), then a line break. Use short paragraphs (1-2 sentences each). Share a personal insight or lesson learned. End with a question to drive comments. Include hashtags at the very end.',
    hashtagLimit: 5,
    hashtagGuidance: 'Use 3-5 professional hashtags. Include industry-specific tags, thought leadership tags, and one broad AI tag. Example: #AIRecruitment #HybridWorkforce #SmallBusinessAI',
  },
  facebook: {
    name: 'Facebook',
    maxChars: 500,
    style: 'Conversational and relatable. Like talking to a friend. Ask a question or share a surprising stat to hook readers. Keep it under 500 characters for maximum engagement. Include hashtags at the end.',
    hashtagLimit: 2,
    hashtagGuidance: 'Use 1-2 simple, relatable hashtags. Keep them broad enough for non-technical audiences.',
  },
};

// Extract key topics from article text for smarter hashtag suggestions
function extractTopics(text: string): string[] {
  const topicPatterns: Record<string, RegExp> = {
    'AI': /\b(artificial intelligence|machine learning|deep learning|neural network|LLM|GPT|generative ai)\b/i,
    'Recruitment': /\b(recruit|hiring|talent|candidate|job|staffing|onboard)\b/i,
    'SmallBusiness': /\b(small business|startup|entrepreneur|solopreneur|local business)\b/i,
    'Automation': /\b(automat|workflow|process|efficiency|streamline)\b/i,
    'Sales': /\b(sales|selling|b2b|lead gen|prospect|pipeline|crm|revenue)\b/i,
    'Healthcare': /\b(healthcare|health care|medical|patient|telehealth)\b/i,
    'Ecommerce': /\b(ecommerce|e-commerce|retail|shop|online store)\b/i,
    'SaaS': /\b(saas|software|platform|subscription|cloud)\b/i,
    'DataDriven': /\b(data driven|analytics|metrics|insights|dashboard)\b/i,
    'FutureOfWork': /\b(future of work|remote work|hybrid work|workforce|workplace)\b/i,
    'CustomerExperience': /\b(customer experience|cx|engagement|satisfaction|retention)\b/i,
    'Leadership': /\b(leadership|management|strategy|decision making|executive)\b/i,
  };

  const found: string[] = [];
  const lower = text.toLowerCase();
  for (const [topic, pattern] of Object.entries(topicPatterns)) {
    if (pattern.test(lower)) {
      found.push(topic);
    }
  }
  return found;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const requestedPlatforms: string[] = body.platforms || ['twitter', 'linkedin', 'facebook'];

    // Validate platforms
    const validPlatforms = requestedPlatforms.filter(p => p in PLATFORMS);
    if (validPlatforms.length === 0) {
      return NextResponse.json(
        { error: 'No valid platforms specified. Use: twitter, linkedin, facebook' },
        { status: 400 }
      );
    }

    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: {
        sourceTrendItem: true,
        category: true,
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (!article.currentContentMarkdown) {
      return NextResponse.json(
        { error: 'Article has no content yet. Generate a draft first.' },
        { status: 400 }
      );
    }

    // Fetch user CTA settings for inclusion in social posts
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { ctaSettings: true },
    });
    const ctaSettings = user?.ctaSettings as any;

    // Build CTA context for social posts
    let ctaContext = '';
    if (ctaSettings?.enabled) {
      if (ctaSettings.book?.enabled && ctaSettings.book?.buyLink) {
        ctaContext += `\nBook link available: "${ctaSettings.book.title}" at ${ctaSettings.book.buyLink}`;
      }
      if (ctaSettings.video?.enabled && ctaSettings.video?.videoLink) {
        ctaContext += `\nVideo link available: "${ctaSettings.video.title}" at ${ctaSettings.video.videoLink}`;
      }
      if (ctaSettings.customCTAs?.length > 0) {
        ctaSettings.customCTAs.forEach((cta: any) => {
          if (cta.text && cta.link) {
            ctaContext += `\nCustom CTA available: "${cta.text}" at ${cta.link}`;
          }
        });
      }
    }

    // Truncate article content for the prompt (keep first ~2000 chars to stay under token limits)
    const truncatedContent = article.currentContentMarkdown.substring(0, 2000);

    // Extract key topics for better hashtag suggestions
    const detectedTopics = extractTopics(
      `${article.title} ${article.angleSummary || ''} ${truncatedContent}`
    );

    const prompt = `You are Jack Whatley, AI & Business Transformation Strategist. Generate social media posts for EACH of the following platforms based on this article.

**Article Title:** ${article.title}
**Article Angle:** ${article.angleSummary || 'N/A'}
**Category:** ${article.category?.displayName || 'AI Trends'}
**Detected Topics:** ${detectedTopics.join(', ') || 'General AI'}

**Article Content (excerpt):**
${truncatedContent}

**Jack's Voice Guidelines:**
- Tone: ${VOICE_PROFILE.writing_style.tone}
- Core message: ${VOICE_PROFILE.philosophy.hybrid_ai_vision.substring(0, 200)}
- Signature phrases to use naturally: ${VOICE_PROFILE.intellectual_property.signature_phrases.slice(0, 5).join(', ')}
- Target audience: ${VOICE_PROFILE.target_audience.who_they_are.substring(0, 150)}
${ctaContext ? `\n**Optional CTA Links (include ONE if natural, don't force):**${ctaContext}` : ''}

**Generate posts for these platforms:**

${validPlatforms.map((p) => {
  const config = PLATFORMS[p];
  return `### ${config.name} (STRICT max ${config.maxChars} characters, including hashtags)
Style: ${config.style}
Hashtag Rules: ${config.hashtagGuidance}
Max hashtags: ${config.hashtagLimit}`;
}).join('\n\n')}

**CRITICAL RULES:**
1. Each post MUST be in Jack's authentic voice - conversational, pragmatic, optimistic
2. NEVER sound generic or corporate
3. Each post should stand alone and be immediately engaging
4. **CHARACTER LIMITS ARE STRICT** - count carefully. Twitter is 280 chars TOTAL including hashtags and spaces. The content field must contain the COMPLETE post including hashtags.
5. Use emojis sparingly (1-2 max per post)
6. Focus on ONE key takeaway per post
7. Counter AI doom-and-gloom with Hybrid AI Workforce optimism
8. Hashtags MUST be relevant to the specific article topic, not generic filler
9. For Twitter: content + hashtags together must be under 280 characters

**HASHTAG QUALITY RULES:**
- Each hashtag must be specific to the article topic (not just #AI or #Tech)
- Combine broad + niche hashtags (e.g. #AI + #HybridRecruitment)
- Reference detected topics: ${detectedTopics.join(', ')}
- Camel case multi-word hashtags (#SmallBusinessAI not #smallbusinessai)

**OUTPUT FORMAT (strict JSON array):**
Return ONLY a valid JSON array with objects like:
[{"platform":"twitter","content":"<full post text WITHOUT hashtags>","hashtags":["#AI","#SmallBusiness"],"suggestedHashtags":["#alternateTag1","#alternateTag2"]}]

The "hashtags" field contains the primary hashtags to use. The "suggestedHashtags" field contains 2-3 alternative hashtags the user could swap in.
Return ONLY the JSON array, no other text.`;

    const llmResponse = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text().catch(() => 'Unknown error');
      console.error('LLM API error:', llmResponse.status, errorText);
      throw new Error(`LLM API error: ${llmResponse.status} ${llmResponse.statusText}`);
    }

    const llmData = await llmResponse.json();
    const rawContent = llmData.choices?.[0]?.message?.content || '';

    if (!rawContent.trim()) {
      console.error('LLM returned empty content for social posts');
      throw new Error('LLM returned empty response');
    }

    // Parse the LLM response - extract JSON from potential markdown code blocks
    let parsedPosts: any[] = [];
    try {
      // Try extracting from code blocks first
      const codeBlockMatch = rawContent.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (codeBlockMatch) {
        parsedPosts = JSON.parse(codeBlockMatch[1]);
      } else {
        const jsonMatch = rawContent.match(/\[\s*\{[\s\S]*\}\s*\]/m);
        if (jsonMatch) {
          parsedPosts = JSON.parse(jsonMatch[0]);
        } else {
          parsedPosts = JSON.parse(rawContent);
        }
      }
    } catch (parseErr) {
      console.error('Failed to parse LLM social post response:', parseErr, 'Raw:', rawContent.substring(0, 500));
      // Fallback: create basic posts from article content
      const shortTitle = article.title.length > 100 ? article.title.substring(0, 97) + '...' : article.title;
      parsedPosts = validPlatforms.map((p) => ({
        platform: p,
        content: p === 'twitter'
          ? `${shortTitle.substring(0, 220)}\n\n#AI #HybridWorkforce`
          : `${shortTitle}\n\nNew insights on AI trends and the Hybrid AI Workforce — collaboration beats replacement every time.\n\n#AI #HybridWorkforce`,
        hashtags: ['#AI', '#HybridWorkforce'],
        suggestedHashtags: ['#SmallBusiness', '#FutureOfWork'],
      }));
    }

    // Ensure we have posts for all requested platforms
    const existingPlatforms = new Set(parsedPosts.map((p: any) => p.platform));
    for (const p of validPlatforms) {
      if (!existingPlatforms.has(p)) {
        parsedPosts.push({
          platform: p,
          content: `${article.title.substring(0, 150)}\n\nAI is here to empower, not replace.\n\n#AI #HybridWorkforce`,
          hashtags: ['#AI', '#HybridWorkforce'],
          suggestedHashtags: ['#SmallBusiness'],
        });
      }
    }

    // Normalize and validate posts
    const socialPosts = parsedPosts
      .filter((post: any) => validPlatforms.includes(post.platform))
      .map((post: any) => {
        const platform = post.platform || 'twitter';
        const config = PLATFORMS[platform] || PLATFORMS.twitter;
        let content = (post.content || '').trim();

        // Extract and normalize hashtags
        const hashtags: string[] = (post.hashtags || [])
          .map((t: string) => t.startsWith('#') ? t : `#${t}`)
          .slice(0, config.hashtagLimit);
        const suggestedHashtags: string[] = (post.suggestedHashtags || [])
          .map((t: string) => t.startsWith('#') ? t : `#${t}`);

        // Append hashtags if not already in content
        const hashtagStr = hashtags.join(' ');
        if (hashtagStr && !hashtags.some(tag => content.includes(tag))) {
          content = `${content}\n\n${hashtagStr}`;
        }

        // Smart character limit enforcement — truncate at last sentence boundary
        if (content.length > config.maxChars) {
          const target = config.maxChars - 3;
          let cutPoint = target;
          // Try to cut at a sentence boundary
          const lastPeriod = content.lastIndexOf('.', target);
          const lastNewline = content.lastIndexOf('\n', target);
          const bestCut = Math.max(lastPeriod, lastNewline);
          if (bestCut > target * 0.6) {
            cutPoint = bestCut + 1;
          }
          content = content.substring(0, cutPoint).trimEnd() + '...';
        }

        return {
          platform,
          platformName: config.name,
          content,
          characterCount: content.length,
          maxCharacters: config.maxChars,
          hashtags,
          suggestedHashtags,
          isOverLimit: content.length > config.maxChars,
        };
      });

    return NextResponse.json({
      success: true,
      socialPosts,
      articleTitle: article.title,
      detectedTopics,
    });
  } catch (error) {
    console.error('Error generating social posts:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate social posts';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
