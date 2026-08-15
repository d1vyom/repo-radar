import { NextResponse } from 'next/server';
import { searchRepositories } from '@/lib/github/search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const q = searchParams.get('q') || '';
  const language = searchParams.get('language') || '';
  const stars = searchParams.get('stars') || '';
  const sort = searchParams.get('sort') || 'stars';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Build the GitHub Search Query String
  let query = q ? q : 'stars:>500'; // Default to popular repos if query is empty
  
  if (language) {
    query += ` language:${language}`;
  }
  if (stars) {
    query += ` stars:>=${stars}`;
  }

  try {
    // Determine sort order based on our dropdown parameters
    let sortParam = 'stars-desc';
    if (sort === 'stars') sortParam = 'stars-desc';
    if (sort === 'forks') sortParam = 'forks-desc';
    if (sort === 'updated') sortParam = 'updated-desc';

    const data = await searchRepositories(
      { query }, 
      sortParam as Parameters<typeof searchRepositories>[1], 
      page, 
      20
    );

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Search API Error:', error);
    
    // Safely cast the error to check its properties
    const err = error as { message?: string; status?: number };
    
    if (err.message?.includes('rate limit') || err.status === 403) {
      return NextResponse.json(
        { error: 'GitHub API rate limit exceeded. Please try again later.' }, 
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch search results.' }, 
      { status: 500 }
    );
  }
}
