it('can import server database access without configured credentials', async () => {
  const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    const server = await import('@/lib/supabase/server');
    expect(() => server.getSupabaseAdmin().from('repositories')).toThrow(/configur|Missing/i);
  } finally {
    if (previousUrl !== undefined) process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
    if (previousKey !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
  }
});
