import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { KNOWN_DOMAINS, DOMAIN_TOPIC_MAP, SUPPORTED_LANGUAGES } from '@/lib/constants';
import { PLACEHOLDER_REPOS } from '@/lib/placeholder-data';

export async function getDomains() {
  try {
    const { data, error } = await getSupabaseAdmin().from('domains').select('id, slug, name');
    if (error || !data?.length) throw new Error('Domain directory unavailable');
    const counts = new Map<string, number>();
    for (let start = 0; ; start += 1000) {
      const { data: links, error: linkError } = await getSupabaseAdmin().from('repository_domains')
        .select('domain_id').order('repository_id').order('domain_id').range(start, start + 999);
      if (linkError || !links) throw new Error('Domain counts unavailable');
      for (const link of links) counts.set(link.domain_id, (counts.get(link.domain_id) ?? 0) + 1);
      if (links.length < 1000) break;
    }
    return data.map(domain => ({ ...domain, count: counts.get(domain.id) ?? 0, is_sample: false }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  } catch {
    return KNOWN_DOMAINS.map(domain => ({ ...domain, count: PLACEHOLDER_REPOS.filter(repo =>
      repo.topics.some(topic => DOMAIN_TOPIC_MAP[domain.slug].includes(topic))).length, is_sample: true }));
  }
}

export async function getTopLanguages(limit = 24) {
  try {
    const counts = new Map<string, number>();
    for (let start = 0; ; start += 1000) {
      const { data, error } = await getSupabaseAdmin().from('repositories').select('language')
        .not('language', 'is', null).order('id').range(start, start + 999);
      if (error || !data) throw new Error('Language directory unavailable');
      for (const row of data) if (row.language) counts.set(row.language, (counts.get(row.language) ?? 0) + 1);
      if (data.length < 1000) break;
    }
    if (!counts.size) return SUPPORTED_LANGUAGES.slice(0, limit).map(language => ({ language, count: 0, is_sample: false }));
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit)
      .map(([language, count]) => ({ language, count, is_sample: false }));
  } catch {
    return SUPPORTED_LANGUAGES.slice(0, limit).map(language => ({ language, is_sample: true,
      count: PLACEHOLDER_REPOS.filter(repo => repo.language === language).length,
    }));
  }
}
