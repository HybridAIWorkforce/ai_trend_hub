import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: {
        sourceTrendItem: {
          include: {
            category: true
          }
        },
        category: true,
        versions: {
          orderBy: {
            versionNumber: 'desc'
          }
        }
      }
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ article });

  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, currentContentMarkdown, outlineJson, status, createVersion } = body;

    const article = await prisma.article.findUnique({
      where: { id: params.id }
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Update the article
    const updatedArticle = await prisma.article.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(currentContentMarkdown !== undefined && { currentContentMarkdown }),
        ...(outlineJson !== undefined && { outlineJson }),
        ...(status !== undefined && { status })
      },
      include: {
        sourceTrendItem: true,
        category: true,
        versions: {
          orderBy: {
            versionNumber: 'desc'
          }
        }
      }
    });

    // Create a new version if requested
    if (createVersion) {
      const latestVersion = await prisma.articleVersion.findFirst({
        where: { articleId: params.id },
        orderBy: { versionNumber: 'desc' }
      });

      const newVersionNumber = (latestVersion?.versionNumber || 0) + 1;

      await prisma.articleVersion.create({
        data: {
          articleId: params.id,
          versionNumber: newVersionNumber,
          title: updatedArticle.title,
          outlineJson: updatedArticle.outlineJson || undefined,
          contentMarkdown: updatedArticle.currentContentMarkdown || '',
          metadataJson: {
            audience: updatedArticle.audience,
            goal: updatedArticle.goal,
            format: updatedArticle.format,
            tone: updatedArticle.tone,
            language: updatedArticle.language
          }
        }
      });
    }

    return NextResponse.json({ article: updatedArticle });

  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.article.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}