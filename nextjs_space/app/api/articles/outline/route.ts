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
    const { trendItemId, angle, title, audience, goal, tone, format, language } = body;

    if (!trendItemId || !angle || !title) {
      return NextResponse.json(
        { error: 'Trend item ID, angle, and title are required' },
        { status: 400 }
      );
    }

    // Fetch the trend item
    const trendItem = await prisma.trendItem.findUnique({
      where: { id: trendItemId },
      include: { category: true }
    });

    if (!trendItem) {
      return NextResponse.json({ error: 'Trend item not found' }, { status: 404 });
    }

    // Determine word count target
    let wordCountTarget = '1000-1500 words';
    if (format === 'short_blog') {
      wordCountTarget = '600-800 words';
    } else if (format === 'deep_dive') {
      wordCountTarget = '2000+ words';
    }

    // Prepare the prompt for outline generation
    const prompt = `You are an expert content writer. Create a detailed article outline based on the following information.

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

**Article Requirements:**
Audience: ${audience || 'General tech-savvy professionals'}
Goal: ${goal || 'Educate'}
Tone: ${tone || 'Professional'}
Target Length: ${wordCountTarget}
Language: ${language || 'English'}

**Instructions:**
Create a hierarchical outline with:
1. Introduction section (with key points to cover)
2. 3-5 main body sections (each with a heading and 3-5 bullet points)
3. Conclusion/CTA section (with key takeaways)

Each section should have:
- A compelling heading
- 3-5 bullet points outlining what will be covered

Respond in JSON format with the following structure:
{
  "outline": {
    "introduction": {
      "heading": "Introduction",
      "points": ["Point 1", "Point 2", "Point 3"]
    },
    "sections": [
      {
        "heading": "Section heading",
        "points": ["Point 1", "Point 2", "Point 3"]
      }
    ],
    "conclusion": {
      "heading": "Conclusion",
      "points": ["Point 1", "Point 2", "Point 3"]
    }
  }
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
        temperature: 0.7
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
      outline: result.outline
    });

  } catch (error) {
    console.error('Error generating article outline:', error);
    return NextResponse.json(
      { error: 'Failed to generate article outline' },
      { status: 500 }
    );
  }
}