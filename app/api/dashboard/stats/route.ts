import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session?.user as any)?.id;
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total items
    const totalItems = await prisma.trendItem.count();

    // New items today
    const newToday = await prisma.trendItem.count({
      where: {
        publishedAt: { gte: yesterday },
      },
    });

    // Saved items count
    const savedCount = await prisma.savedItem.count({
      where: { userId },
    });

    // Items by category
    const categories = await prisma.category.findMany({
      where: { active: true },
      include: {
        _count: {
          select: {
            trendItems: {
              where: {
                publishedAt: { gte: lastWeek },
              },
            },
          },
        },
      },
    });

    const byCategory = categories.map((cat: (typeof categories)[number]) => ({
      categoryId: cat.id,
      categoryName: cat.displayName,
      count: cat?._count?.trendItems ?? 0,
    }));

    // Recent items
    const recentItems = await prisma.trendItem.findMany({
      take: 5,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: true,
        source: true,
      },
    });

    // Trending tags
    const allItems = await prisma.trendItem.findMany({
      where: {
        publishedAt: { gte: lastWeek },
      },
      select: { tags: true },
    });

    const tagCounts: Record<string, number> = {};
    for (const item of allItems) {
      for (const tag of item?.tags ?? []) {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      }
    }

    const trendingTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    // Time series data (last 7 days) - real counts from database
    const timeSeriesData: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayCount = await prisma.trendItem.count({
        where: {
          publishedAt: { gte: dayStart, lt: dayEnd },
        },
      });

      timeSeriesData.push({
        date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: dayCount,
      });
    }

    // Last updated (most recent job run)
    const lastJob = await prisma.jobRun.findFirst({
      where: { status: 'success' },
      orderBy: { completedAt: 'desc' },
    });

    return NextResponse.json({
      totalItems,
      newToday,
      savedCount,
      byCategory,
      recentItems,
      trendingTags,
      timeSeriesData,
      lastUpdated: lastJob?.completedAt ?? null,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
