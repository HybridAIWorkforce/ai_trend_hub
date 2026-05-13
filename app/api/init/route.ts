// API route to initialize jobs (called on app startup)
import { NextResponse } from 'next/server';
import { initializeJobs } from '@/lib/init-jobs';

export async function GET() {
  try {
    initializeJobs();
    return NextResponse.json({ success: true, message: 'Jobs initialized' });
  } catch (error) {
    console.error('Error initializing jobs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize jobs' },
      { status: 500 }
    );
  }
}
