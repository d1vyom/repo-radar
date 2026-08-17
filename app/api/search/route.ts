import { NextResponse } from 'next/server';
import { searchRepositories } from '@/lib/github/search';
import { DOMAIN_TOPIC_MAP } from '@/lib/constants';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Strict Input Validation & Sanitization
  const q = (searchParams.get('q') || '').trim().slice(0, 100); // Prevent DoS via massive strings
  const language = (searchParams.get('language') || '').trim().slice(0, 50);
  const domain = (searchParams.get('domain') || '').trim().slice(0, 50);
  const stars = Math.max(0, parseInt(searchParams.get('stars') || '0', 10) || 0);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  // Whitelist sorting parameters to prevent parameter injection
  let sort = searchParams.get('sort') || 'stars';
  const allowedSorts = ['stars', 'forks', 'updated'];
  if (!allowedSorts.includes(sort)) {
    sort = 'stars';
  }

  // Safely build the query
  const queryParts: string[] = [];
  if (q) queryParts.push(q);
  else queryParts.push('stars:>500');

  if (language) queryParts.push(`language:${language}`);
  if (stars > 0) queryParts.push(`stars:>=${stars}`);

  // Map our internal "domain" slug to a set of GitHub topics so domain links
  // from the home page drive a meaningful search.
  if (domain) {
    const topics = DOMAIN_TOPIC_MAP[domain];
    if (topics && topics.length > 0) {
      // Group topics with OR so a repo matching ANY topic qualifies
      queryParts.push(topics.map((t) => `topic:${t}`).join(' OR '));
    }
  }

  const query = queryParts.join(' ');

  try {
    const sortParam = sort === 'updated' ? 'updated-desc' : sort === 'forks' ? 'forks-desc' : 'stars-desc';

    const data = await searchRepositories({ query }, sortParam, page, 20);

    // Return snake_case keys to match the GitHub-style contract the client expects.
    return NextResponse.json({
      items: data.items,
      total_count: data.totalCount,
      hasMore: data.hasMore,
      page,
    });
  } catch (error: unknown) {
    console.error('Search API Error:', error);

    const err = error as { message?: string; status?: number };

    if (err.message?.includes('rate limit') || err.status === 403 || err.status === 429) {
      return NextResponse.json(
        { error: 'API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Generic error to prevent leaking stack traces or internal mechanics
    return NextResponse.json({ error: 'Failed to fetch search results.' }, { status: 500 });
  }
}
