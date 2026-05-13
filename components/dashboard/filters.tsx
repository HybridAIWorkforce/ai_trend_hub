'use client';

import { useState, useEffect } from 'react';
import { Filter, Search, X } from 'lucide-react';
import { Category } from '@/lib/types';

interface FiltersProps {
  categories?: Category[];
  selectedCategoryId?: string;
  selectedTimeRange?: string;
  searchQuery?: string;
  onCategoryChange?: (categoryId: string) => void;
  onTimeRangeChange?: (timeRange: string) => void;
  onSearchChange?: (query: string) => void;
}

export function Filters({
  categories = [],
  selectedCategoryId,
  selectedTimeRange = '7d',
  searchQuery = '',
  onCategoryChange,
  onTimeRangeChange,
  onSearchChange,
}: FiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search - filters as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange?.(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange?.(localSearch);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    onSearchChange?.('');
  };

  const timeRanges = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 border border-zinc-800/50 rounded-lg p-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search trends..."
            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-10 pr-10 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {localSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-3 transition-colors"
      >
        <Filter className="w-4 h-4" />
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      {/* Filters */}
      {showFilters && (
        <div className="space-y-4">
          {/* Time Range */}
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Time Range</label>
            <div className="flex flex-wrap gap-2">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => onTimeRangeChange?.(range.value)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    selectedTimeRange === range.value
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                      : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          {(categories?.length ?? 0) > 0 && (
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onCategoryChange?.('')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    !selectedCategoryId
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                      : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  All
                </button>
                {categories?.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => onCategoryChange?.(category.id)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      selectedCategoryId === category.id
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                        : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    {category?.displayName ?? 'Unknown'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
