/**
 * Performance Monitoring System
 * Tracks request latency, API response times, and database query performance
 */

import { NextRequest, NextResponse } from 'next/server';
import Logger from './logger';

export interface PerformanceMetric {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  timestamp: string;
  userId?: string;
}

export interface PerformanceSummary {
  endpoint: string;
  method: string;
  count: number;
  avgDuration: number;
  maxDuration: number;
  minDuration: number;
  errorRate: number; // percentage
}

class PerformanceMonitor {
  private static metrics: PerformanceMetric[] = [];
  private static maxMetrics = 500; // Keep recent metrics
  private static slowThreshold = 1000; // 1 second

  /**
   * Record a request/response metric
   */
  static recordMetric(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number,
    userId?: string
  ) {
    const metric: PerformanceMetric = {
      endpoint,
      method,
      duration,
      statusCode,
      timestamp: new Date().toISOString(),
      userId,
    };

    this.metrics.unshift(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.pop();
    }

    // Alert on slow requests
    if (duration > this.slowThreshold) {
      Logger.warn(`Slow request detected: ${method} ${endpoint} took ${duration}ms`, {
        endpoint,
        method,
        duration,
        userId,
      });
    }

    // Alert on errors
    if (statusCode >= 500) {
      Logger.error(`Server error: ${method} ${endpoint} returned ${statusCode}`, undefined, {
        endpoint,
        method,
        statusCode,
        userId,
      });
    }
  }

  /**
   * Get performance summary by endpoint
   */
  static getSummary(): PerformanceSummary[] {
    const grouped = new Map<string, PerformanceMetric[]>();

    this.metrics.forEach((metric) => {
      const key = `${metric.method} ${metric.endpoint}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(metric);
    });

    return Array.from(grouped.entries()).map(([key, metrics]) => {
      const [method, endpoint] = key.split(' ');
      const durations = metrics.map((m) => m.duration);
      const errors = metrics.filter((m) => m.statusCode >= 400).length;

      return {
        endpoint,
        method,
        count: metrics.length,
        avgDuration: Math.round(durations.reduce((a, b) => a + b, 0) / metrics.length),
        maxDuration: Math.max(...durations),
        minDuration: Math.min(...durations),
        errorRate: Number(((errors / metrics.length) * 100).toFixed(2)),
      };
    });
  }

  /**
   * Get recent slow requests
   */
  static getSlowRequests(limit: number = 10): PerformanceMetric[] {
    return this.metrics
      .filter((m) => m.duration > this.slowThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Get recent errors
   */
  static getRecentErrors(limit: number = 10): PerformanceMetric[] {
    return this.metrics
      .filter((m) => m.statusCode >= 400)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get metrics for last N hours
   */
  static getMetricsSince(hoursAgo: number): PerformanceMetric[] {
    const cutoff = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    return this.metrics.filter((m) => new Date(m.timestamp) > cutoff);
  }

  /**
   * Clear metrics
   */
  static clear() {
    this.metrics = [];
  }
}

export default PerformanceMonitor;
