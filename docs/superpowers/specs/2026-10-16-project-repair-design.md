# RepoRadar repair specification

User request: identify and repair project and website errors; verify locally; do not deploy.

## Scope and approach

Repair the existing Next.js application and preserve its visual direction and public routes. Trace failures from browser to API to GitHub/Supabase, add regression tests before changing behavior, and use existing libraries where possible. This is maintenance of existing flows, not a new subsystem or redesign. Work stays on a local repair branch; no pushes, deployments, production syncs, or remote database changes.

## Acceptance criteria

- All existing tests, added regressions, lint, type checking, and production build pass.
- Home, trending, domains, valid domain details, languages, search, repository details, and missing-resource routes render correctly.
- Missing database configuration or an unavailable database cannot crash module loading. Discovery pages degrade honestly and label sample data.
- Search supports query, language (including C++/C#), stars, domain, topic, sorting, and safe pagination. Clearing filters, browser navigation, and fast consecutive searches retain correct URL/results state.
- GitHub reads share bounded request handling, distinguish missing repositories from outages/rate limits, and allow public read access without a token. README markup is sanitized and relative links/images resolve against the source repository.
- Cron authentication fails closed with a missing secret. Sync consumes actual GitHub repositories, reports partial failures truthfully, and preserves repository/snapshot/domain contracts.
- Deterministic classification does not match short keywords inside unrelated words; ranking does not mutate shared fallback data.
- Navigation and main flows fit mobile screens, remain keyboard accessible, and respect reduced motion. Clipboard errors have truthful feedback.
- Environment examples contain placeholders only; documentation matches the actual schema and runtime.

## Verification and limits

Use deterministic tests for validation/data mapping/ranking, mocked external HTTP responses for error paths and sync writes, and browser tests against a local production server for user flows and responsive layout. Verify configured external services with read-only probes only. Record inaccessible services or credentials as external limitations rather than declaring them healthy. No claim of zero possible defects.
