// Core type definitions for AI Trend Hub

export interface TrendItem {
  id: string;
  sourceType: 'rss' | 'reddit' | 'api';
  sourceId: string;
  categoryId: string;
  title: string;
  summary?: string;
  content?: string;
  link: string;
  sourceName: string;
  subreddit?: string;
  score?: number;
  numComments?: number;
  tags: string[];
  trendScore: number;
  publishedAt: Date;
  fetchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  source?: Source;
  isSaved?: boolean;
}

export interface Category {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  active: boolean;
}

export interface Source {
  id: string;
  type: 'rss' | 'reddit' | 'api';
  name: string;
  url?: string;
  feedUrl?: string;
  subreddit?: string;
  apiEndpoint?: string;
  categoryId: string;
  active: boolean;
  lastFetchedAt?: Date;
  fetchInterval: number;
}

export interface SavedItem {
  id: string;
  userId: string;
  trendItemId: string;
  notes?: string;
  createdAt: Date;
  trendItem?: TrendItem;
}

export interface DashboardStats {
  totalItems: number;
  newToday: number;
  savedCount: number;
  byCategory: {
    categoryId: string;
    categoryName: string;
    count: number;
  }[];
  recentItems: TrendItem[];
  trendingTags: {
    tag: string;
    count: number;
  }[];
  lastUpdated?: Date;
}

export interface FilterOptions {
  categoryId?: string;
  sourceType?: string;
  timeRange?: '24h' | '7d' | '30d' | 'all';
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'publishedAt' | 'trendScore' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  count: number;
  category?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}
