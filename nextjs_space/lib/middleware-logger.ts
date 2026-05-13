/**
 * Middleware for request/response logging and performance tracking
 * Should be used in middleware.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import Logger from './logger';
import PerformanceMonitor from './performance-monitor';

/**
 * Generate or retrieve request ID from headers
 */
export function getRequestId(request: NextRequest): string {
  const existingId = request.headers.get('x-request-id');
  return existingId || uuidv4();
}

/**
 * Log incoming request
 */
export function logIncomingRequest(
  requestId: string,
  method: string,
  pathname: string,
  userId?: string
) {
  Logger.info(`Incoming request: ${method} ${pathname}`, {
    requestId,
    method,
    endpoint: pathname,
    userId,
  });
}

/**
 * Log completed request with performance metrics
 */
export function logCompletedRequest(
  requestId: string,
  method: string,
  pathname: string,
  statusCode: number,
  duration: number,
  userId?: string
) {
  const message = `${method} ${pathname} returned ${statusCode} in ${duration}ms`;
  const context = {
    requestId,
    method,
    endpoint: pathname,
    statusCode,
    duration,
    userId,
  };

  if (statusCode >= 500) {
    Logger.error(message, undefined, context);
  } else if (statusCode >= 400) {
    Logger.warn(message, context);
  } else if (statusCode >= 300) {
    Logger.warn(message, context);
  } else {
    Logger.info(message, context);
  }

  // Record performance metric
  PerformanceMonitor.recordMetric(pathname, method, duration, statusCode, userId);
}
