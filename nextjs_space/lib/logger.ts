/**
 * Structured Logging System for AI Trend Hub
 * Provides consistent logging across the application with multiple output levels and context tracking
 */

import { NextRequest } from 'next/server';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface LogContext {
  requestId?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  duration?: number;
  statusCode?: number;
  error?: Error | string;
  metadata?: Record<string, any>;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  stack?: string;
}

class Logger {
  private static logs: LogEntry[] = [];
  private static maxLogs = 1000; // Keep last 1000 logs in memory

  /**
   * Format log entry for console output
   */
  private static formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context } = entry;
    const contextStr = context.requestId ? ` [${context.requestId}]` : '';
    const userStr = context.userId ? ` User:${context.userId}` : '';
    const endpointStr = context.endpoint ? ` ${context.method || 'GET'} ${context.endpoint}` : '';
    const durationStr = context.duration ? ` (${context.duration}ms)` : '';

    return `[${timestamp}] ${level}${contextStr}${userStr}${endpointStr}${durationStr}: ${message}`;
  }

  /**
   * Log a message with optional context
   */
  private static log(level: LogLevel, message: string, context: LogContext = {}) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    // Store in memory for retrieval via monitoring API
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // Console output for server logs
    const formatted = this.formatLog(entry);
    const levelColor = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m', // Green
      WARN: '\x1b[33m', // Yellow
      ERROR: '\x1b[31m', // Red
      CRITICAL: '\x1b[35m', // Magenta
    }[level];

    console.log(`${levelColor}${formatted}\x1b[0m`);

    // Log stack trace for errors
    if (context.error instanceof Error && context.error.stack) {
      console.log(context.error.stack);
    }
  }

  static debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, context);
  }

  static info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  static warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context);
  }

  static error(message: string, error?: Error | string, context?: LogContext) {
    const ctx = {
      ...context,
      error,
    };
    this.log(LogLevel.ERROR, message, ctx);
  }

  static critical(message: string, error?: Error | string, context?: LogContext) {
    const ctx = {
      ...context,
      error,
    };
    this.log(LogLevel.CRITICAL, message, ctx);
  }

  /**
   * Get recent logs (for monitoring API)
   */
  static getLogs(limit: number = 100, level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter((log) => log.level === level).slice(0, limit);
    }
    return this.logs.slice(0, limit);
  }

  /**
   * Get logs by level distribution
   */
  static getLogSummary(): Record<LogLevel, number> {
    const summary = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.ERROR]: 0,
      [LogLevel.CRITICAL]: 0,
    };

    this.logs.forEach((log) => {
      summary[log.level]++;
    });

    return summary;
  }

  /**
   * Clear old logs
   */
  static clear() {
    this.logs = [];
  }
}

export default Logger;
