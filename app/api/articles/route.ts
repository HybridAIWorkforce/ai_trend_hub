import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    const where: any = {
      ownerUserId: user.id
    };

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { angleSummary: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          sourceTrendItem: {
            select: {
              id: true,
              title: true,
              sourceName: true
            }
          },
          category: {
            select: {
              id: true,
              displayName: true,
              color: true
            }
          },
          versions: {
            select: {
              versionNumber: true,
              createdAt: true
            },
            orderBy: {
              versionNumber: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.article.count({ where })
    ]);

    return NextResponse.json({
      articles,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      sourceTrendItemId,
      categoryId,
      audience,
      goal,
      format,
      tone,
      language,
      angleSummary,
      outlineJson,
      wizardStep,
      wizardDataJson,
      status,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const article = await prisma.article.create({
      data: {
        ownerUserId: user.id,
        title,
        sourceTrendItemId: sourceTrendItemId || null,
        categoryId: categoryId || null,
        audience: audience || '',
        goal: goal || '',
        format: format || '',
        tone: tone || '',
        language: language || 'English',
        angleSummary: angleSummary || '',
        outlineJson: outlineJson || undefined,
        wizardStep: wizardStep || 0,
        wizardDataJson: wizardDataJson || undefined,
        status: status || 'draft',
        publishStatus: 'unpublished',
      },
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}