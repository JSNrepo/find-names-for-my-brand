import { SearchProvider } from './search-provider.interface';
import { ExactSearchResult, SearchCheckResult, EvidenceItem } from '../../types';

function extractResults(html: string): EvidenceItem[] {
  const results: EvidenceItem[] = [];
  const resultRegex = /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  const snippetRegex = /<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;

  const urls: string[] = [];
  const titles: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = resultRegex.exec(html)) !== null) {
    let url = m[1].trim();
    if (url.startsWith('//')) url = 'https:' + url;
    if (url.startsWith('/')) url = 'https://duckduckgo.com' + url;
    if (!url.startsWith('http')) continue;
    const title = m[2].replace(/<[^>]*>/g, '').trim();
    if (title && url) {
      urls.push(url);
      titles.push(title);
    }
  }

  const snippets: string[] = [];
  while ((m = snippetRegex.exec(html)) !== null) {
    snippets.push(m[1].replace(/<[^>]*>/g, '').trim());
  }

  for (let i = 0; i < urls.length; i++) {
    results.push({
      title: titles[i] || '',
      url: urls[i],
      snippet: snippets[i] || ''
    });
  }

  return results;
}

export class DuckDuckGoSearchProvider implements SearchProvider {
  name = 'DuckDuckGo Web Search';

  async exactSearch(candidateName: string, strictnessMode: 'extreme' | 'commercial' = 'extreme'): Promise<ExactSearchResult> {
    const query = `"${candidateName}"`;
    try {
      const res = await fetch('https://html.duckduckgo.com/html/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: new URLSearchParams({ q: `${candidateName} company brand product software` }).toString()
      });

      if (!res.ok) {
        return { hasCollision: false, exactMatchCount: 0, totalResults: 0, evidence: [], provider: this.name, query };
      }

      const html = await res.text();
      const evidence = extractResults(html);

      const nameLower = candidateName.toLowerCase();
      const hasCollision = evidence.some(e =>
        e.title.toLowerCase().includes(nameLower) ||
        (e.snippet && e.snippet.toLowerCase().includes(nameLower))
      ) || evidence.length >= 3;

      return {
        hasCollision,
        exactMatchCount: evidence.length,
        totalResults: evidence.length,
        evidence,
        provider: this.name,
        query
      };
    } catch {
      return { hasCollision: false, exactMatchCount: 0, totalResults: 0, evidence: [], provider: this.name, query };
    }
  }

  async contextualSearch(candidateName: string, context: string, strictnessMode: 'extreme' | 'commercial' = 'extreme'): Promise<SearchCheckResult> {
    const query = `"${candidateName}" ${context}`;
    try {
      const res = await fetch('https://html.duckduckgo.com/html/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: new URLSearchParams({ q }).toString()
      });

      if (!res.ok) {
        return { hasCollision: false, totalResults: 0, evidence: [], provider: this.name, query, strictnessMode };
      }

      const html = await res.text();
      const evidence = extractResults(html);

      return {
        hasCollision: evidence.length > 0,
        totalResults: evidence.length,
        evidence,
        provider: this.name,
        query,
        strictnessMode
      };
    } catch {
      return { hasCollision: false, totalResults: 0, evidence: [], provider: this.name, query, strictnessMode };
    }
  }
}
