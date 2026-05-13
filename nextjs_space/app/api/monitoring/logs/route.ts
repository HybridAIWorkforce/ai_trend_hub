/**
 * Logs Monitoring Endpoint
 * Returns recent application logs for debugging and monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import Logger, { LogLevel } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check authentication (only admin/owner can view logs)
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== 'owner@aitrendhub.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100');
    const level = request.nextUrl.searchParams.get('level') as LogLevel | null;

    const logs = Logger.getLogs(limit, level || undefined);
    const summary = Logger.getLogSummary();

    return NextResponse.json({
      count: logs.length,
      summary,
      logs,
    });
  } catch (error) {
    Logger.error('Failed to fetch logs', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
