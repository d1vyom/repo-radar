/**
 * Maps our internal "domain" slugs (seeded in Supabase, see
 * `supabase/migrations/20260816000000_seed_domains.sql`) to a curated set of
 * GitHub topic qualifiers used by the search API. The lists are intentionally
 * permissive so that sourcing by domain returns a healthy pool of repos even
 * before classification runs.
 *
 * Keys MUST match the `slug` column of the `domains` table.
 */
export const DOMAIN_TOPIC_MAP: Record<string, string[]> = {
  'blockchain': ['blockchain', 'ethereum', 'web3', 'solidity', 'crypto'],
  'machine-learning': ['machine-learning', 'tensorflow', 'pytorch', 'keras', 'scikit-learn'],
  'ai': ['ai', 'artificial-intelligence', 'openai', 'llm', 'generative-ai', 'gpt'],
  'web-development': ['react', 'nextjs', 'vue', 'frontend', 'backend', 'django', 'express'],
  'mobile-development': ['ios', 'android', 'react-native', 'flutter', 'swift', 'kotlin', 'mobile'],
  'cybersecurity': ['security', 'hacking', 'cryptography', 'penetration-testing', 'malware', 'infosec'],
  'data-science': ['data-science', 'pandas', 'numpy', 'data-analysis', 'jupyter', 'visualization'],
  'databases': ['database', 'sql', 'postgresql', 'mongodb', 'mysql', 'nosql', 'redis'],
  'game-development': ['game', 'unity', 'unreal-engine', 'godot', 'gamedev', 'opengl'],
  'devops': ['devops', 'docker', 'kubernetes', 'ci-cd', 'jenkins', 'terraform', 'ansible'],
  'cloud': ['cloud', 'aws', 'azure', 'gcp', 'serverless'],
  'developer-tools': ['cli', 'tooling', 'linter', 'compiler', 'bundler', 'developer-tools'],
  'education': ['education', 'learning', 'tutorial', 'course', 'learn', 'awesome-list'],
  'computer-vision': ['computer-vision', 'opencv', 'image-processing', 'object-detection'],
  'nlp': ['nlp', 'natural-language-processing', 'text-classification', 'nltk', 'spacy'],
  'robotics': ['robotics', 'ros', 'robot', 'autonomous'],
  'iot': ['iot', 'internet-of-things', 'embedded', 'arduino', 'raspberry-pi', 'mqtt', 'hardware'],
};

/**
 * Canonical list of supported domains, derived from the topic map so the two
 * sources of truth never drift apart. Used to seed the `/domains` page when
 * the database is unreachable.
 */
export const KNOWN_DOMAINS = Object.keys(DOMAIN_TOPIC_MAP).map((slug) => ({
  slug,
  name: slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' '),
}));

/**
 * Curated list of programming languages surfaced in the search filter UI.
 * Keep these in sync with the `<select>` options in `search-interface.tsx`.
 */
export const SUPPORTED_LANGUAGES = [
  'TypeScript',
  'JavaScript',
  'Python',
  'Go',
  'Rust',
  'Java',
  'C++',
  'C',
  'C#',
  'Ruby',
  'Swift',
  'Kotlin',
  'PHP',
  'Shell',
  'Dart',
];

/** App base URL, overridable via env for self-hosting / preview deployments. */
export const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_BASE_URL?.replace(/\/$/, '') || 'https://repo-radar-six.vercel.app';
