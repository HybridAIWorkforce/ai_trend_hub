'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Save, Download, Share2, RotateCcw, Copy, Check, Sparkles, Twitter, Linkedin, Facebook, RefreshCw, Edit3, Hash, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Article {
  id: string;
  title: string;
  currentContentMarkdown: string | null;
  status: string;
  audience?: string | null;
  goal?: string | null;
  format?: string | null;
  tone?: string | null;
  language?: string | null;
  angleSummary?: string | null;
  sourceTrendItem?: {
    id: string;
    title: string;
    summary?: string | null;
    sourceName: string;
  } | null;
  versions: Array<{
    versionNumber: number;
    createdAt: Date | string;
  }>;
}

interface SocialPost {
  platform: string;
  platformName: string;
  content: string;
  characterCount: number;
  maxCharacters: number;
  hashtags: string[];
  suggestedHashtags?: string[];
  isOverLimit?: boolean;
}

interface ArticleEditorProps {
  article: Article;
}

export function ArticleEditor({ article: initialArticle }: ArticleEditorProps) {
  const router = useRouter();
  const [article, setArticle] = useState(initialArticle);
  const [title, setTitle] = useState(initialArticle.title);
  const [content, setContent] = useState(initialArticle.currentContentMarkdown || '');
  const [status, setStatus] = useState(initialArticle.status);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [socialPostsDialogOpen, setSocialPostsDialogOpen] = useState(false);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [generatingSocial, setGeneratingSocial] = useState(false);
  const [copiedPostIndex, setCopiedPostIndex] = useState<number | null>(null);
  const [editingPostIndex, setEditingPostIndex] = useState<number | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Record<string, boolean>>({
    twitter: true,
    linkedin: true,
    facebook: true,
  });

  const handleSave = async (createVersion = false) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          currentContentMarkdown: content,
          status,
          createVersion
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save article');
      }

      const data = await response.json();
      setArticle(data.article);
      toast.success(createVersion ? 'New version created!' : 'Article saved successfully!');
      if (createVersion) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`Copied as ${format}!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const convertToHTML = (markdown: string) => {
    // Simple markdown to HTML conversion
    let html = markdown;
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    // Wrap in paragraphs
    html = '<p>' + html + '</p>';
    return html;
  };

  const downloadMarkdown = () => {
    const fullContent = `# ${title}\n\n${content}`;
    const blob = new Blob([fullContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded as Markdown!');
  };

  const handleGenerateSocialPosts = async (platforms?: string[]) => {
    setGeneratingSocial(true);
    setSocialPostsDialogOpen(true);
    setEditingPostIndex(null);
    try {
      const activePlatforms = platforms || Object.entries(selectedPlatforms)
        .filter(([, enabled]) => enabled)
        .map(([platform]) => platform);

      if (activePlatforms.length === 0) {
        toast.error('Select at least one platform');
        setGeneratingSocial(false);
        return;
      }

      const response = await fetch(`/api/articles/${article.id}/social-posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platforms: activePlatforms }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate social posts');
      }

      const data = await response.json();
      setSocialPosts(data.socialPosts || []);
      toast.success('Social posts generated in your voice!');
    } catch (error: any) {
      console.error('Error generating social posts:', error);
      toast.error(error.message || 'Failed to generate social posts');
    } finally {
      setGeneratingSocial(false);
    }
  };

  const copyPost = (postContent: string, index: number) => {
    navigator.clipboard.writeText(postContent);
    setCopiedPostIndex(index);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedPostIndex(null), 2000);
  };

  const updatePostContent = useCallback((index: number, newContent: string) => {
    setSocialPosts(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        content: newContent,
        characterCount: newContent.length,
        isOverLimit: newContent.length > updated[index].maxCharacters,
      };
      return updated;
    });
  }, []);

  const swapHashtag = useCallback((postIndex: number, oldTag: string, newTag: string) => {
    setSocialPosts(prev => {
      const updated = [...prev];
      const post = { ...updated[postIndex] };
      // Replace in hashtags list
      post.hashtags = post.hashtags.map(t => t === oldTag ? newTag : t);
      // Replace in content
      post.content = post.content.replace(oldTag, newTag);
      post.characterCount = post.content.length;
      post.isOverLimit = post.content.length > post.maxCharacters;
      // Move old tag to suggested, remove new from suggested
      post.suggestedHashtags = [
        ...(post.suggestedHashtags || []).filter(t => t !== newTag),
        oldTag,
      ];
      updated[postIndex] = post;
      return updated;
    });
    toast.success(`Swapped ${oldTag} → ${newTag}`);
  }, []);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      case 'facebook': return <Facebook className="h-4 w-4" />;
      default: return <Share2 className="h-4 w-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter': return 'text-sky-400';
      case 'linkedin': return 'text-blue-400';
      case 'facebook': return 'text-indigo-400';
      default: return 'text-zinc-400';
    }
  };

  const getCharCountColor = (count: number, max: number) => {
    const ratio = count / max;
    if (ratio > 1) return 'bg-red-500/20 text-red-400';
    if (ratio > 0.9) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-green-500/20 text-green-400';
  };

  // Extract sections from markdown content
  const sections = content.split(/^## /gm).filter(s => s.trim());

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Article Editor</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Version {article.versions[0]?.versionNumber || 1} • Last updated: {new Date(article.versions[0]?.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="ready_to_publish">Ready to Publish</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleSave(false)} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar - Source info */}
        <div className="lg:col-span-1 space-y-4">
          {article.sourceTrendItem && (
            <Card className="p-4 bg-zinc-900/50 border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-400 mb-3">Source Trend</h3>
              <h4 className="text-sm font-medium text-zinc-200 mb-2">
                {article.sourceTrendItem.title}
              </h4>
              <p className="text-xs text-zinc-500 mb-2">
                {article.sourceTrendItem.summary}
              </p>
              <span className="text-xs text-zinc-600">
                {article.sourceTrendItem.sourceName}
              </span>
            </Card>
          )}

          <Card className="p-4 bg-zinc-900/50 border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-400 mb-3">Article Settings</h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-zinc-500">Audience:</span>
                <span className="text-zinc-300 ml-2">{article.audience || 'Not set'}</span>
              </div>
              <div>
                <span className="text-zinc-500">Goal:</span>
                <span className="text-zinc-300 ml-2">{article.goal || 'Not set'}</span>
              </div>
              <div>
                <span className="text-zinc-500">Tone:</span>
                <span className="text-zinc-300 ml-2">{article.tone || 'Not set'}</span>
              </div>
              <div>
                <span className="text-zinc-500">Format:</span>
                <span className="text-zinc-300 ml-2">{article.format || 'Not set'}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-zinc-900/50 border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-400 mb-3">Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleSave(true)}
                disabled={saving}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Save as New Version
              </Button>
              <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Export Article
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Article</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        copyToClipboard(`# ${title}\n\n${content}`, 'Markdown');
                        setExportDialogOpen(false);
                      }}
                    >
                      {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                      Copy as Markdown
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        copyToClipboard(`<h1>${title}</h1>${convertToHTML(content)}`, 'HTML');
                        setExportDialogOpen(false);
                      }}
                    >
                      {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                      Copy as HTML
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        downloadMarkdown();
                        setExportDialogOpen(false);
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download as .md
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleGenerateSocialPosts()}
                disabled={generatingSocial || !content}
              >
                {generatingSocial ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Share2 className="mr-2 h-4 w-4" />
                )}
                Generate Social Posts
              </Button>
            </div>
          </Card>
        </div>

        {/* Main content editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 bg-zinc-900/50 border-zinc-800">
            <div className="mb-4">
              <Label htmlFor="title" className="text-zinc-300">Article Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 text-xl font-semibold"
                placeholder="Enter article title..."
              />
            </div>

            <div>
              <Label htmlFor="content" className="text-zinc-300">Article Content (Markdown)</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={25}
                className="mt-1.5 font-mono text-sm"
                placeholder="Write your article content in markdown..."
              />
            </div>
          </Card>

          {article.angleSummary && (
            <Card className="p-4 bg-zinc-900/50 border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-400 mb-2">Article Angle</h3>
              <p className="text-sm text-zinc-300">{article.angleSummary}</p>
            </Card>
          )}
        </div>
      </div>

      {/* Social Posts Dialog */}
      <Dialog open={socialPostsDialogOpen} onOpenChange={setSocialPostsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-blue-400" />
                Social Media Posts
              </DialogTitle>
              {socialPosts.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerateSocialPosts()}
                  disabled={generatingSocial}
                  className="ml-4"
                >
                  {generatingSocial ? (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-3 w-3" />
                  )}
                  Regenerate
                </Button>
              )}
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              AI-generated posts in your voice. Edit, swap hashtags, and copy to each platform.
            </p>
          </DialogHeader>

          {/* Platform Toggles */}
          {socialPosts.length === 0 && !generatingSocial && (
            <div className="space-y-3 mt-2">
              <p className="text-sm text-zinc-400">Select platforms to generate for:</p>
              <div className="flex gap-3">
                {[
                  { key: 'twitter', label: 'Twitter / X', icon: <Twitter className="h-4 w-4" />, color: 'sky' },
                  { key: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="h-4 w-4" />, color: 'blue' },
                  { key: 'facebook', label: 'Facebook', icon: <Facebook className="h-4 w-4" />, color: 'indigo' },
                ].map(p => (
                  <button
                    key={p.key}
                    onClick={() => togglePlatform(p.key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                      selectedPlatforms[p.key]
                        ? `border-${p.color}-500/50 bg-${p.color}-500/10 text-${p.color}-400`
                        : 'border-zinc-700 bg-zinc-800/30 text-zinc-500'
                    }`}
                  >
                    {p.icon}
                    {p.label}
                  </button>
                ))}
              </div>
              <Button
                onClick={() => handleGenerateSocialPosts()}
                disabled={generatingSocial || !content}
                className="w-full"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Posts
              </Button>
            </div>
          )}

          {generatingSocial && socialPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
              <p className="text-sm text-zinc-400">Generating posts in Jack&apos;s voice...</p>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              {socialPosts.map((post, index) => (
                <Card key={index} className={`p-4 bg-zinc-900/50 border-zinc-800 ${post.isOverLimit ? 'border-red-500/30' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={getPlatformColor(post.platform)}>
                        {getPlatformIcon(post.platform)}
                      </span>
                      <h4 className="font-semibold text-zinc-200">{post.platformName || post.platform}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${getCharCountColor(post.characterCount, post.maxCharacters)}`}>
                        {post.characterCount} / {post.maxCharacters}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingPostIndex(editingPostIndex === index ? null : index)}
                        className="h-8 w-8 p-0"
                        title="Edit post"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyPost(post.content, index)}
                        className="h-8"
                      >
                        {copiedPostIndex === index ? (
                          <><Check className="h-3 w-3 mr-1" /> Copied</>
                        ) : (
                          <><Copy className="h-3 w-3 mr-1" /> Copy</>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Over-limit warning */}
                  {post.isOverLimit && (
                    <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded bg-red-500/10 border border-red-500/20">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                      <p className="text-xs text-red-400">
                        Over limit by {post.characterCount - post.maxCharacters} characters. Edit to shorten.
                      </p>
                    </div>
                  )}

                  {/* Editable or read-only post content */}
                  {editingPostIndex === index ? (
                    <div className="space-y-2">
                      <textarea
                        value={post.content}
                        onChange={(e) => updatePostContent(index, e.target.value)}
                        rows={post.platform === 'linkedin' ? 8 : 4}
                        className="w-full bg-zinc-800 rounded-lg p-3 border border-blue-500/50 text-sm text-zinc-300 focus:outline-none focus:border-blue-400 resize-none font-mono"
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-zinc-500">
                          Editing — changes are immediate. Character count updates live.
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingPostIndex(null)}
                          className="h-7 text-xs"
                        >
                          Done editing
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50 cursor-pointer hover:border-zinc-600/50 transition-colors"
                      onClick={() => setEditingPostIndex(index)}
                      title="Click to edit"
                    >
                      <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                    </div>
                  )}

                  {/* Hashtags section */}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Hash className="h-3 w-3 text-zinc-500" />
                        <span className="text-xs text-zinc-500">Active hashtags</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {post.hashtags.map((tag, i) => (
                          <span key={i} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested hashtags with swap functionality */}
                  {post.suggestedHashtags && post.suggestedHashtags.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="h-3 w-3 text-zinc-500" />
                        <span className="text-xs text-zinc-500">Alternatives — click to swap</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {post.suggestedHashtags.map((tag, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              // Swap with the last active hashtag
                              const lastActive = post.hashtags[post.hashtags.length - 1];
                              if (lastActive) swapHashtag(index, lastActive, tag);
                            }}
                            className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700 hover:border-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                            title={`Click to swap in ${tag}`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}