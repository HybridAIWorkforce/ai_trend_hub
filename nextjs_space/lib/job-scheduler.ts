// Background Job Scheduler
import cron from 'node-cron';
import { fetchAllRSSFeeds } from './rss-parser';
import { scrapeAllRedditSources } from './reddit-scraper';
import { prisma } from './db';

let isJobRunning = false;

export function startScheduledJobs() {
  console.log('🔄 Starting scheduled jobs...');
  
  // Run data ingestion every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    if (isJobRunning) {
      console.log('⏭️  Job already running, skipping...');
      return;
    }
    
    isJobRunning = true;
    console.log('🚀 Starting data ingestion job...');
    
    try {
      // Create job run record
      const jobRun = await prisma.jobRun.create({
        data: {
          jobType: 'data_ingestion',
          status: 'running',
          startedAt: new Date(),
        },
      });
      
      let totalItems = 0;
      
      // Fetch RSS feeds
      console.log('📰 Fetching RSS feeds...');
      const rssItems = await fetchAllRSSFeeds();
      totalItems += rssItems;
      console.log(`✅ Fetched ${rssItems} RSS items`);
      
      // Scrape Reddit
      console.log('🔍 Scraping Reddit...');
      const redditItems = await scrapeAllRedditSources();
      totalItems += redditItems;
      console.log(`✅ Scraped ${redditItems} Reddit posts`);
      
      // Update job run
      await prisma.jobRun.update({
        where: { id: jobRun.id },
        data: {
          status: 'success',
          completedAt: new Date(),
          itemsProcessed: totalItems,
        },
      });
      
      console.log(`✨ Job completed successfully! Processed ${totalItems} items.`);
    } catch (error) {
      console.error('❌ Job failed:', error);
      
      // Log error to database
      await prisma.jobRun.create({
        data: {
          jobType: 'data_ingestion',
          status: 'failed',
          startedAt: new Date(),
          completedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } finally {
      isJobRunning = false;
    }
  });
  
  console.log('✅ Scheduled jobs started (running every 30 minutes)');
}

// Manual trigger function for on-demand refresh
export async function triggerManualRefresh() {
  if (isJobRunning) {
    throw new Error('Job is already running');
  }
  
  isJobRunning = true;
  
  try {
    console.log('🚀 Manual refresh triggered...');
    
    const jobRun = await prisma.jobRun.create({
      data: {
        jobType: 'manual_refresh',
        status: 'running',
        startedAt: new Date(),
      },
    });
    
    let totalItems = 0;
    
    const rssItems = await fetchAllRSSFeeds();
    totalItems += rssItems;
    
    const redditItems = await scrapeAllRedditSources();
    totalItems += redditItems;
    
    await prisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: 'success',
        completedAt: new Date(),
        itemsProcessed: totalItems,
      },
    });
    
    return { success: true, itemsProcessed: totalItems };
  } catch (error) {
    console.error('Manual refresh failed:', error);
    throw error;
  } finally {
    isJobRunning = false;
  }
}
