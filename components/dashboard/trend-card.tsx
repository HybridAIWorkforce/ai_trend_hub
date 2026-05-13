'use client';

import { TrendItem } from '@/lib/types';
import { Bookmark, ExternalLink, MessageCircle, TrendingUp, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { FreshnessBadge } from './freshness-badge';

interface TrendCardProps {
  item: TrendItem;
  onSaveToggle?: () => void;
}

export function TrendCard({ item, onSaveToggle }: TrendCardProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSaveToggle = async () => {
    setSaving(true);
    try {
      if (item?.isSaved) {
        await fetch(`/api/saved?trendItemId=${item.id}`, {
          method: 'DELETE',
        });
        toast.success('Item removed from saved');
      } else {
        await fetch('/api/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trendItemId: item.id }),
        });
        toast.success('Item saved successfully');
      }
      onSaveToggle?.();
    } catch (error) {
      toast.error('Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 border border-zinc-800/50 rounded-lg p-6 hover:border-zinc-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <a
            href={item?.link ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2 cursor-pointer">
              {item?.title ?? 'Untitled'}
            </h3>
          </a>
          <div className="flex items-center gap-3 mt-2 text-sm text-zinc-400">
            <span className="flex items-center gap-1">
              {item?.sourceType === 'reddit' && <MessageCircle className="w-3 h-3" />}
              {item?.sourceName ?? 'Unknown Source'}
            </span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(item?.publishedAt ?? new Date()), { addSuffix: true })}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          {/* Content Freshness Badge */}
          <FreshnessBadge publishedAt={item?.publishedAt ?? new Date().toISOString()} />
          
          {/* Trend Score Badge */}
          {(item?.trendScore ?? 0) > 50 && (
            <div className="flex items-center gap-1 bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs font-medium">
              <TrendingUp className="w-3 h-3" />
              {Math.round(item?.trendScore ?? 0)}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {item?.summary && (
        <p className="text-zinc-300 text-sm line-clamp-3 mb-4">
          {item.summary}
        </p>
      )}

      {/* Reddit Stats */}
      {item?.sourceType === 'reddit' && (
        <div className="flex items-center gap-4 mb-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {item?.score ?? 0} upvotes
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {item?.numComments ?? 0} comments
          </span>
          {item?.subreddit && (
            <a
              href={`https://www.reddit.com/r/${item.subreddit}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
            >
              r/{item.subreddit}
            </a>
          )}
        </div>
      )}

      {/* Tags */}
      {(item?.tags?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {item?.tags?.slice(0, 5).map((tag, idx) => (
            <span
              key={idx}
              className="bg-zinc-800/50 text-zinc-400 px-2 py-1 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/50">
        <button
          onClick={handleSaveToggle}
          disabled={saving}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            item?.isSaved
              ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
              : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${item?.isSaved ? 'fill-current' : ''}`} />
          {item?.isSaved ? 'Saved' : 'Save'}
        </button>
        
        <button
          onClick={() => router.push(`/dashboard/articles/new?trendItemId=${item?.id}`)}
          className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
        >
          <FileText className="w-4 h-4" />
          Create Article
        </button>
        
        <a
          href={item?.link ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open Source
        </a>
      </div>
    </div>
  );
}
