# AGENTS.md

RepoRadar — a Next.js 15 (App Router) app for discovering trending open-source
repositories, powered by the GitHub REST API and Supabase.

## Commands

- `npm run dev` — start the dev server on http://localhost:3000
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint (configured via `.eslintrc.json`)
- `npm run typecheck` — TypeScript type check via `tsc --noEmit`
- `npm test` — run Jest (`ts-jest`) test suite
- `npm run test:e2e` — Playwright against a local production build with isolated test services
- `npm run test:watch` — Jest in watch mode

## Required environment (.env.local)

See `.env.example` for the full list. The app degrades gracefully if
Supabase is unreachable (pages fall back to placeholder data), but the
following are required for live data:

- `GITHUB_TOKEN` — optional GitHub PAT for a higher public-read rate limit
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project URL + anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-only; bypasses RLS)
- `CRON_SECRET` — authenticates the Vercel cron calling `/api/cron/sync`
- `NEXT_PUBLIC_APP_BASE_URL` (optional) — used by sitemap/robots; defaults to repo-radar-six.vercel.app

## Architecture notes

- `lib/github/*` is server-only (`server-only` import). Never import from a client component.
- `lib/scoring.ts` and `lib/classification/*` are deterministic and unit-tested.
- `lib/analytics.ts` reads from Supabase and computes a `trending_score` dynamically.
- Database schema + seed migrations live under `supabase/migrations/`.
- The sync cron (`/api/cron/sync`) upserts popular repos into Supabase daily
  (see `vercel.json` schedule).
