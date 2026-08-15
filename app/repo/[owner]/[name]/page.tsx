import sanitizeHtml from 'sanitize-html';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRepository, getRepositoryReadme, getLatestRelease } from '@/lib/github/repo';
import { Star, GitFork, Eye, AlertCircle, Clock, HardDrive, Shield, Terminal, ExternalLink, Archive, Tag } from 'lucide-react';
import Image from 'next/image';

interface PageProps {
  params: { owner: string; name: string };
}

// 1. Dynamic SEO Metadata
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
        images: [repo.owner.avatar_url],
      },
    };
  } catch {
    return { title: 'Error | RepoRadar' };
  }
}

// 2. Main Page Component
export default async function RepositoryDetailPage({ params }: PageProps) {
  let repo, readmeHtml, latestRelease;
  let safeReadmeHtml = null;

  try {
    // Add a strict timeout to parallel fetching to prevent hanging requests
    const fetchWithTimeout = async <T,>(promise: Promise<T>): Promise<T> => {
      const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 8000));
      return Promise.race([promise, timeout]);
    };

    [repo, readmeHtml, latestRelease] = await Promise.all([
      fetchWithTimeout(getRepository(params.owner, params.name)),
      fetchWithTimeout(getRepositoryReadme(params.owner, params.name)),
      fetchWithTimeout(getLatestRelease(params.owner, params.name))
    ]);

    // XSS Mitigation: Sanitize the GitHub HTML output
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
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Failed to load repository</h1>
        <p className="text-muted-foreground">
          {err.message === 'RATE_LIMIT' 
            ? 'GitHub API rate limit exceeded. Please try again later.' 
            : err.message === 'TIMEOUT'
            ? 'The request took too long to complete.'
            : 'There was an error communicating with the GitHub API.'}
        </p>
      </div>
    );
  }

  // Handle 404 (Private, deleted, or misspelled repos)
  if (!repo) {
    notFound();
  }

  // GitHub returns size in KB
  const sizeMB = (repo.size / 1024).toFixed(2);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8 border-b border-border/50 pb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image 
              src={repo.owner.avatar_url} 
              alt={repo.owner.login} 
              width={64}
              height={64}
              unoptimized
              className="rounded-xl border border-border/50"
            />
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Link href={`/search?q=${repo.owner.login}`} className="hover:underline text-muted-foreground">
                  {repo.owner.login}
                </Link>
                <span className="text-muted-foreground">/</span>
                <span>{repo.name}</span>
                {repo.archived && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full flex items-center gap-1">
                    <Archive className="w-3 h-3" /> Archived
                  </span>
                )}
                {repo.fork && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full flex items-center gap-1">
                    <GitFork className="w-3 h-3" /> Fork
                  </span>
                )}
              </h1>
              <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
                {repo.description || 'No description provided.'}
              </p>
            </div>
          </div>
          
          <a 
            href={repo.html_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-medium rounded-md hover:bg-gray-200 transition-colors shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
            View on GitHub
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Readme & Clone Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Topics */}
          {repo.topics && repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {repo.topics.map((topic: string) => (
                <span key={topic} className="px-3 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-full border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-pointer">
                  {topic}
                </span>
              ))}
            </div>
          )}

          {/* Quick Clone */}
          <div className="bg-[#111111] border border-border/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4" /> Clone Repository
            </h3>
            <div className="flex items-center gap-2 bg-black/50 border border-border p-2 rounded text-sm font-mono overflow-x-auto text-emerald-400">
              git clone {repo.clone_url}
            </div>
          </div>

          {/* README Preview */}
          <div className="bg-[#111111] border border-border/50 rounded-lg overflow-hidden">
            <div className="border-b border-border/50 bg-black/20 p-4">
              <h2 className="font-semibold flex items-center gap-2">README Preview</h2>
            </div>
            <div className="p-6 md:p-8 overflow-x-auto">
              {safeReadmeHtml ? (
                <article 
                  className="prose prose-invert max-w-none prose-img:rounded-lg prose-a:text-blue-400"
                  dangerouslySetInnerHTML={{ __html: safeReadmeHtml }} // Now mathematically safe
                />
              ) : (
                <p className="text-muted-foreground italic text-center py-8">
                  No README file available for this repository.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Meta & Stats */}
        <div className="space-y-6">
          
          {/* Key Metrics */}
          <div className="bg-[#111111] border border-border/50 rounded-lg p-4 grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-sm flex items-center gap-1"><Star className="w-4 h-4"/> Stars</span>
              <span className="text-xl font-semibold">{repo.stargazers_count.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-sm flex items-center gap-1"><GitFork className="w-4 h-4"/> Forks</span>
              <span className="text-xl font-semibold">{repo.forks_count.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-sm flex items-center gap-1"><Eye className="w-4 h-4"/> Watchers</span>
              <span className="text-xl font-semibold">{repo.watchers_count.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Issues</span>
              <span className="text-xl font-semibold">{repo.open_issues_count.toLocaleString()}</span>
            </div>
          </div>

          {/* Details */}
          <div className="bg-[#111111] border border-border/50 rounded-lg p-5 space-y-4">
            <h3 className="font-semibold mb-2">About</h3>
            
            {repo.language && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Language</span>
                <span className="font-medium flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  {repo.language}
                </span>
              </div>
            )}
            
            {repo.license?.name && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">License</span>
                <span className="font-medium flex items-center gap-1">
                  <Shield className="w-4 h-4 text-muted-foreground"/> {repo.license.spdx_id || repo.license.name}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Size</span>
              <span className="font-medium flex items-center gap-1">
                <HardDrive className="w-4 h-4 text-muted-foreground"/> {sizeMB} MB
              </span>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-[#111111] border border-border/50 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground shrink-0"/>
              <div>
                <span className="text-muted-foreground block">Created</span>
                <span>{new Date(repo.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground shrink-0"/>
              <div>
                <span className="text-muted-foreground block">Last Updated</span>
                <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground shrink-0"/>
              <div>
                <span className="text-muted-foreground block">Last Pushed</span>
                <span>{new Date(repo.pushed_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Latest Release */}
          {latestRelease && (
            <div className="bg-[#111111] border border-border/50 rounded-lg p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4" /> Latest Release
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                  {latestRelease.tag_name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(latestRelease.published_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
