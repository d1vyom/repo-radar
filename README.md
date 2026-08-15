# RepoRadar 🎯

RepoRadar is an intelligent, high-performance GitHub repository explorer and analytics engine. It helps developers discover trending projects, analyze repository health, and find hidden gems across the open-source ecosystem.

## 🚀 Features

*   **Intelligent Search**: Fast, debounced repository search with multi-parameter filtering (language, stars, sorting).
*   **Automated Sync**: Nightly Vercel Cron jobs fetch, classify, and sync top repositories directly from GitHub.
*   **Domain Classification**: Deterministic categorization of repositories into domains like AI, Web3, and DevOps based on metadata and topics.
*   **Advanced Analytics**: Tracks historical repository metrics (stars, forks) via a materialized Supabase view to calculate real-time trending scores.
*   **Zero-Trust Security**: Robust API route validation, rate-limit handling, and strict XSS sanitization for GitHub README rendering.

## 🛠️ Tech Stack

*   **Framework**: Next.js 14 (App Router, Server Components)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Database**: Supabase (PostgreSQL + pg_cron)
*   **External APIs**: GitHub REST API
*   **Deployment**: Vercel

## 🏗️ Architecture

1.  **Frontend**: Next.js React Server Components (RSC) handle heavy data fetching, keeping client bundles minimal. Client components are used exclusively for interactive elements (like the search interface).
2.  **Database Layer**: Supabase handles relational data (`repositories`, `domains`) and temporal data (`repository_snapshots`). A custom PostgreSQL Function + Trigger automatically refreshes a Materialized View to serve lightning-fast trending analytics.
3.  **Sync Pipeline**: A secure, idempotent API route (`/api/cron/sync`) queries GitHub, maps data to internal types, runs the domain classification engine, and upserts records into Supabase.

## 💻 Local Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/yourusername/repo-radar.git](https://github.com/yourusername/repo-radar.git)
    cd repo-radar
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Copy the example environment file and fill in your keys.
    ```bash
    cp .env.example .env.local
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Visit `http://localhost:3000`.

## 🔐 Environment Variables & Setup

### GitHub Token Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/tokens).
2. Generate a new Classic Token with `public_repo` scope.
3. Assign it to `GITHUB_TOKEN` in your `.env.local`.

### Supabase Setup
1. Create a new Supabase project.
2. Run the SQL migrations found in the `/supabase/migrations` folder to build the schema.
3. Copy the Project URL, Anon Key, and Service Role Key from the Supabase API settings into your `.env.local`.

### Cron Secret
Generate a random secure string (e.g., using `openssl rand -hex 32`) and assign it to `CRON_SECRET`.

## ☁️ Vercel Deployment

RepoRadar is fully optimized for Vercel deployment.

1. Push your code to a GitHub repository.
2. Log in to Vercel and click **Add New Project**.
3. Import your repository.
4. Open the **Environment Variables** section in the Vercel deployment settings and paste all values from your `.env.local`.
5. Click **Deploy**.

Vercel will automatically read the `vercel.json` file and configure the daily cron job targeting `/api/cron/sync`.

## 🚑 Troubleshooting

*   **GitHub Rate Limits**: If searches or syncs fail, ensure your `GITHUB_TOKEN` is valid. Unauthenticated requests are strictly throttled by GitHub.
*   **Stale Trending Data**: Ensure the Supabase `pg_cron` extension is active and successfully calling the `refresh_repository_stats()` function nightly.
*   **Sync Cron Failing**: Verify that the `CRON_SECRET` in your Vercel Environment Variables exactly matches the one expected by the `/api/cron/sync` route.
