import { NextResponse } from 'next/server';
import { searchRepositories } from '@/lib/github/search';
import { syncRepositoryToDatabase } from '@/lib/supabase/sync';
import { GitHubRepository } from '@/lib/github/types';

export const maxDuration = 60; // Allow 60 seconds for execution

export async function GET(request: Request) {
  // 1. Authenticate request
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Starting sync job...');

    // 2. Fetch popular repos (Syncing top 30 stars:>1000 repos)
    // We limit this to ensure we stay under API and execution limits
    const repos = await searchRepositories({ query: 'stars:>1000' }, 'stars-desc', 1, 30);

    // 3. Process Sync (Idempotent)
    const results = await Promise.allSettled(
      repos.items.map(async (repo) => {
        // Map our internal type back to GitHub format for the sync function
        return await syncRepositoryToDatabase(repo as unknown as GitHubRepository);
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`Sync completed. Successfully synced ${successful}/${repos.items.length} repositories.`);

    return NextResponse.json({ 
      success: true, 
      synced: successful, 
      total: repos.items.length 
    });

  } catch (error) {
    console.error('Sync job failed:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
