// Reddit Web Scraper (no API required)
import axios from 'axios';
import * as cheerio from 'cheerio';
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

      // Filter for AI-related posts
      const title = post?.title ?? '';
      const selfText = post?.selftext ?? '';
      const combinedText = title + ' ' + selfText;
      
      if (isAIRelated(combinedText)) {
        posts.push({
          title: post.title,
          link: `https://www.reddit.com${post?.permalink ?? ''}`,
          subreddit: post?.subreddit ?? subreddit,
          score: post?.score ?? 0,
          numComments: post?.num_comments ?? 0,
          author: post?.author ?? 'unknown',
          created: post?.created_utc ?? Date.now() / 1000,
          selfText: post?.selftext ?? '',
        });
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

function isAIRelated(text: string): boolean {
  const aiKeywords = [
    'ai', 'artificial intelligence', 'machine learning', 'ml', 'gpt', 'llm',
    'chatgpt', 'openai', 'deep learning', 'neural', 'model', 'training',
    'nlp', 'computer vision', 'generative', 'automation', 'bot'
  ];
  
  const lowerText = text?.toLowerCase() ?? '';
  return aiKeywords.some(keyword => lowerText.includes(keyword));
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
  const now = new Date();
  const ageInHours = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);
  
  // Newer posts get higher age score
  const ageScore = Math.max(0, 50 - ageInHours / 2);
  
  // Higher upvotes and comments increase score
  const engagementScore = Math.min(30, Math.log10((score ?? 0) + 1) * 10);
  const commentScore = Math.min(20, Math.log10((numComments ?? 0) + 1) * 10);
  
  return Math.min(100, ageScore + engagementScore + commentScore);
}
