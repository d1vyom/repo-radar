# RepoRadar Repair Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement task-by-task with TDD.

**Goal:** Repair and verify all discovered defects in existing website flows without deployment.

**Architecture:** Keep App Router server/client boundaries; fix shared request and data handling at their source. URL parameters own search state. Database access initializes lazily so offline pages can recover.

**Tech Stack:** Next.js 14, React 18, TypeScript, Supabase, Jest, Playwright.

**Spec:** ../specs/2026-10-16-project-repair-design.md

## Tasks

- [x] 1. Reproduce baseline test/lint/type/build and external read failures; record evidence.
- [x] 2. Add failing GitHub/search/API regressions for public reads, timeout/rate limits, qualifiers, invalid filters, and pagination; repair shared client and query building, then pass tests.
- [x] 3. Add failing database/cron regressions for missing settings, raw GitHub sync payloads, incomplete sync, and fallback ranking; repair lazy initialization, analytics, and sync failure propagation; pass tests.
- [x] 4. Add browser regressions for URL navigation, reset/remove domain/topic, debouncing, race conditions, pagination, and mobile overflow; repair search state and layout; pass tests.
- [x] 5. Add regressions for classifier boundaries, README sanitization/relative assets, watcher count, and clipboard failure; implement fixes and verify.
- [x] 6. Correct environment example/setup docs, inspect dependency audit, run full suite/lint/type/build and production browser checks; review final diff and record external limitations.

## Review focus

No secrets in source or browser bundles. Missing database configuration must be recoverable before page-level catches. Search responses must not be overwritten by older requests. Cron tests never invoke the real database. Known domain pages must remain navigable during outages. Empty legitimate results must not be replaced with fabricated live rankings.

## Execution notes

The user authorized fixes; proceed through maintenance steps without repeated approval requests. Preserve local environment credentials, never print their values, and leave all work local for review.
