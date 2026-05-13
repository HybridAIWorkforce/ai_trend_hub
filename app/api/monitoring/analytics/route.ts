import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import Logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== 'owner@aitrendhub.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const daysAgo = parseInt(request.nextUrl.searchParams.get('days') || '7');
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    const totalUsers = await prisma.user.count();
    const articlesCreated = await prisma.article.count({
      where: { createdAt: { gte: startDate } },
    });
    const savedItems = await prisma.savedItem.count({
      where: { createdAt: { gte: startDate } },
    });

    const analytics = {
      period: {
        days: daysAgo,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
      users: { total: totalUsers },
      engagement: {
        articlesCreated,
        itemsSaved: savedItems,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(analytics);
  } catch (error) {
    Logger.error('Failed to fetch analytics', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}