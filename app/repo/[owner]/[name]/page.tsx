import sanitizeHtml from 'sanitize-html';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRepository, getRepositoryReadme, getLatestRelease } from '@/lib/github/repo';
import { Star, GitFork, Eye, AlertCircle, Clock, HardDrive, Shield, Terminal, ExternalLink, Archive, Tag, ChevronLeft } from 'lucide-react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { owner: string; name: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const repo = await getRepository(params.owner, params.name);
    if (!repo) return { title: 'Repository Not Found | RepoRadar' };
    
    return {
      title: `${repo.full_name} | RepoRadar`,
      description: repo.description || `View statistics and details for ${repo.full_name} on GitHub.`,
      openGraph: {
        title: repo.full_name,
        description: repo.description || '',
        images: [repo.owner.avatar_url || `https://github.com/${repo.owner.login}.png?size=80`],
      },
    };
  } catch (error) {
    console.error('generateMetadata error:', error);
    return { title: 'Error | RepoRadar' };
  }
}

export default async function RepositoryDetailPage({ params }: PageProps) {
  let repo, readmeHtml, latestRelease;
  let safeReadmeHtml = null;

  try {
    const fetchWithTimeout = async <T,>(promise: Promise<T>): Promise<T> => {
      const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 8000));
      return Promise.race([promise, timeout]);
    };

    [repo, readmeHtml, latestRelease] = await Promise.all([
      fetchWithTimeout(getRepository(params.owner, params.name)),
      fetchWithTimeout(getRepositoryReadme(params.owner, params.name)),
      fetchWithTimeout(getLatestRelease(params.owner, params.name))
    ]);

    if (readmeHtml) {
      safeReadmeHtml = sanitizeHtml(readmeHtml, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          '*': ['class', 'id', 'align', 'dir'],
          'img': ['src', 'alt', 'width', 'height', 'max-width']
        },
        allowedSchemes: ['http', 'https', 'mailto']
      });
    }

  } catch (error: unknown) {
    const err = error as Error;
    console.error('RepositoryDetailPage error:', err);
    return (
      <div className="section py-20 text-center animate-fade-in">
        <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Failed to load repository</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          {err.message === 'RATE_LIMIT' 
            ? 'GitHub API rate limit exceeded. Please try again later.' 
            : err.message === 'TIMEOUT'
            ? 'The request took too long to complete.'
            : 'There was an error communicating with the GitHub API.'}
        </p>
        <Link href="/" className="mt-6 btn-primary inline-flex">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back to Home
        </Link>
      </div>
    );
  }

  if (!repo) {
    notFound();
  }

  const sizeMB = (repo.size / 1024).toFixed(2);

  return (
    <div className="section py-12 space-y-10">
      {/* Header Section */}
      <div className="border-b border-border/30 pb-10 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="relative shrink-0">
              <Image 
                src={repo.owner.avatar_url || `https://github.com/${repo.owner.login}.png?size=80`}
                alt={repo.owner.login} 
                width={80}
                height={80}
                unoptimized
                className="rounded-2xl border border-border/30"
                sizes="80px"
                />
              {repo.archived && (
                <div className="absolute -bottom-2 -right-2">
                  <span className="badge badge-warning px-2 py-1 text-xs">
                    <Archive className="h-3 w-3" aria-hidden="true" />
                    Archived
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex flex-wrap items-center gap-2">
                <Link 
                  href={`/search?q=${repo.owner.login}`} 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {repo.owner.login}
                </Link>
                <span className="text-muted-foreground">/</span>
                <span>{repo.name}</span>
                {repo.fork && (
                  <span className="badge bg-blue-500/10 text-blue-400 border-blue-500/20">
                    <GitFork className="w-3 h-3" /> Fork
                  </span>
                )}
              </h1>
              <p className="text-lg text-muted-foreground mt-3 max-w-2xl">
                {repo.description || 'No description provided.'}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {repo.language && (
                  <span className="badge gap-1.5 bg-primary/10 text-primary border-primary/20">
                    <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                    {repo.language}
                  </span>
                )}
                {repo.license?.spdx_id && (
                  <span className="badge badge-muted">
                    <Shield className="h-3 w-3" aria-hidden="true" />
                    {repo.license.spdx_id}
                  </span>
                )}
                <span className="badge badge-muted">
                  <HardDrive className="h-3 w-3" aria-hidden="true" />
                  {sizeMB} MB
                </span>
              </div>
            </div>
          </div>
          
          <a 
            href={repo.html_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary shrink-0"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            View on GitHub
          </a>
        </div>
      </div>

      {/* Topics */}
      {repo.topics && repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
          {repo.topics.map((topic: string) => (
            <Link
              key={topic}
              href={`/search?topic=${encodeURIComponent(topic)}`}
              className="badge badge-primary gap-1.5 hover:bg-primary/20 hover:border-primary/30"
            >
              {topic}
              <ChevronLeft className="h-3 w-3" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Readme & Clone Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Clone */}
          <div className="card p-5 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium flex items-center gap-2 text-foreground">
                <Terminal className="w-4 h-4" aria-hidden="true" />
                Clone Repository
              </h3>
            </div>
            <div className="relative">
              <div className="bg-background border border-border rounded-lg p-4 font-mono text-sm text-emerald-400 overflow-x-auto">
                git clone {repo.clone_url}
              </div>
              <button 
                className="absolute top-3 right-3 btn-ghost p-1.5 text-xs"
                onClick={() => navigator.clipboard.writeText(`git clone ${repo.clone_url}`)}
                aria-label="Copy clone command"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              </button>
            </div>
          </div>

          {/* README Preview */}
          <div className="card overflow-hidden animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="border-b border-border/30 bg-surface-2 p-5">
              <h2 className="font-semibold flex items-center gap-2 text-foreground">README Preview</h2>
            </div>
            <div className="p-6 md:p-8 overflow-x-auto">
              {safeReadmeHtml ? (
                <article 
                  className="prose prose-invert max-w-none prose-img:rounded-lg prose-a:text-primary prose-headings:text-foreground prose-code:bg-surface-3 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
                  dangerouslySetInnerHTML={{ __html: safeReadmeHtml }}
                />
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p className="text-muted-foreground italic text-lg">No README file available for this repository.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Meta & Stats */}
        <div className="space-y-6">
          
          {/* Key Metrics */}
          <div className="card p-5 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h3 className="font-semibold mb-5 text-foreground">Key Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-surface-2 rounded-xl">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm mb-1">
                  <Star className="w-4 h-4" aria-hidden="true" />
                  Stars
                </div>
                <span className="text-2xl font-bold tabular-nums text-foreground">{repo.stargazers_count.toLocaleString()}</span>
              </div>
              <div className="text-center p-3 bg-surface-2 rounded-xl">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm mb-1">
                  <GitFork className="w-4 h-4" aria-hidden="true" />
                  Forks
                </div>
                <span className="text-2xl font-bold tabular-nums text-foreground">{repo.forks_count.toLocaleString()}</span>
              </div>
              <div className="text-center p-3 bg-surface-2 rounded-xl">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm mb-1">
                  <Eye className="w-4 h-4" aria-hidden="true" />
                  Watchers
                </div>
                <span className="text-2xl font-bold tabular-nums text-foreground">{repo.watchers_count.toLocaleString()}</span>
              </div>
              <div className="text-center p-3 bg-surface-2 rounded-xl">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm mb-1">
                  <AlertCircle className="w-4 h-4" aria-hidden="true" />
                  Issues
                </div>
                <span className="text-2xl font-bold tabular-nums text-foreground">{repo.open_issues_count.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="card p-5 space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h3 className="font-semibold text-foreground">About</h3>
            
            {repo.language && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Language</span>
                <span className="font-medium flex items-center gap-2 text-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  {repo.language}
                </span>
              </div>
            )}
            
            {repo.license?.name && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">License</span>
                <span className="font-medium flex items-center gap-1 text-foreground">
                  <Shield className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  {repo.license.spdx_id || repo.license.name}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Size</span>
              <span className="font-medium flex items-center gap-1 text-foreground">
                <HardDrive className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                {sizeMB} MB
              </span>
            </div>

            <div className="flex items-center justify-between text-sm pt-2 border-t border-border/30">
              <span className="text-muted-foreground">Default Branch</span>
              <span className="font-medium text-foreground font-mono">{repo.default_branch || 'main'}</span>
            </div>
          </div>

          {/* Timestamps */}
          <div className="card p-5 space-y-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h3 className="font-semibold text-foreground">Timeline</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm p-3 bg-surface-2 rounded-lg">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-muted-foreground block">Created</span>
                  <span className="font-medium text-foreground">{new Date(repo.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm p-3 bg-surface-2 rounded-lg">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-muted-foreground block">Last Updated</span>
                  <span className="font-medium text-foreground">{new Date(repo.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm p-3 bg-surface-2 rounded-lg">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-muted-foreground block">Last Pushed</span>
                  <span className="font-medium text-foreground">{new Date(repo.pushed_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Release */}
          {latestRelease && (
            <div className="card p-5 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <h3 className="font-semibold flex items-center gap-2 mb-4 text-foreground">
                <Tag className="w-4 h-4" aria-hidden="true" /> Latest Release
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-sm font-medium px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                  {latestRelease.tag_name}
                  {latestRelease.name && ` - ${latestRelease.name}`}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(latestRelease.published_at).toLocaleDateString()}
                </span>
              </div>
              {latestRelease.body && (
                <div className="mt-4 p-3 bg-surface-2 rounded-lg text-sm text-muted-foreground line-clamp-3">
                  {latestRelease.body}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}