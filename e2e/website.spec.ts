import { test, expect, Page } from '@playwright/test';

const pageErrors = new WeakMap<Page, string[]>();
const repository = { id: 'result', github_id: 1, owner_login: 'example', name: 'result', full_name: 'example/result', stars_count: 1, forks_count: 0, topics: [], github_pushed_at: '2026-10-15T00:00:00Z' };

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  pageErrors.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/search*', route => route.fulfill({ json: { items: [], total_count: 0, hasMore: false } }));
});

test.afterEach(async ({ page }) => {
  expect(pageErrors.get(page)).toEqual([]);
});

test('removing a domain preserves the search route and other filters', async ({ page }) => {
  await page.goto('/search?domain=ai&language=python');
  await page.getByRole('button', { name: 'Remove domain filter' }).click();
  await expect(page).toHaveURL(/\/search\?language=python/);
  await expect(page.getByRole('button', { name: 'Remove domain filter' })).toHaveCount(0);
});

test('reset clears domain and topic as well as visible controls', async ({ page }) => {
  await page.goto('/search?domain=ai&topic=react&language=python&q=test&page=2');
  await page.getByRole('button', { name: 'Reset Filters', exact: true }).click();
  await expect(page).toHaveURL(/\/search$/);
  await expect(page.getByRole('textbox', { name: 'Search repositories' })).toHaveValue('');
});

test('browser history updates the controls without replacing the destination', async ({ page }) => {
  await page.goto('/search?language=python');
  await page.getByRole('combobox', { name: 'Language', exact: true }).selectOption('rust');
  await expect(page).toHaveURL(/language=rust/);
  await page.goBack();
  await expect(page).toHaveURL(/language=python/);
  await expect(page.getByRole('combobox', { name: 'Language', exact: true })).toHaveValue('python');
});

test('topic filters are visible and removable', async ({ page }) => {
  await page.goto('/search?topic=react');
  await expect(page.getByText('Topic: react')).toBeVisible();
  await page.getByRole('button', { name: 'Remove topic filter' }).click();
  await expect(page).toHaveURL(/\/search$/);
});

test('mobile home fits the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  await expect(page.getByRole('link', { name: 'Languages', exact: true })).toBeVisible();
});

test('known domain pages remain available during database outages', async ({ page }) => {
  const response = await page.goto('/domains/blockchain');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: /Blockchain.*Repositories/i })).toBeVisible();
});

test('repository details show subscriber counts and safe README links', async ({ page }) => {
  await page.goto('/repo/example/example-repo');
  await expect(page.getByRole('heading', { name: 'Example README' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Setup guide' })).toHaveAttribute('href', 'https://github.com/example/example-repo/blob/main/docs/setup.md');
  await expect(page.getByText('Watchers', { exact: true }).locator('..').locator('..')).toContainText('24');
});

test('clipboard failure is reported instead of showing success', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('Permission denied')) } }));
  await page.goto('/repo/example/example-repo');
  await page.getByRole('button', { name: 'Copy clone command', exact: true }).click();
  await expect(page.getByText('Copy failed', { exact: true })).toBeVisible();
});

test('clipboard success copies the full clone command', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: (text: string) => { (window as unknown as { copiedText: string }).copiedText = text; return Promise.resolve(); } } }));
  await page.goto('/repo/example/example-repo');
  await page.getByRole('button', { name: 'Copy clone command', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Copied clone command' })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { copiedText: string }).copiedText)).toBe('git clone https://github.com/example/example-repo.git');
});

test('missing resources return 404', async ({ page }) => {
  expect((await page.goto('/domains/unknown'))?.status()).toBe(404);
  expect((await page.goto('/repo/missing/repo'))?.status()).toBe(404);
});

test('rapid searches cannot replace the latest results with an older response', async ({ page }) => {
  await page.unroute('**/api/search*');
  await page.route('**/api/search*', async route => {
    const q = new URL(route.request().url()).searchParams.get('q');
    if (q === 'old') await new Promise(resolve => setTimeout(resolve, 1500));
    await route.fulfill({ json: { items: [{ ...repository, description: `Result for ${q}` }], total_count: 1, hasMore: false } });
  });
  await page.goto('/search?q=old');
  await page.getByRole('textbox', { name: 'Search repositories' }).fill('new');
  await expect(page.getByText('Result for new', { exact: true })).toBeVisible();
  await expect(page.getByText('Result for old', { exact: true })).toHaveCount(0);
});

test('pagination updates the URL and changing filters returns to page one', async ({ page }) => {
  await page.unroute('**/api/search*');
  await page.route('**/api/search*', route => route.fulfill({ json: { items: [repository], total_count: 30, hasMore: !new URL(route.request().url()).searchParams.has('page') } }));
  await page.goto('/search');
  await page.getByRole('button', { name: 'Next page' }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByRole('button', { name: 'Next page' })).toBeDisabled();
  await page.getByRole('combobox', { name: 'Language', exact: true }).selectOption('c++');
  await expect(page).toHaveURL(/language=c%2B%2B/);
  expect(new URL(page.url()).searchParams.has('page')).toBe(false);
});

test('all primary pages render without horizontal overflow on narrow screens', async ({ page }) => {
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/search', '/trending', '/domains', '/domains/blockchain', '/languages', '/repo/example/example-repo']) {
      expect((await page.goto(path))?.status(), path).toBe(200);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${path} at ${width}px`).toBeLessThanOrEqual(width);
      await expect(page.locator('main')).toHaveCount(1);
    }
  }
});

test('reduced motion and keyboard navigation remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  const duration = await page.locator('.animate-fade-in').first().evaluate(element => getComputedStyle(element).animationDuration);
  expect(parseFloat(duration)).toBeLessThan(0.01);
});

test('search errors offer a working retry', async ({ page }) => {
  await page.unroute('**/api/search*');
  let attempts = 0;
  await page.route('**/api/search*', route => {
    attempts++;
    return attempts === 1 ? route.fulfill({ status: 429, json: { error: 'Rate limit exceeded' } }) : route.fulfill({ json: { items: [repository], total_count: 1 } });
  });
  await page.goto('/search');
  await expect(page.getByText('Rate limit exceeded', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Try Again' }).click();
  await expect(page.getByRole('link', { name: 'View example/result details' })).toBeVisible();
});

test('a directory language outside the curated options stays visible in the controls', async ({ page }) => {
  await page.goto('/search?language=Jupyter%20Notebook&stars=42');
  await expect(page.getByRole('combobox', { name: 'Language', exact: true })).toHaveValue('jupyter notebook');
  await expect(page.getByRole('combobox', { name: 'Minimum Stars' })).toHaveValue('42');
});
