import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST: Track a CTA event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { articleId, ctaType, ctaLabel, ctaLink, eventType, platform } = body;

    if (!ctaType || !ctaLabel || !eventType) {
      return NextResponse.json(
        { error: 'ctaType, ctaLabel, and eventType are required' },
        { status: 400 }
      );
    }

    const validEventTypes = ['impression', 'click', 'copy'];
    if (!validEventTypes.includes(eventType)) {
      return NextResponse.json(
        { error: `eventType must be one of: ${validEventTypes.join(', ')}` },
        { status: 400 }
      );
    }

    await prisma.cTAEvent.create({
      data: {
        userId: user.id,
        articleId: articleId || null,
        ctaType,
        ctaLabel: ctaLabel.substring(0, 200),
        ctaLink: (ctaLink || '').substring(0, 500),
        eventType,
        platform: platform || 'web',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking CTA event:', error);
    return NextResponse.json(
      { error: 'Failed to track CTA event' },
      { status: 500 }
    );
  }
}

// GET: Retrieve CTA analytics summary
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Get aggregate counts by CTA type and event type
    const events = await prisma.cTAEvent.groupBy({
      by: ['ctaType', 'eventType'],
      where: {
        userId: user.id,
        createdAt: { gte: since },
      },
      _count: { id: true },
    });

    // Get per-CTA breakdown
    const perCTA = await prisma.cTAEvent.groupBy({
      by: ['ctaType', 'ctaLabel', 'eventType'],
      where: {
        userId: user.id,
        createdAt: { gte: since },
      },
      _count: { id: true },
    });

    // Get recent events
    const recentEvents = await prisma.cTAEvent.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        ctaType: true,
        ctaLabel: true,
        eventType: true,
        platform: true,
        createdAt: true,
      },
    });

    // Build summary
    const summary: Record<string, { impressions: number; clicks: number; copies: number }> = {};
    for (const e of events) {
      if (!summary[e.ctaType]) {
        summary[e.ctaType] = { impressions: 0, clicks: 0, copies: 0 };
      }
      if (e.eventType === 'impression') summary[e.ctaType].impressions = e._count.id;
      if (e.eventType === 'click') summary[e.ctaType].clicks = e._count.id;
      if (e.eventType === 'copy') summary[e.ctaType].copies = e._count.id;
    }

    // Build per-CTA detail
    const details: Record<string, { impressions: number; clicks: number; copies: number }> = {};
    for (const e of perCTA) {
      const key = `${e.ctaType}:${e.ctaLabel}`;
      if (!details[key]) {
        details[key] = { impressions: 0, clicks: 0, copies: 0 };
      }
      if (e.eventType === 'impression') details[key].impressions = e._count.id;
      if (e.eventType === 'click') details[key].clicks = e._count.id;
      if (e.eventType === 'copy') details[key].copies = e._count.id;
    }

    return NextResponse.json({
      summary,
      details,
      recentEvents,
      period: `${days} days`,
    });
  } catch (error) {
    console.error('Error fetching CTA analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CTA analytics' },
      { status: 500 }
    );
  }
}
