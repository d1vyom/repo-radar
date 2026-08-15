import { NextRequest, NextResponse } from 'next/server';
import { searchRepositories } from '@/lib/github/search';
import { SearchFilters, SortOption } from '@/types/filters';
import { GitHubApiError } from '@/lib/github/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  try {
    // 1. Extract and validate parameters
    const query = searchParams.get('q') || undefined;
    const language = searchParams.get('language') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const sort = (searchParams.get('sort') as SortOption) || 'best-match';

    const filters: SearchFilters = {
      query,
      language,
    };

    // 2. Execute GitHub Search securely on the server
    const result = await searchRepositories(filters, sort, page);

    // 3. Return successful payload
    return NextResponse.json(result);

  } catch (error: unknown) {
    if (error instanceof GitHubApiError) {
      console.error('Search API Error:', error.message);
      return NextResponse.json(
        { error: error.message, rateLimitRemaining: error.rateLimitRemaining },
        { status: error.status }
      );
    }

    console.error('Search API Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Internal server error while fetching repositories.' },
      { status: 500 }
    );
  }
}
