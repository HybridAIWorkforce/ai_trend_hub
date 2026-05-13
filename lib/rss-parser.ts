// RSS Feed Parser
import Parser from 'rss-parser';
import { prisma } from './db';

const parser = new Parser({
  customFields: {
    item: [
      ['description', 'description'],
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
    ],
  },
});

interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
  contentEncoded?: string;
  creator?: string;
  content?: string;
  contentSnippet?: string;
}

export async function fetchRSSFeed(feedUrl: string, sourceId: string, categoryId: string, sourceName: string) {
  try {
    const feed = await parser.parseURL(feedUrl);
    const items: any[] = [];

    for (const item of (feed?.items ?? [])) {
      const rssItem = item as RSSItem;
      
      if (!rssItem?.title || !rssItem?.link) continue;

      const publishedAt = rssItem?.pubDate ? new Date(rssItem.pubDate) : new Date();
      const summary = rssItem?.contentSnippet || rssItem?.description || '';
      const content = rssItem?.contentEncoded || rssItem?.content || rssItem?.description || '';

      // Extract tags from content (simple keyword extraction)
      const tags = extractTags(rssItem?.title + ' ' + summary);

      // Check if item already exists
      const existing = await prisma.trendItem.findFirst({
        where: {
          link: rssItem.link,
          sourceId: sourceId,
        },
      });

      if (!existing) {
        const trendScore = calculateTrendScore(publishedAt, tags?.length ?? 0, content?.length ?? 0);
        
        const newItem = await prisma.trendItem.create({
          data: {
            sourceType: 'rss',
            sourceId,
            categoryId,
            title: rssItem.title,
            summary: summary.substring(0, 1000),
            content: content.substring(0, 5000),
            link: rssItem.link,
            sourceName,
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
    console.error(`Error fetching RSS feed ${feedUrl}:`, error);
    return [];
  }
}

export async function fetchAllRSSFeeds() {
  const sources = await prisma.source.findMany({
    where: {
      type: 'rss',
      active: true,
    },
    include: {
      category: true,
    },
  });

  let totalItems = 0;

  for (const source of sources) {
    if (!source?.feedUrl) continue;
    
    console.log(`Fetching RSS feed: ${source.name}`);
    const items = await fetchRSSFeed(
      source.feedUrl,
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

function extractTags(text: string): string[] {
  const keywords = [
    'AI', 'ML', 'GPT', 'LLM', 'ChatGPT', 'OpenAI', 'Machine Learning',
    'Deep Learning', 'Neural', 'Sales', 'CRM', 'Recruitment', 'HR',
    'Automation', 'NLP', 'Computer Vision', 'Generative', 'Model',
    'Training', 'Fine-tuning', 'Prompt', 'Agent', 'Assistant'
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

function calculateTrendScore(publishedAt: Date, tagsCount: number, contentLength: number = 0): number {
  // Use the shared scoring engine for raw score; normalization happens after batch ingest
  const { computeRawScore } = require('./trend-scoring');
  return computeRawScore('rss', publishedAt, { tagsCount, contentLength });
}
