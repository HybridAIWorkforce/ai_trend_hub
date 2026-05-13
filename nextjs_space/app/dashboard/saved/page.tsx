'use client';

import { useEffect, useState } from 'react';
import { TrendItem, PaginatedResponse } from '@/lib/types';
import { TrendCard } from '@/components/dashboard/trend-card';
import { Loader2, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';

export default function SavedPage() {
  const [items, setItems] = useState<TrendItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, [page]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });
      
      const response = await fetch(`/api/saved?${params}`);
      const data: PaginatedResponse<TrendItem> = await response.json();
      
      setItems(data?.data ?? []);
      setTotal(data?.total ?? 0);
      setTotalPages(data?.totalPages ?? 1);
    } catch (error) {
      console.error('Failed to load saved items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Bookmark className="w-8 h-8 text-blue-400" />
          Saved Items
        </h1>
        <p className="text-zinc-400">
          Your bookmarked trends and articles
        </p>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-zinc-400">
          <span className="text-white font-semibold">{total}</span> saved items
        </p>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : (items?.length ?? 0) > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items?.map((item) => (
              <TrendCard key={item?.id} item={item} onSaveToggle={loadItems} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2 bg-zinc-800/50 text-zinc-400 rounded-lg hover:bg-zinc-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      page === p
                        ? 'bg-blue-500 text-white'
                        : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="p-2 bg-zinc-800/50 text-zinc-400 rounded-lg hover:bg-zinc-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="bg-zinc-800/30 rounded-full p-6 mb-4">
            <Bookmark className="w-12 h-12 text-zinc-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No saved items yet</h3>
          <p className="text-zinc-500 mb-6">Start bookmarking interesting trends to build your collection</p>
        </div>
      )}
    </div>
  );
}
