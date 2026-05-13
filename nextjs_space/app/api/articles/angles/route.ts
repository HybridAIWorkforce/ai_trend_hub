import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { trendItemId, audience, goal, tone, format, language } = body;

    if (!trendItemId) {
      return NextResponse.json({ error: 'Trend item ID is required' }, { status: 400 });
    }

    // Fetch the trend item
    const trendItem = await prisma.trendItem.findUnique({
      where: { id: trendItemId },
      include: { category: true }
    });

    if (!trendItem) {
      return NextResponse.json({ error: 'Trend item not found' }, { status: 404 });
    }

    // Prepare the prompt for angle generation
    const prompt = `You are an expert content strategist. Based on the following AI trend/news item, generate 4 unique article angles.

**Trend Information:**
Title: ${trendItem.title}
Summary: ${trendItem.summary || 'No summary available'}
Source: ${trendItem.sourceName}
Category: ${trendItem.category.displayName}
Link: ${trendItem.link}

**Article Requirements:**
Audience: ${audience || 'General tech-savvy professionals'}
Goal: ${goal || 'Educate'}
Tone: ${tone || 'Professional'}
Format: ${format || 'Standard blog (1000-1500 words)'}
Language: ${language || 'English'}

**Instructions:**
For each angle, provide:
1. A concise angle description (2-3 sentences explaining the unique perspective)
2. A compelling article title that captures attention

The angles should be diverse, covering different aspects like:
- Practical implications and how-to guides
- Industry analysis and trends
- Thought leadership and future predictions
- Case studies and real-world applications

Respond in JSON format with the following structure:
{
  "angles": [
    {
      "description": "Angle description here",
      "title": "Compelling article title here"
    }
  ]
}

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`;

    // Call the LLM API
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
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.8
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content returned from LLM API');
    }

    const result = JSON.parse(content);

    return NextResponse.json({
      success: true,
      angles: result.angles || []
    });

  } catch (error) {
    console.error('Error generating article angles:', error);
    return NextResponse.json(
      { error: 'Failed to generate article angles' },
      { status: 500 }
    );
  }
}