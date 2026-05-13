import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json();
    const { articleId, sectionIndex, sectionHeading, instructions } = body;

    if (!articleId || sectionIndex === undefined) {
      return new Response(
        JSON.stringify({ error: 'Article ID and section index are required' }),
        { status: 400 }
      );
    }

    // Fetch the article
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { sourceTrendItem: true }
    });

    if (!article) {
      return new Response(JSON.stringify({ error: 'Article not found' }), { status: 404 });
    }

    // Extract the current section content
    const contentLines = article.currentContentMarkdown?.split('\n') || [];
    let currentSectionContent = '';
    let inSection = false;
    let sectionCount = -1;

    for (const line of contentLines) {
      if (line.startsWith('## ')) {
        sectionCount++;
        if (sectionCount === sectionIndex) {
          inSection = true;
          continue;
        } else if (inSection) {
          break;
        }
      }
      if (inSection) {
        currentSectionContent += line + '\n';
      }
    }

    // Prepare the prompt for section regeneration
    const prompt = `You are an expert content writer. Regenerate the following section of an article.

**Article Title:**
${article.title}

**Section Heading:**
${sectionHeading}

**Current Section Content:**
${currentSectionContent}

**Regeneration Instructions:**
${instructions || 'Improve the section to be more engaging and informative'}

**Article Context:**
Audience: ${article.audience || 'General tech-savvy professionals'}
Tone: ${article.tone || 'Professional'}
Goal: ${article.goal || 'Educate'}

**Instructions:**
1. Rewrite the section content following the instructions
2. Maintain consistency with the article's tone and style
3. Use markdown formatting
4. Keep the same general structure unless instructed otherwise
5. Do NOT include the section heading (it will be added separately)

Write only the section content in markdown format.`;

    // Stream the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
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
              max_tokens: 2000,
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
                  // Send completion message with the regenerated content
                  const finalData = JSON.stringify({
                    status: 'completed',
                    content: buffer
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
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'error', message: 'Failed to regenerate section' })}\n\n`));
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
    console.error('Error regenerating section:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to regenerate section' }),
      { status: 500 }
    );
  }
}