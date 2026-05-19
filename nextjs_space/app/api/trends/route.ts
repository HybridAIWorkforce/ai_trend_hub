import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId') || undefined;
    const sourceType = searchParams.get('sourceType') || undefined;
    const timeRange = searchParams.get('timeRange') || '7d';
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'publishedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Calculate time filter
    let publishedAfter: Date | undefined;
    if (timeRange !== 'all') {
      const now = new Date();
      switch (timeRange) {
        case '24h':
          publishedAfter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          publishedAfter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          publishedAfter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    // Build where clause
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (sourceType) where.sourceType = sourceType;
    if (publishedAfter) where.publishedAt = { gte: publishedAfter };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.trendItem.count({ where });

    // Get items with pagination
    const items = await prisma.trendItem.findMany({
      where,
      include: {
        category: true,
        source: true,
        savedItems: {
          where: { userId: (session?.user as any)?.id },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Add isSaved flag
    const itemsWithSaved = items.map((item: (typeof items)[number]) => ({
      ...item,
      isSaved: (item?.savedItems?.length ?? 0) > 0,
      savedItems: undefined,
    }));

    return NextResponse.json({
      data: itemsWithSaved,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
