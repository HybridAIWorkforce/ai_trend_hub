// Initialize background jobs on server startup
import { startScheduledJobs } from './job-scheduler';

let jobsInitialized = false;

export function initializeJobs() {
  if (!jobsInitialized && typeof window === 'undefined') {
    console.log('🚀 Initializing background jobs...');
    startScheduledJobs();
    jobsInitialized = true;
    console.log('✅ Background jobs initialized');
  }
}
