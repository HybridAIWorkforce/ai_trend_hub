'use client';

import { Clock } from 'lucide-react';

interface FreshnessBadgeProps {
  publishedAt: string | Date;
}

export function FreshnessBadge({ publishedAt }: FreshnessBadgeProps) {
  const now = Date.now();
  const published = new Date(publishedAt).getTime();
  const diffMs = now - published;
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  let label: string;
  let colorClass: string;

  if (diffHours < 1) {
    const mins = Math.max(1, Math.round(diffMs / 60000));
    label = `${mins}m ago`;
    colorClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  } else if (diffHours < 6) {
    label = `${Math.round(diffHours)}h ago`;
    colorClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  } else if (diffHours < 24) {
    label = `${Math.round(diffHours)}h ago`;
    colorClass = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  } else if (diffDays < 3) {
    const d = Math.round(diffDays);
    label = `${d}d ago`;
    colorClass = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  } else {
    label = '>3d';
    colorClass = 'bg-zinc-700/40 text-zinc-500 border-zinc-600/30';
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}
    >
      <Clock className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}
