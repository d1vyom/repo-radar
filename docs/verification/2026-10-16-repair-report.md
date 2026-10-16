# RepoRadar repair and verification — 16 October 2026

Work is local on `codex/project-repair`. No push, website deployment, authenticated production sync, or remote database migration was performed.

## Repaired

- Missing Supabase settings no longer crash server-module imports. Database requests have a timeout; discovery pages recover with labelled samples.
- Sync consumes raw GitHub objects rather than casting incompatible internal records. It includes low-star candidates, deduplicates repositories, batches writes, fails closed without a cron secret, and reports snapshot/domain failures accurately.
- Removed shared sample-array mutation and handled missing snapshots. Valid empty database results remain empty. Known domain pages survive database outages; sample-domain slugs match real routes.
- Search applies query, topic, canonical domain topic, language, stars, and sort together. Zero upper bounds and date qualifiers work; multiword languages are quoted; invalid filters and pages beyond GitHub's first 1,000 results are rejected.
- Search state follows the URL through reset, filter removal, browser history, and pagination. Old requests are aborted, retries work, and arbitrary directory language/star values remain visible in the controls.
- Public GitHub reads work without a token. A rejected token retries anonymously. Requests have bounded timeouts and distinguish permission errors, rate limits, missing resources, and outages. API credentials are restricted to GitHub's origin.
- README links/images resolve relative to the repository branch and markup is sanitized. Watchers use subscriber counts. Clipboard success waits for the write; denial shows failure feedback. Missing repositories return HTTP 404 before streaming starts.
- Repaired narrow-screen navigation/section wrapping, nested main landmarks, keyboard skip navigation, and reduced-motion handling. Partial failures disclose sample data across all displayed collections.
- Domain/language counts paginate beyond the database response cap. Independent review findings were reproduced in regression tests and repaired.
- Updated Next.js 14.2.35 to patched 15.5.28, including asynchronous route parameters. Updated vulnerable compatible dependencies and pinned patched PostCSS/parser overrides. Kept React 18 and the existing visual design.
- Replaced credential-bearing local environment examples with placeholders, made the safe example trackable, and corrected setup/analytics documentation. Prepared a catalog RLS/write-protection migration.
- Browser tests use `.next-e2e`, with separate build/fetch caches and disabled database credentials. The real preview uses `.next`; fixture responses cannot populate its persistent fetch cache.

## Verification results

| Check | Result |
| --- | --- |
| `npm test -- --runInBand` | 53 tests across 11 suites passed |
| `npm run lint` | Passed, zero warnings/errors |
| `npm run typecheck` | Passed |
| `npm run build` | Production build passed |
| `npm run test:e2e -- --reporter=line` | Separate production build and all 16 browser tests passed |
| Responsive route matrix | Home, search, trending, domains, domain details, languages, repo details at 320/768/1440px |
| Browser runtime exceptions | None in the automated route/interaction tests |
| `npm audit --omit=dev` | Zero runtime dependency advisories |
| Dependency tree / diff whitespace | Valid dependency tree; no diff whitespace errors |
| Client bundle secret check | No configured GitHub token, service-role key, or cron secret found in static JS |
| Actual GitHub smoke check | Real `vercel/next.js` details and README rendered; C++ search returned 20 C++ results with HTTP 200 |
| API boundary smoke check | Invalid page returned 400; unauthenticated cron returned 401 |

The browser suite uses deterministic GitHub fixtures for repeatable failures and interactions. The actual-service smoke check above was performed separately with the real local configuration. Raw logs are retained under ignored `.superpowers/verification/`.

## Remaining external and toolchain limitations

1. **Supabase project is inactive.** The connected account reports the existing RepoRadar project as `INACTIVE`, and its configured API hostname does not resolve. Live analytics and real database writes cannot be verified until the owner resumes that project. No database state was changed. The protection migration is prepared locally and has not been executed against an active PostgreSQL instance.
2. **Saved GitHub token is rejected.** GitHub returns HTTP 401 for the configured token. Anonymous fallback was verified and public browsing works; replace the token to regain authenticated rate limits. Credential values were preserved in `.env.local` and are not included in this report.
3. **Development-only upstream advisories remain.** Full `npm audit` reports 27 affected dependency entries (7 high, 20 moderate), all rooted in `braces` and `sprintf-js`. Published versions available during this run have no patched compatible release. These are build/watch and test-coverage tooling dependencies; production audit is clean. They are recorded rather than hidden or addressed through an incompatible forced toolchain migration.

The code repairs and local checks are complete. Full live analytics readiness depends on resuming Supabase, applying/reviewing the local migration, and verifying an authenticated sync after explicit authorization for hosted changes.

## Reference documentation checked

- [GitHub repository search API](https://docs.github.com/en/rest/search/search#search-repositories)
- [Supabase JavaScript client initialization](https://supabase.com/docs/reference/javascript/initializing)
- [Next.js notFound and streamed status codes](https://nextjs.org/docs/app/api-reference/functions/not-found)
