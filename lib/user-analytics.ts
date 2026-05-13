/**
 * User Interaction Analytics
 * Tracks user actions like article creation, social post generation, CTA interactions
 */

import { prisma } from './db';
import Logger from './logger';

export enum UserAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  VIEW_DASHBOARD = 'view_dashboard',
  VIEW_CATEGORY = 'view_category',
  SAVE_ITEM = 'save_item',
  UNSAVE_ITEM = 'unsave_item',
  CREATE_ARTICLE = 'create_article',
  GENERATE_OUTLINE = 'generate_outline',
  GENERATE_DRAFT = 'generate_draft',
  GENERATE_SOCIAL_POST = 'generate_social_post',
  EDIT_ARTICLE = 'edit_article',
  PUBLISH_ARTICLE = 'publish_article',
  VIEW_SETTINGS = 'view_settings',
  UPDATE_CTA_SETTINGS = 'update_cta_settings',
}

export interface UserAnalyticsEvent {
  userId: string;
  action: UserAction;
  timestamp: string;
  metadata?: Record<string, any>;
}

class UserAnalytics {
  /**
   * Track a user action (in-memory buffer, could be extended to log to DB or external service)
   */
  private static eventBuffer: UserAnalyticsEvent[] = [];
  private static maxBufferSize = 1000;

  static trackAction(
    userId: string,
    action: UserAction,
    metadata?: Record<string, any>
  ) {
    const event: UserAnalyticsEvent = {
      userId,
      action,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.eventBuffer.unshift(event);
    if (this.eventBuffer.length > this.maxBufferSize) {
      this.eventBuffer.pop();
    }

    Logger.debug(`User action: ${action}`, {
      userId,
      metadata,
    });
  }

  /**
   * Get user action history
   */
  static getUserHistory(userId: string, limit: number = 50): UserAnalyticsEvent[] {
    return this.eventBuffer.filter((e) => e.userId === userId).slice(0, limit);
  }

  /**
   * Get action summary
   */
  static getActionSummary(): Record<UserAction, number> {
    const summary = {} as Record<UserAction, number>;

    this.eventBuffer.forEach((event) => {
      summary[event.action] = (summary[event.action] || 0) + 1;
    });

    return summary;
  }

  /**
   * Get most active users (last 7 days)
   */
  static getMostActiveUsers(limit: number = 10): Array<{ userId: string; count: number }> {
    const userCounts = new Map<string, number>();

    this.eventBuffer.forEach((event) => {
      const eventDate = new Date(event.timestamp);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (eventDate > sevenDaysAgo) {
        userCounts.set(event.userId, (userCounts.get(event.userId) || 0) + 1);
      }
    });

    return Array.from(userCounts.entries())
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Clear buffer
   */
  static clear() {
    this.eventBuffer = [];
  }
}

export default UserAnalytics;
