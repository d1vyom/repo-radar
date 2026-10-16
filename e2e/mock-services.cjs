// Loaded only by the test server. Never included in the application.
const originalFetch = global.fetch;
global.fetch = async (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input.url || input.toString());
  if (url.hostname !== 'api.github.com') return originalFetch(input, init);
  if (url.pathname.includes('/missing/')) return Response.json({ message: 'Not Found' }, { status: 404 });
  if (url.pathname.endsWith('/readme')) {
    return new Response('<h1>Example README</h1><a href="docs/setup.md">Setup guide</a><img src="./images/demo.png" alt="Example"><script>alert(1)</script>', { headers: { 'content-type': 'text/html' } });
  }
  if (url.pathname.endsWith('/releases/latest')) return Response.json({ message: 'Not Found' }, { status: 404 });
  if (url.pathname.startsWith('/search/')) return Response.json({ items: [], total_count: 0, incomplete_results: false });
  return Response.json({
    id: 123, name: 'example-repo', full_name: 'example/example-repo',
    owner: { login: 'example', avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4' },
    description: 'Example repository for local verification.', language: 'TypeScript', topics: ['react'],
    stargazers_count: 1000, forks_count: 120, watchers_count: 1000, subscribers_count: 24, open_issues_count: 8,
    created_at: '2025-01-01T00:00:00Z', updated_at: '2026-10-15T00:00:00Z', pushed_at: '2026-10-15T00:00:00Z',
    clone_url: 'https://github.com/example/example-repo.git', html_url: 'https://github.com/example/example-repo',
    size: 2048, default_branch: 'main', archived: false, fork: false,
    license: { spdx_id: 'MIT', name: 'MIT License' },
  });
};
