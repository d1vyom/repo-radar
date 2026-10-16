import { sanitizeReadme } from '@/lib/github/readme';

it('resolves relative links and images against the source repository branch', () => {
  const html = sanitizeReadme('<a href="docs/setup.md">Setup</a><img src="./images/demo.png"><a href="#usage">Usage</a>', 'owner', 'repo', 'feature/docs');
  expect(html).toContain('https://github.com/owner/repo/blob/feature%2Fdocs/docs/setup.md');
  expect(html).toContain('https://raw.githubusercontent.com/owner/repo/feature%2Fdocs/images/demo.png');
  expect(html).toContain('href="#usage"');
});

it('strips executable markup, unsafe URLs and global page classes', () => {
  const html = sanitizeReadme('<script>alert(1)</script><img src="javascript:alert(1)" onerror="alert(1)"><a href="javascript:alert(1)">bad</a><div class="fixed inset-0" style="position:fixed">Text</div>', 'a', 'b', 'main');
  expect(html).not.toMatch(/<script|javascript:|onerror|class=|style=/);
  expect(html).toContain('Text');
});

it('preserves safe external links and media', () => {
  const html = sanitizeReadme('<a href="https://example.com/docs">Docs</a><img src="https://example.com/demo.png" alt="demo">', 'a', 'b', 'main');
  expect(html).toContain('href="https://example.com/docs"');
  expect(html).toContain('src="https://example.com/demo.png"');
});
