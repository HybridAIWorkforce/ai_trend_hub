/**
 * Performance Metrics Endpoint
 * Returns request latency, error rates, and slow request information
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import PerformanceMonitor from '@/lib/performance-monitor';
import Logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== 'owner@aitrendhub.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hoursAgo = parseInt(request.nextUrl.searchParams.get('hoursAgo') || '1');
    const includeSlowRequests = request.nextUrl.searchParams.get('slow') === 'true';
    const includeErrors = request.nextUrl.searchParams.get('errors') === 'true';

    const summary = PerformanceMonitor.getSummary();
    const metrics = PerformanceMonitor.getMetricsSince(hoursAgo);

    const response: any = {
      timeRange: `Last ${hoursAgo} hour(s)`,
      totalRequests: metrics.length,
      summary,
      timestamp: new Date().toISOString(),
    };

    if (includeSlowRequests) {
      response.slowRequests = PerformanceMonitor.getSlowRequests(20);
    }

    if (includeErrors) {
      response.recentErrors = PerformanceMonitor.getRecentErrors(20);
    }

    return NextResponse.json(response);
  } catch (error) {
    Logger.error('Failed to fetch performance metrics', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    );
  }
}
