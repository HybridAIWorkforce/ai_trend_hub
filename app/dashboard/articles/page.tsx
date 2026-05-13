'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Search, FileText, Calendar, Tag, Globe, AlertTriangle, Clock, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface Article {
  id: string;
  title: string;
  status: string;
  publishStatus: string;
  publishedAt?: string;
  publishError?: string;
  wizardStep?: number;
  createdAt: string;
  updatedAt: string;
  angleSummary?: string;
  currentContentMarkdown?: string | null;
  sourceTrendItem?: {
    id: string;
    title: string;
    sourceName: string;
  };
  category?: {
    id: string;
    displayName: string;
    color?: string;
  };
  versions: Array<{
    versionNumber: number;
  }>;
}

export default function ArticlesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('categoryId') || 'all');
  const [categories, setCategories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [search, statusFilter, categoryFilter, page]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter && categoryFilter !== 'all') params.append('categoryId', categoryFilter);
      params.append('page', page.toString());

      const response = await fetch(`/api/articles?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }

      const data = await response.json();
      setArticles(data.articles || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-zinc-800 text-zinc-300';
      case 'ready_to_publish':
        return 'bg-green-900/30 text-green-400 border-green-800';
      case 'archived':
        return 'bg-zinc-900/50 text-zinc-600';
      default:
        return 'bg-zinc-800 text-zinc-300';
    }
  };

  const getPublishStatusBadge = (article: Article) => {
    const ps = article.publishStatus || 'unpublished';
    switch (ps) {
      case 'published':
        return (
          <Badge className="bg-emerald-900/30 text-emerald-400 border-emerald-700 gap-1">
            <Globe className="w-3 h-3" />Published
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-900/30 text-red-400 border-red-700 gap-1" title={article.publishError || 'Publish failed'}>
            <AlertTriangle className="w-3 h-3" />Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-zinc-800/60 text-zinc-500 gap-1">
            <Edit3 className="w-3 h-3" />Draft
          </Badge>
        );
    }
  };

  const isIncompleteDraft = (article: Article) => {
    return article.status === 'draft' && !article.currentContentMarkdown && (article.wizardStep ?? 0) > 0;
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Articles</h1>
          <p className="text-zinc-400">Manage your AI-generated articles</p>
        </div>
        <Button onClick={() => router.push('/dashboard')}>
          <Plus className="mr-2 h-4 w-4" />
          Create from Trend
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-zinc-900/50 border-zinc-800 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="ready_to_publish">Ready to Publish</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Articles Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : articles.length === 0 ? (
        <Card className="p-12 text-center bg-zinc-900/50 border-zinc-800">
          <FileText className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-300 mb-2">No articles found</h3>
          <p className="text-sm text-zinc-500 mb-4">
            Start creating articles from your trending items
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            <Plus className="mr-2 h-4 w-4" />
            Create from Trend
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="p-6 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                onClick={() => router.push(`/dashboard/articles/${article.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-zinc-100">
                        {article.title}
                      </h3>
                      <Badge className={getStatusColor(article.status)}>
                        {formatStatus(article.status)}
                      </Badge>
                      {getPublishStatusBadge(article)}
                      {isIncompleteDraft(article) && (
                        <Badge className="bg-amber-900/30 text-amber-400 border-amber-700 gap-1">
                          <Clock className="w-3 h-3" />Incomplete — Resume
                        </Badge>
                      )}
                    </div>
                    
                    {article.angleSummary && (
                      <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                        {article.angleSummary}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-zinc-600 flex-wrap">
                      {article.sourceTrendItem && (
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          From: {article.sourceTrendItem.title.substring(0, 40)}...
                        </span>
                      )}
                      {article.category && (
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {article.category.displayName}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(article.createdAt).toLocaleDateString()}
                      </span>
                      <span>
                        v{article.versions[0]?.versionNumber || 1}
                      </span>
                      {article.publishStatus === 'published' && article.publishedAt && (
                        <span className="text-emerald-500 flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          Published {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/articles/${article.id}`);
                      }}
                    >
                      {isIncompleteDraft(article) ? 'Resume' : 'Edit'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-zinc-400">
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(total / 20)}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}