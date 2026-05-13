/**
 * Application Health Check Endpoint
 * Returns system status, database connectivity, and recent error summary
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import Logger from '@/lib/logger';
import PerformanceMonitor from '@/lib/performance-monitor';

export const dynamic = 'force-dynamic';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  database: {
    connected: boolean;
    latency?: number;
  };
  performance: {
    avgResponseTime: number;
    errorRate: number;
    slowRequests: number;
  };
  logs: {
    recentErrors: number;
    recentWarnings: number;
    recentDebugMessages: number;
  };
  uptime: string;
}

const startTime = Date.now();

export async function GET() {
  try {
    // Test database connectivity
    const dbStartTime = Date.now();
    const dbConnected = await testDatabaseConnection();
    const dbLatency = Date.now() - dbStartTime;

    // Get performance metrics
    const perfSummary = PerformanceMonitor.getSummary();
    const avgResponseTime = perfSummary.length > 0
      ? Math.round(perfSummary.reduce((sum, m) => sum + m.avgDuration, 0) / perfSummary.length)
      : 0;
    const avgErrorRate = perfSummary.length > 0
      ? Number((perfSummary.reduce((sum, m) => sum + m.errorRate, 0) / perfSummary.length).toFixed(2))
      : 0;
    const slowRequests = PerformanceMonitor.getSlowRequests(1000).length;

    // Get log summary
    const logSummary = Logger.getLogs(1000);
    const errors = logSummary.filter((l) => l.level === 'ERROR').length;
    const warnings = logSummary.filter((l) => l.level === 'WARN').length;
    const debugs = logSummary.filter((l) => l.level === 'DEBUG').length;

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (!dbConnected || avgErrorRate > 10 || errors > 50) {
      status = 'unhealthy';
    } else if (avgErrorRate > 5 || warnings > 30) {
      status = 'degraded';
    }

    // Calculate uptime
    const uptimeMs = Date.now() - startTime;
    const hours = Math.floor(uptimeMs / (60 * 60 * 1000));
    const minutes = Math.floor((uptimeMs % (60 * 60 * 1000)) / (60 * 1000));

    const health: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        latency: dbLatency,
      },
      performance: {
        avgResponseTime,
        errorRate: avgErrorRate,
        slowRequests,
      },
      logs: {
        recentErrors: errors,
        recentWarnings: warnings,
        recentDebugMessages: debugs,
      },
      uptime: `${hours}h ${minutes}m`,
    };

    const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 202 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    Logger.error('Health check failed', error as Error);
    return NextResponse.json(
      { error: 'Health check failed', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * Test database connection
 */
async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
