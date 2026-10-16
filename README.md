# RepoRadar

Discover GitHub repositories by query, language, topic, domain, stars, and recent activity. The application uses Next.js 15 App Router, React 18, TypeScript, Tailwind CSS, the GitHub REST API, and a Supabase catalog.

## Run locally

Requires Node.js 22.12 or newer and npm.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000. Existing `.env.local` files should be edited rather than overwritten.

Public GitHub search and repository details work without a token, subject to GitHub's unauthenticated rate limit. Set a valid `GITHUB_TOKEN` to increase that limit; public read access does not require write scopes. If a configured token is rejected, the app retries the public read without it.

## Database and analytics

Configure `NEXT_PUBLIC_SUPABASE_URL` and the server-only `SUPABASE_SERVICE_ROLE_KEY` for the live catalog. The optional anon key is reserved for client-side integrations; the current website reads catalog data on the server. Never prefix the service-role key with `NEXT_PUBLIC_`.

Apply the SQL migrations under `supabase/migrations/` to your own database in order, including the domain seeds and catalog protection migration. The protection migration enables RLS and reserves writes for the server-side service-role client. No remote database migration is part of local verification.

Without database configuration, or during an outage, discovery pages show clearly labeled illustrative samples. Known domain routes remain available and link to public GitHub searches. Live database results containing no repositories remain empty rather than becoming sample rankings.

The daily `/api/cron/sync` endpoint requires `Authorization: Bearer <CRON_SECRET>`. It fetches popular repositories and low-star candidates, deduplicates them, and saves metadata, daily snapshots, and domain links. Failed snapshot or classification writes are reported as failures. Running an authenticated sync writes to the configured database; do not invoke it as a read-only health check.

Trending scores are computed in `lib/analytics.ts` from current counts and yesterday's snapshot. There is no materialized view, database refresh trigger, or `pg_cron` requirement. Growth becomes available after daily snapshots exist for consecutive days. The Vercel schedule is defined in `vercel.json`.

## Verification

```powershell
npm test -- --runInBand
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests build into `.next-e2e` and start an isolated local production server on port 3101. Test fetch caches are separate from the real `.next` preview. GitHub responses are fixtures and database credentials are disabled; tests never deploy or synchronize the real database. `BASE_URL` can target an already running local server for manual smoke checks, but fixture-specific detail tests require the isolated server.

To preview the actual configured application after building:

```powershell
npm run start -- --port 3100
```

Set `NEXT_PUBLIC_APP_BASE_URL` before building to configure the canonical sitemap/robots URL. Use `npm audit --omit=dev` to check runtime dependencies. See `docs/verification/2026-10-16-repair-report.md` for repair evidence and remaining environment/toolchain limitations.

## Troubleshooting

- **Search rate limit:** wait for GitHub's reset or configure a valid token. A rejected token falls back to the lower anonymous limit.
- **Sample data:** verify that the Supabase project is active, its hostname resolves, its service key is valid, and all migrations and seeds have been applied.
- **Empty growth/hidden gems:** initial synchronization creates the first snapshots; daily comparisons need history. Only synchronized repositories can appear in the analytics catalog.
- **Sync failure:** verify the cron secret, GitHub access, database access, and migration state. The JSON response includes successful/failed counts; a partial failure does not claim success.

Deployment requires an explicit separate instruction from the project owner.
