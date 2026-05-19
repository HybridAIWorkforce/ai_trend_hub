// Reddit Web Scraper (no API required)
import axios from 'axios';
import { prisma } from './db';

interface RedditPost {
  title: string;
  link: string;
  subreddit: string;
  score: number;
  numComments: number;
  author: string;
  created: number;
  selfText?: string;
}

const CORE_AI_KEYWORDS = [
  'ai', 'artificial intelligence', 'machine learning', 'ml', 'gpt', 'llm',
  'chatgpt', 'openai', 'deep learning', 'neural', 'model', 'training',
  'nlp', 'computer vision', 'generative', 'automation', 'bot', 'agentic', 'agent'
];

const HIGH_SIGNAL_KEYWORDS = [
  'agentic', 'workflow', 'automation', 'copilot', 'enterprise', 'startup',
  'funding', 'benchmark', 'research', 'paper', 'release', 'launch', 'open source',
  'api', 'inference', 'fine-tuning', 'deployment', 'pricing', 'saas', 'product',
  'sales', 'crm', 'recruiting', 'recruitment', 'hiring', 'hr', 'customer support'
];

const LOW_SIGNAL_QUESTION_PATTERNS = [
  /^is it possible/i,
  /^any recommendations/i,
  /^what should i/i,
  /^wondering if/i,
  /^does anyone know/i,
  /^help/i,
];

const OFF_TOPIC_PATTERNS = [
  /minecraft/i,
  /mod(pack)?/i,
  /dating/i,
  /girlfriend|boyfriend|relationship/i,
  /homework|assignment|exam/i,
  /dream diar/i,
  /fanfic/i,
];

export async function scrapeRedditSubreddit(
  subreddit: string,
  sourceId: string,
  categoryId: string,
  sourceName: string
) {
  try {
    // Use Reddit's JSON endpoint (no API key needed)
    const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=25`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const posts: RedditPost[] = [];
    const children = response?.data?.data?.children ?? [];

    for (const child of children) {
      const post = child?.data;
      if (!post) continue;

      const candidatePost: RedditPost = {
        title: post?.title ?? '',
        link: `https://www.reddit.com${post?.permalink ?? ''}`,
        subreddit: post?.subreddit ?? subreddit,
        score: post?.score ?? 0,
        numComments: post?.num_comments ?? 0,
        author: post?.author ?? 'unknown',
        created: post?.created_utc ?? Date.now() / 1000,
        selfText: post?.selftext ?? '',
      };

      if (shouldIncludeRedditPost(candidatePost)) {
        posts.push(candidatePost);
      }
    }

    // Save to database
    const items: any[] = [];
    
    for (const post of posts) {
      // Check if post already exists
      const existing = await prisma.trendItem.findFirst({
        where: {
          link: post.link,
          sourceId: sourceId,
        },
      });

      if (!existing) {
        const publishedAt = new Date(post.created * 1000);
        const tags = extractRedditTags(post.title + ' ' + (post?.selfText ?? ''));
        const trendScore = calculateRedditTrendScore(publishedAt, post.score, post.numComments);
        
        const newItem = await prisma.trendItem.create({
          data: {
            sourceType: 'reddit',
            sourceId,
            categoryId,
            title: post.title,
            summary: (post?.selfText ?? '').substring(0, 500),
            link: post.link,
            sourceName,
            subreddit: post.subreddit,
            score: post.score,
            numComments: post.numComments,
            tags,
            trendScore,
            publishedAt,
            fetchedAt: new Date(),
          },
        });
        
        items.push(newItem);
      }
    }

    return items;
  } catch (error) {
    console.error(`Error scraping Reddit r/${subreddit}:`, error);
    return [];
  }
}

export async function scrapeAllRedditSources() {
  const sources = await prisma.source.findMany({
    where: {
      type: 'reddit',
      active: true,
    },
    include: {
      category: true,
    },
  });

  let totalItems = 0;

  for (const source of sources) {
    if (!source?.subreddit) continue;
    
    console.log(`Scraping Reddit: r/${source.subreddit}`);
    const items = await scrapeRedditSubreddit(
      source.subreddit,
      source.id,
      source.categoryId,
      source.name
    );
    
    totalItems += items?.length ?? 0;
    
    // Update last fetched timestamp
    await prisma.source.update({
      where: { id: source.id },
      data: { lastFetchedAt: new Date() },
    });
  }

  return totalItems;
}

function countKeywordMatches(text: string, keywords: string[]): number {
  const lowerText = text?.toLowerCase() ?? '';
  return keywords.filter((keyword) => lowerText.includes(keyword.toLowerCase())).length;
}

function shouldIncludeRedditPost(post: RedditPost): boolean {
  const title = post?.title ?? '';
  const selfText = post?.selfText ?? '';
  const combinedText = `${title} ${selfText}`.trim();
  const lowerTitle = title.toLowerCase();
  const lowerText = combinedText.toLowerCase();

  if (!combinedText) return false;

  if (OFF_TOPIC_PATTERNS.some((pattern) => pattern.test(lowerText))) {
    return false;
  }

  const aiKeywordMatches = countKeywordMatches(combinedText, CORE_AI_KEYWORDS);
  if (aiKeywordMatches === 0) {
    return false;
  }

  const signalKeywordMatches = countKeywordMatches(combinedText, HIGH_SIGNAL_KEYWORDS);
  const hasStrongEngagement = post.score >= 5 || post.numComments >= 3;
  const hasStrongHeadline = /(launch|release|benchmark|research|paper|study|funding|agentic|open source|api|copilot)/i.test(title);
  const looksLikeLowSignalQuestion = title.includes('?') || LOW_SIGNAL_QUESTION_PATTERNS.some((pattern) => pattern.test(title));
  const hasMeaningfulBody = selfText.trim().length >= 120;

  if (looksLikeLowSignalQuestion && !hasStrongEngagement && signalKeywordMatches < 2) {
    return false;
  }

  if (aiKeywordMatches === 1 && signalKeywordMatches === 0 && !hasStrongEngagement && !hasStrongHeadline) {
    return false;
  }

  if (!hasStrongEngagement && !hasStrongHeadline && !hasMeaningfulBody && signalKeywordMatches < 2) {
    return false;
  }

  // Keep recruiting/sales/business-adjacent discussions even with moderate engagement.
  if (/(sales|crm|recruit|hiring|hr|revenue|customer)/i.test(lowerTitle)) {
    return true;
  }

  return hasStrongEngagement || hasStrongHeadline || signalKeywordMatches >= 2 || hasMeaningfulBody;
}

function extractRedditTags(text: string): string[] {
  const keywords = [
    'AI', 'ML', 'GPT', 'LLM', 'ChatGPT', 'OpenAI', 'Machine Learning',
    'Deep Learning', 'Neural', 'NLP', 'Computer Vision', 'Generative',
    'Model', 'Training', 'Research', 'Paper', 'Discussion', 'News'
  ];
  
  const tags: string[] = [];
  const lowerText = text?.toLowerCase() ?? '';
  
  for (const keyword of keywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      tags.push(keyword);
    }
  }
  
  return [...new Set(tags)];
}

function calculateRedditTrendScore(publishedAt: Date, score: number, numComments: number): number {
  // Use the shared scoring engine for raw score; normalization happens after batch ingest
  const { computeRawScore } = require('./trend-scoring');
  return computeRawScore('reddit', publishedAt, { upvotes: score, comments: numComments });
}
