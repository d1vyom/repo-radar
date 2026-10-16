import { NextResponse } from 'next/server';
import { searchRepositories } from '@/lib/github/search';
import { DOMAIN_TOPIC_MAP } from '@/lib/constants';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const language = (searchParams.get('language') || '').trim();
  const domain = (searchParams.get('domain') || '').trim();
  const topic = (searchParams.get('topic') || '').trim();
  const starsValue = searchParams.get('stars') || '0';
  const pageValue = searchParams.get('page') || '1';
  const stars = Number(starsValue);
  const page = Number(pageValue);
  const domainTopics = Object.hasOwn(DOMAIN_TOPIC_MAP, domain) ? DOMAIN_TOPIC_MAP[domain] : undefined;

  if (q.length > 100 || language.length > 50 || (language && !/^[\p{L}\p{N}+#. -]+$/u.test(language)) ||
      (domain && !domainTopics) || (topic && !/^[a-z0-9][a-z0-9-]{0,49}$/.test(topic)) ||
      !/^\d+$/.test(starsValue) || !Number.isSafeInteger(stars) || stars > 2147483647 ||
      !/^\d+$/.test(pageValue) || !Number.isInteger(page) || page < 1 || page > 50) {
    return NextResponse.json({ error: 'Invalid search filters or page. Pages must be between 1 and 50.' }, { status: 400 });
  }

  const sort = searchParams.get('sort') || 'stars';
  const sortParam = sort === 'updated' ? 'updated-desc' : sort === 'forks' ? 'forks-desc' : 'stars-desc';
  // Repository search uses a canonical topic combined with every active filter.
  const topics = [...new Set([...(domainTopics ? [domainTopics[0]] : []), ...(topic ? [topic] : [])])];
  try {
    const data = await searchRepositories({ query: q || undefined, language: language || undefined, minStars: stars, topics }, sortParam, page, 20);
    return NextResponse.json({ items: data.items, total_count: data.totalCount, hasMore: data.hasMore, page });
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number; name?: string };
    if (err.status === 429 || /rate limit/i.test(err.message || '')) {
      return NextResponse.json({ error: 'API rate limit exceeded. Please try again later.' }, { status: 429 });
    }
    if (err.status === 422) {
      return NextResponse.json({ error: 'GitHub could not understand this search. Please adjust your query.' }, { status: 400 });
    }
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return NextResponse.json({ error: 'GitHub took too long to respond. Please try again.' }, { status: 504 });
    }
    return NextResponse.json({ error: 'Search is temporarily unavailable. Please try again.' }, { status: 502 });
  }
}
