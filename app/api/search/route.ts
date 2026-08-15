import { NextResponse } from 'next/server';
import { searchRepositories } from '@/lib/github/search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Strict Input Validation & Sanitization
  const q = (searchParams.get('q') || '').trim().slice(0, 100); // Prevent DoS via massive strings
  const language = (searchParams.get('language') || '').trim().slice(0, 50);
  const stars = Math.max(0, parseInt(searchParams.get('stars') || '0', 10) || 0);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  
  // Whitelist sorting parameters to prevent parameter injection
  let sort = searchParams.get('sort') || 'stars';
  const allowedSorts = ['stars', 'forks', 'updated'];
  if (!allowedSorts.includes(sort)) {
    sort = 'stars';
  }

  // Safely build the query
  let query = q ? q : 'stars:>500';
  if (language) {
    query += ` language:${language}`;
  }
  if (stars > 0) {
    query += ` stars:>=${stars}`;
  }

  try {
    const sortParam = sort === 'updated' ? 'updated-desc' : sort === 'forks' ? 'forks-desc' : 'stars-desc';
    
    const data = await searchRepositories({ query }, sortParam, page, 20);
    return NextResponse.json(data);
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
    return NextResponse.json(
      { error: 'Failed to fetch search results.' }, 
      { status: 500 }
    );
  }
}
