'use client';

import { useEffect, useState } from 'react';
import { DashboardStats, TimeSeriesDataPoint } from '@/lib/types';
import { StatsCard } from '@/components/dashboard/stats-card';
import { TimeSeriesChart } from '@/components/dashboard/time-series-chart';
import { CategoryChart } from '@/components/dashboard/category-chart';
import { TrendCard } from '@/components/dashboard/trend-card';
import { 
  TrendingUp, 
  FileText, 
  Bookmark, 
  Clock,
  Loader2 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { OnboardingModal } from '@/components/dashboard/onboarding-modal';
import { EmptyState } from '@/components/dashboard/empty-state';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setStats(data);
      
      // Use real time series data from API
      if (data?.timeSeriesData) {
        setTimeSeriesData(data.timeSeriesData);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  const isEmpty = (stats?.totalItems ?? 0) === 0;

  if (isEmpty) {
    return (
      <div className="space-y-6">
        <OnboardingModal />
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-zinc-400">Track all your AI trends in one place</p>
        </div>
        <EmptyState onRefreshComplete={loadStats} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Onboarding modal — only shows on first visit */}
      <OnboardingModal />

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-zinc-400">Track all your AI trends in one place</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Items"
          value={stats?.totalItems ?? 0}
          icon={FileText}
          color="#60B5FF"
        />
        <StatsCard
          title="New Today"
          value={stats?.newToday ?? 0}
          icon={TrendingUp}
          color="#FF9149"
        />
        <StatsCard
          title="Saved Items"
          value={stats?.savedCount ?? 0}
          icon={Bookmark}
          color="#FF90BB"
        />
        <StatsCard
          title="Last Updated"
          value={0}
          subtitle={stats?.lastUpdated ? formatDistanceToNow(new Date(stats.lastUpdated), { addSuffix: true }) : 'Never'}
          icon={Clock}
          color="#80D8C3"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeSeriesChart
          data={timeSeriesData}
          title="AI Buzz - Last 7 Days"
          color="#60B5FF"
        />
        <CategoryChart
          data={stats?.byCategory ?? []}
          title="Trends by Category (Last 7 Days)"
        />
      </div>

      {/* Trending Tags */}
      {(stats?.trendingTags?.length ?? 0) > 0 && (
        <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 border border-zinc-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Trending Tags</h3>
          <div className="flex flex-wrap gap-3">
            {stats?.trendingTags?.slice(0, 15).map((tag) => (
              <button
                key={tag?.tag}
                onClick={() => {
                  const firstCat = stats?.byCategory?.[0];
                  if (firstCat?.categoryId) {
                    router.push(`/dashboard/category/${firstCat.categoryId}?search=${encodeURIComponent(tag?.tag ?? '')}`);
                  }
                }}
                className="flex items-center gap-2 bg-zinc-800/50 px-4 py-2 rounded-lg border border-zinc-700 hover:border-blue-500/50 hover:bg-blue-500/10 transition-colors cursor-pointer"
              >
                <span className="text-white font-medium">{tag?.tag ?? 'Unknown'}</span>
                <span className="text-xs text-zinc-500 bg-zinc-700 px-2 py-1 rounded">
                  {tag?.count ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Items */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Recent Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats?.recentItems?.map((item) => (
            <TrendCard key={item?.id} item={item} onSaveToggle={loadStats} />
          ))}
        </div>
      </div>
    </div>
  );
}
