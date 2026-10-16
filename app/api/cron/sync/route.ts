import { NextResponse } from 'next/server';
import { searchGitHubRepositories } from '@/lib/github/search';
import { syncRepositoryToDatabase } from '@/lib/supabase/sync';

export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const [popular, candidates] = await Promise.all([
      searchGitHubRepositories({ minStars: 1000 }, 'stars-desc', 1, 30),
      searchGitHubRepositories({ minStars: 10, maxStars: 1499, updatedAfter: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0] }, 'updated-desc', 1, 20),
    ]);
    const repositories = [...new Map([...popular.items, ...candidates.items].map(repo => [repo.id, repo])).values()];
    // Small batches bound concurrent database writes and leave room for snapshots/classification.
    const results: PromiseSettledResult<string>[] = [];
    for (let start = 0; start < repositories.length; start += 5) {
      results.push(...await Promise.allSettled(repositories.slice(start, start + 5).map(repo => syncRepositoryToDatabase(repo))));
    }
    const synced = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.length - synced;
    return NextResponse.json({ success: failed === 0, synced, failed, total: repositories.length }, { status: failed ? 500 : 200 });
  } catch {
    return NextResponse.json({ error: 'Sync failed', success: false }, { status: 500 });
  }
}
