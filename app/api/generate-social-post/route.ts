import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { VOICE_PROFILE } from '@/lib/voice-profile';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { trendItemId, platform = 'twitter' } = body;

    if (!trendItemId) {
      return NextResponse.json({ error: 'trendItemId is required' }, { status: 400 });
    }

    const trendItem = await prisma.trendItem.findUnique({
      where: { id: trendItemId },
      include: { category: true },
    });

    if (!trendItem) {
      return NextResponse.json({ error: 'Trend item not found' }, { status: 404 });
    }

    const platformConfigs: Record<string, { maxChars: number; style: string }> = {
      twitter: { maxChars: 280, style: 'Punchy, concise. One key insight or hot take. 2-3 hashtags at end.' },
      linkedin: { maxChars: 3000, style: 'Professional storytelling. Bold hook, short paragraphs, end with question. 3-5 hashtags.' },
      facebook: { maxChars: 500, style: 'Conversational. Ask a question or share a surprising stat. 1-2 hashtags.' },
    };

    const config = platformConfigs[platform] || platformConfigs.twitter;

    const prompt = `You are Jack Whatley, AI & Business Transformation Strategist. Write a ${platform} post about this trending AI topic.

**Topic:** ${trendItem.title}
**Summary:** ${trendItem.summary || 'N/A'}
**Category:** ${trendItem.category?.displayName || 'AI Trends'}

**Voice:** ${VOICE_PROFILE.writing_style.tone}
**Core message:** Hybrid AI Workforce - collaboration, not replacement.
**Max characters:** ${config.maxChars}
**Style:** ${config.style}

Write ONLY the post content, nothing else. Stay under ${config.maxChars} characters.`;

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
        max_tokens: 500,
      }),
    });

    if (!llmResponse.ok) {
      throw new Error(`LLM API error: ${llmResponse.statusText}`);
    }

    const llmData = await llmResponse.json();
    let content = llmData.choices?.[0]?.message?.content || '';

    // Trim to character limit
    if (content.length > config.maxChars) {
      content = content.substring(0, config.maxChars - 3) + '...';
    }

    return NextResponse.json({
      success: true,
      platform,
      content,
      characterCount: content.length,
      maxCharacters: config.maxChars,
      trendItemId,
    });
  } catch (error) {
    console.error('Error generating social post:', error);
    return NextResponse.json(
      { error: 'Failed to generate social post' },
      { status: 500 }
    );
  }
}
