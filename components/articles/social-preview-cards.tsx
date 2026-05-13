'use client';

import { useState } from 'react';
import { Copy, Check, Edit3, Hash, X } from 'lucide-react';
import { toast } from 'sonner';

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

interface SocialPreviewCardsProps {
  posts: SocialPost[];
  onUpdatePost?: (index: number, content: string) => void;
}

export function SocialPreviewCards({ posts, onUpdatePost }: SocialPreviewCardsProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyPost = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(idx);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const startEdit = (idx: number, content: string) => {
    setEditingIndex(idx);
    setEditContent(content);
  };

  const saveEdit = (idx: number) => {
    onUpdatePost?.(idx, editContent);
    setEditingIndex(null);
  };

  const getCharColor = (count: number, max: number) => {
    const ratio = count / max;
    if (ratio > 1) return 'text-red-400';
    if (ratio > 0.9) return 'text-amber-400';
    return 'text-zinc-500';
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {posts.map((post, idx) => {
        const isEditing = editingIndex === idx;
        const isCopied = copiedIndex === idx;

        if (post.platform === 'twitter') {
          return (
            <div key={idx} className="rounded-2xl overflow-hidden">
              <div className="bg-black border border-zinc-800 rounded-2xl p-4">
                {/* Twitter/X header */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    JW
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-white text-sm">Jack Whatley</span>
                      <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
                      </svg>
                      <span className="text-zinc-500 text-sm">@jackwhatley · now</span>
                    </div>
                    {isEditing ? (
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full mt-2 bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white text-sm resize-none"
                        rows={4}
                      />
                    ) : (
                      <p className="text-white text-sm mt-1 whitespace-pre-wrap leading-relaxed">
                        {post.content}
                      </p>
                    )}
                    {/* Engagement bar */}
                    <div className="flex items-center justify-between mt-3 text-zinc-600 text-xs">
                      <span>💬 12</span>
                      <span>🔁 48</span>
                      <span>❤️ 234</span>
                      <span>📊 1.2K</span>
                    </div>
                  </div>
                </div>
                {/* Controls */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
                  <span className={`text-xs font-mono ${getCharColor(post.characterCount, post.maxCharacters)}`}>
                    {post.characterCount}/{post.maxCharacters}
                  </span>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button onClick={() => setEditingIndex(null)} className="text-xs text-zinc-500 hover:text-white">Cancel</button>
                        <button onClick={() => saveEdit(idx)} className="text-xs text-blue-400 hover:text-blue-300 font-semibold">Save</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(idx, post.content)} className="text-zinc-500 hover:text-white"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => copyPost(post.content, idx)} className="text-zinc-500 hover:text-white">
                          {isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-zinc-600 mt-1">Twitter / X Preview</p>
            </div>
          );
        }

        if (post.platform === 'linkedin') {
          return (
            <div key={idx} className="rounded-2xl overflow-hidden">
              <div className="bg-white border border-zinc-200 rounded-lg p-4">
                {/* LinkedIn header */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    JW
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 text-sm">Jack Whatley</p>
                    <p className="text-xs text-zinc-500">AI & Business Transformation Strategist | Author</p>
                    <p className="text-xs text-zinc-400">Just now · 🌐</p>
                  </div>
                </div>
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full mt-3 bg-zinc-100 border border-zinc-300 rounded-lg p-2 text-zinc-900 text-sm resize-none"
                    rows={6}
                  />
                ) : (
                  <p className="text-zinc-800 text-sm mt-3 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>
                )}
                {/* Engagement */}
                <div className="flex items-center gap-2 mt-3 text-xs text-zinc-500">
                  <span>👍 47</span>
                  <span>·</span>
                  <span>8 comments</span>
                  <span>·</span>
                  <span>3 reposts</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-200">
                  <span className={`text-xs font-mono ${getCharColor(post.characterCount, post.maxCharacters).replace('text-zinc-500', 'text-zinc-400')}`}>
                    {post.characterCount}/{post.maxCharacters}
                  </span>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button onClick={() => setEditingIndex(null)} className="text-xs text-zinc-400 hover:text-zinc-700">Cancel</button>
                        <button onClick={() => saveEdit(idx)} className="text-xs text-blue-600 hover:text-blue-700 font-semibold">Save</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(idx, post.content)} className="text-zinc-400 hover:text-zinc-700"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => copyPost(post.content, idx)} className="text-zinc-400 hover:text-zinc-700">
                          {isCopied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-zinc-600 mt-1">LinkedIn Preview</p>
            </div>
          );
        }

        if (post.platform === 'facebook') {
          return (
            <div key={idx} className="rounded-2xl overflow-hidden">
              <div className="bg-[#242526] border border-zinc-700 rounded-lg p-4">
                {/* Facebook header */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    JW
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Jack Whatley</p>
                    <p className="text-xs text-zinc-400">Just now · 🌐</p>
                  </div>
                </div>
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full mt-3 bg-zinc-800 border border-zinc-600 rounded-lg p-2 text-white text-sm resize-none"
                    rows={5}
                  />
                ) : (
                  <p className="text-[#e4e6eb] text-sm mt-3 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>
                )}
                {/* Engagement */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-700 text-zinc-400 text-xs">
                  <span>👍 23 Likes</span>
                  <span>5 Comments · 2 Shares</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs font-mono ${getCharColor(post.characterCount, post.maxCharacters)}`}>
                    {post.characterCount}/{post.maxCharacters}
                  </span>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button onClick={() => setEditingIndex(null)} className="text-xs text-zinc-500 hover:text-white">Cancel</button>
                        <button onClick={() => saveEdit(idx)} className="text-xs text-blue-400 hover:text-blue-300 font-semibold">Save</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(idx, post.content)} className="text-zinc-500 hover:text-white"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => copyPost(post.content, idx)} className="text-zinc-500 hover:text-white">
                          {isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-zinc-600 mt-1">Facebook Preview</p>
            </div>
          );
        }

        // Fallback for unknown platforms
        return (
          <div key={idx} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
            <p className="text-sm text-zinc-400 font-semibold mb-2">{post.platformName}</p>
            <p className="text-white text-sm whitespace-pre-wrap">{post.content}</p>
          </div>
        );
      })}
    </div>
  );
}
