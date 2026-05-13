'use client';

import { useState } from 'react';
import { Loader2, RefreshCw, Rss } from 'lucide-react';
import { toast } from 'sonner';

export function EmptyState({ onRefreshComplete }: { onRefreshComplete?: () => void }) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/jobs/refresh', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Fetched ${data?.itemsProcessed ?? 0} new items!`);
        onRefreshComplete?.();
      } else {
        toast.error(data?.error ?? 'Refresh failed');
      }
    } catch {
      toast.error('Network error — please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="inline-flex items-center justify-center p-5 bg-blue-500/10 rounded-2xl mb-6">
        {refreshing ? (
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
        ) : (
          <Rss className="w-12 h-12 text-blue-400" />
        )}
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">
        {refreshing ? 'Fetching your trends…' : 'No trends yet'}
      </h3>

      <p className="text-zinc-400 max-w-sm mb-6">
        {refreshing
          ? 'Pulling the latest AI news from RSS feeds and Reddit. This may take a minute.'
          : 'Your feed is empty. Hit the button below to pull in the latest AI trends from all sources.'}
      </p>

      {!refreshing && (
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh Now
        </button>
      )}
    </div>
  );
}
