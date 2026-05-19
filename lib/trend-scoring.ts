/**
 * Trend Scoring Engine
 * Produces a real 1–100 spread by weighting:
 *   - Recency   (40%): posts from last 6h score highest, exponential decay
 *   - Engagement (35%): upvotes + comments (Reddit) or tag density (RSS)
 *   - Source Authority (25%): Reddit tier > RSS
 *
 * After raw scoring, the full set is normalized so the top trend
 * always lands at 90–100 and scores spread meaningfully across the range.
 */

import { prisma } from './db';

// ─── Raw score helpers (pre-normalization) ────────────────────────────

/**
 * Recency component (0–40 raw points).
 * Posts < 6h old get full marks; exponential decay after that.
 */
function recencyScore(publishedAt: Date): number {
  const ageHours = Math.max(0, (Date.now() - publishedAt.getTime()) / 3_600_000);
  if (ageHours <= 6) return 40;
  if (ageHours <= 12) return 35;
  if (ageHours <= 24) return 28;
  // Exponential decay: halves every 48h beyond the first day
  const decayed = 28 * Math.pow(0.5, (ageHours - 24) / 48);
  return Math.max(1, decayed);
}

/**
 * Engagement component (0–35 raw points).
 * Reddit: log-scaled upvotes + comments.
 * RSS:    tag density + content-length heuristic.
 */
function engagementScore(
  sourceType: 'reddit' | 'rss',
  opts: { upvotes?: number; comments?: number; tagsCount?: number; contentLength?: number }
): number {
  if (sourceType === 'reddit') {
    const up = Math.max(0, opts.upvotes ?? 0);
    const cm = Math.max(0, opts.comments ?? 0);
    // log10(1) = 0, log10(1001) ≈ 3 → scaled to 35
    const upScore = Math.min(20, Math.log10(up + 1) * 6.67);
    const cmScore = Math.min(15, Math.log10(cm + 1) * 7.5);
    return upScore + cmScore;
  }
  // RSS: tags indicate keyword richness, content length indicates substance
  const tagPts = Math.min(20, (opts.tagsCount ?? 0) * 3);
  const lenPts = Math.min(15, Math.log10((opts.contentLength ?? 0) + 1) * 4);
  return tagPts + lenPts;
}

/**
 * Source authority component (0–25 raw points).
 * Reddit posts (community-curated) rank higher than RSS (publisher-curated).
 */
function authorityScore(sourceType: 'reddit' | 'rss'): number {
  return sourceType === 'reddit' ? 25 : 15;
}

// ─── Public API ───────────────────────────────────────────────────────

/**
 * Compute the raw (un-normalized) score for a single item.
 * Used at ingest time; normalization runs afterwards over the full set.
 */
export function computeRawScore(
  sourceType: 'reddit' | 'rss',
  publishedAt: Date,
  opts: { upvotes?: number; comments?: number; tagsCount?: number; contentLength?: number }
): number {
  return (
    recencyScore(publishedAt) +
    engagementScore(sourceType, opts) +
    authorityScore(sourceType)
  );
}

/**
 * Re-score and normalize ALL trend items in the database so scores
 * produce a real 1–100 spread.
 *
 * Call this after each ingest batch or on a schedule.
 */
export async function normalizeAllScores(): Promise<void> {
  const items = await prisma.trendItem.findMany({
    select: {
      id: true,
      sourceType: true,
      publishedAt: true,
      score: true,
      numComments: true,
      tags: true,
      content: true,
    },
  });

  if (items.length === 0) return;

  // 1. Compute raw scores
  const rawScores = items.map((item: (typeof items)[number]) => ({
    id: item.id,
    raw: computeRawScore(
      item.sourceType as 'reddit' | 'rss',
      item.publishedAt,
      {
        upvotes: item.score ?? 0,
        comments: item.numComments ?? 0,
        tagsCount: item.tags?.length ?? 0,
        contentLength: item.content?.length ?? 0,
      }
    ),
  }));

  // 2. Find min / max
  const rawValues = rawScores.map((r: (typeof rawScores)[number]) => r.raw);
  const minRaw = Math.min(...rawValues);
  const maxRaw = Math.max(...rawValues);
  const range = maxRaw - minRaw || 1; // avoid /0

  // 3. Normalize to 1–100 (top → 95-100, bottom → 1-10)
  const normalized = rawScores.map((r: (typeof rawScores)[number]) => {
    const pct = (r.raw - minRaw) / range; // 0..1
    // Map 0..1 → 1..100 with slight curve for spread
    const score = Math.round(1 + pct * 99);
    return { id: r.id, score: Math.min(100, Math.max(1, score)) };
  });

  // 4. Batch-update (use transaction chunks of 50)
  const CHUNK = 50;
  for (let i = 0; i < normalized.length; i += CHUNK) {
    const chunk = normalized.slice(i, i + CHUNK);
    await prisma.$transaction(
      chunk.map((c: (typeof normalized)[number]) =>
        prisma.trendItem.update({
          where: { id: c.id },
          data: { trendScore: c.score },
        })
      )
    );
  }

  console.log(`[Scoring] Normalized ${normalized.length} items (range ${minRaw.toFixed(1)}–${maxRaw.toFixed(1)} → 1–100)`);
}
