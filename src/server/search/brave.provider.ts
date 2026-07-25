import { SearchProvider } from './search-provider.interface';
import { ExactSearchResult, SearchCheckResult, EvidenceItem } from '../../types';

export class BraveSearchProvider implements SearchProvider {
  name = 'Brave Search';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.BRAVE_SEARCH_API_KEY || '';
  }

  async exactSearch(candidateName: string, strictnessMode: 'extreme' | 'commercial' = 'extreme'): Promise<ExactSearchResult> {
    if (!this.apiKey) throw new Error('BRAVE_SEARCH_API_KEY is missing');

    const query = `"${candidateName}"`;
    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': this.apiKey
      }
    });

    if (!response.ok) throw new Error(`Brave Search API error: ${response.statusText}`);

    const data = await response.json();
    const results = data.web?.results || [];
    const totalResults = results.length;

    const evidence: EvidenceItem[] = results.map((item: any) => ({
      title: item.title || '',
      url: item.url || '',
      snippet: item.description || ''
    }));

    return {
      hasCollision: strictnessMode === 'extreme' ? totalResults > 0 : totalResults > 1,
      exactMatchCount: totalResults,
      totalResults,
      evidence,
      provider: this.name,
      query
    };
  }

  async contextualSearch(candidateName: string, context: string, strictnessMode: 'extreme' | 'commercial' = 'extreme'): Promise<SearchCheckResult> {
    if (!this.apiKey) throw new Error('BRAVE_SEARCH_API_KEY is missing');

    const query = `"${candidateName}" ${context}`;
    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': this.apiKey
      }
    });

    if (!response.ok) throw new Error(`Brave Search API error: ${response.statusText}`);

    const data = await response.json();
    const results = data.web?.results || [];
    const evidence: EvidenceItem[] = results.map((item: any) => ({
      title: item.title || '',
      url: item.url || '',
      snippet: item.description || ''
    }));

    return {
      hasCollision: results.length > 0,
      totalResults: results.length,
      evidence,
      provider: this.name,
      query,
      strictnessMode
    };
  }
}
