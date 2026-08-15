import 'server-only';

export interface ClassificationResult {
  domainSlug: string;
  confidence: number;
}

interface KeywordRule {
  domainSlug: string;
  keywords: string[];
}

// Deterministic rules mapping keywords to domains
const CLASSIFICATION_RULES: KeywordRule[] = [
  { domainSlug: 'blockchain', keywords: ['web3', 'blockchain', 'ethereum', 'smart-contracts', 'solidity', 'crypto', 'bitcoin'] },
  { domainSlug: 'iot', keywords: ['iot', 'internet-of-things', 'embedded', 'arduino', 'raspberry-pi', 'mqtt', 'hardware'] },
  { domainSlug: 'web-development', keywords: ['react', 'nextjs', 'vue', 'frontend', 'backend', 'web', 'html', 'css', 'django', 'express'] },
  { domainSlug: 'machine-learning', keywords: ['machine-learning', 'ml', 'tensorflow', 'pytorch', 'keras', 'scikit-learn'] },
  { domainSlug: 'ai', keywords: ['ai', 'artificial-intelligence', 'openai', 'llm', 'generative-ai', 'gpt'] },
  { domainSlug: 'mobile-development', keywords: ['ios', 'android', 'react-native', 'flutter', 'swift', 'kotlin', 'mobile'] },
  { domainSlug: 'cybersecurity', keywords: ['security', 'hacking', 'cryptography', 'penetration-testing', 'malware', 'infosec'] },
  { domainSlug: 'data-science', keywords: ['data-science', 'pandas', 'numpy', 'data-analysis', 'jupyter', 'visualization'] },
  { domainSlug: 'databases', keywords: ['database', 'sql', 'postgresql', 'mongodb', 'mysql', 'nosql', 'redis'] },
  { domainSlug: 'game-development', keywords: ['game', 'unity', 'unreal-engine', 'godot', 'gamedev', 'opengl'] },
  { domainSlug: 'devops', keywords: ['devops', 'docker', 'kubernetes', 'ci-cd', 'jenkins', 'terraform', 'ansible'] },
  { domainSlug: 'cloud', keywords: ['cloud', 'aws', 'azure', 'gcp', 'serverless'] },
  { domainSlug: 'developer-tools', keywords: ['cli', 'tooling', 'linter', 'compiler', 'bundler', 'developer-tools'] },
  { domainSlug: 'education', keywords: ['education', 'learning', 'tutorial', 'course', 'learn', 'awesome-list'] },
  { domainSlug: 'computer-vision', keywords: ['computer-vision', 'cv', 'opencv', 'image-processing', 'object-detection'] },
  { domainSlug: 'nlp', keywords: ['nlp', 'natural-language-processing', 'text-classification', 'nltk', 'spacy'] },
  { domainSlug: 'robotics', keywords: ['robotics', 'ros', 'robot', 'autonomous'] },
];

/**
 * Classifies a repository based on its description, topics, and language.
 * Returns an array of domains that meet the minimum confidence threshold.
 */
export function classifyRepository(
  description: string | null,
  topics: string[],
  language: string | null
): ClassificationResult[] {
  const results: Map<string, number> = new Map();
  const textToAnalyze = `${description || ''} ${topics.join(' ')} ${language || ''}`.toLowerCase();

  CLASSIFICATION_RULES.forEach((rule) => {
    let score = 0;

    rule.keywords.forEach((keyword) => {
      // Topics carry a heavier weight (0.6) as they are explicitly defined tags
      if (topics.some((t) => t.toLowerCase() === keyword)) {
        score += 0.6;
      }
      // Description and language parsing carry a standard weight (0.3)
      else if (textToAnalyze.includes(keyword)) {
        score += 0.3;
      }
    });

    if (score > 0) {
      // Cap confidence at 0.99 for deterministic (reserving 1.0 for manual overrides if ever needed)
      const confidence = Math.min(score, 0.99);
      if (confidence >= 0.5) {
        results.set(rule.domainSlug, Number(confidence.toFixed(2)));
      }
    }
  });

  return Array.from(results.entries()).map(([domainSlug, confidence]) => ({
    domainSlug,
    confidence,
  }));
}
