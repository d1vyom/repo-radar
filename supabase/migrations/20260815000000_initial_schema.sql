-- Enable the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Domains Table
CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Repositories Table
CREATE TABLE repositories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    github_id BIGINT UNIQUE NOT NULL,
    full_name TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    owner_login TEXT NOT NULL,
    owner_avatar_url TEXT NOT NULL,
    description TEXT,
    language TEXT,
    topics TEXT[] DEFAULT '{}',
    stars_count INTEGER DEFAULT 0,
    forks_count INTEGER DEFAULT 0,
    issues_count INTEGER DEFAULT 0,
    github_created_at TIMESTAMPTZ NOT NULL,
    github_updated_at TIMESTAMPTZ NOT NULL,
    github_pushed_at TIMESTAMPTZ NOT NULL,
    license_spdx TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    last_synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Repository Snapshots Table (Time-series data for trending)
CREATE TABLE repository_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    stars_count INTEGER NOT NULL,
    forks_count INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Ensure only one snapshot per repository per day
    UNIQUE(repository_id, snapshot_date)
);

-- 4. Repository Domains (Many-to-Many Join Table)
CREATE TABLE repository_domains (
    repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    PRIMARY KEY (repository_id, domain_id)
);

-- 5. Performance Indexes
CREATE INDEX idx_repositories_language ON repositories(language);
CREATE INDEX idx_repositories_stars ON repositories(stars_count DESC);
CREATE INDEX idx_snapshots_date ON repository_snapshots(snapshot_date);
CREATE INDEX idx_snapshots_repo_id ON repository_snapshots(repository_id);
