import { SearchProvider } from './search-provider.interface';
import { ExactSearchResult, SearchCheckResult, EvidenceItem } from '../../types';

export class GoogleCustomSearchProvider implements SearchProvider {
  name = 'Google Custom Search';
  private apiKey: string;
  private cx: string;

  constructor(apiKey?: string, cx?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_SEARCH_API_KEY || '';
    this.cx = cx || process.env.GOOGLE_SEARCH_ENGINE_ID || '';
  }

  async exactSearch(candidateName: string, strictnessMode: 'extreme' | 'commercial' = 'extreme'): Promise<ExactSearchResult> {
    const query = `"${candidateName}"`;
    if (!this.apiKey || !this.cx) {
      throw new Error('Google Custom Search API Key or Search Engine ID is missing');
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(this.apiKey)}&cx=${encodeURIComponent(this.cx)}&q=${encodeURIComponent(query)}&exactTerms=${encodeURIComponent(candidateName)}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Custom Search API error: ${response.statusText}`);
    }

    const data = await response.json();
    const totalResults = parseInt(data.searchInformation?.totalResults || '0', 10);
    const items = data.items || [];

    const evidence: EvidenceItem[] = items.map((item: any) => ({
      title: item.title || '',
      url: item.link || '',
      snippet: item.snippet || ''
    }));

    const nameLower = candidateName.toLowerCase();
    let hasCollision = false;

    if (strictnessMode === 'extreme') {
      hasCollision = totalResults > 0;
    } else {
      // Commercial mode: inspect titles/snippets for company/app/software/brand keywords
      hasCollision = evidence.some(e => {
        const text = (e.title + ' ' + e.snippet).toLowerCase();
        return text.includes(nameLower) && 
          (text.includes('company') || text.includes('app') || text.includes('software') || text.includes('official') || text.includes('inc') || text.includes('ltd') || text.includes('tech'));
      });
    }

    return {
      hasCollision,
      exactMatchCount: totalResults,
      totalResults,
      evidence,
      provider: this.name,
      query
    };
  }

  async contextualSearch(candidateName: string, context: string, strictnessMode: 'extreme' | 'commercial' = 'extreme'): Promise<SearchCheckResult> {
    const query = `"${candidateName}" ${context}`;
    if (!this.apiKey || !this.cx) {
      throw new Error('Google Custom Search credentials missing');
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(this.apiKey)}&cx=${encodeURIComponent(this.cx)}&q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Search error: ${response.statusText}`);
    }

    const data = await response.json();
    const totalResults = parseInt(data.searchInformation?.totalResults || '0', 10);
    const items = data.items || [];

    const evidence: EvidenceItem[] = items.map((item: any) => ({
      title: item.title || '',
      url: item.link || '',
      snippet: item.snippet || ''
    }));

    const hasCollision = strictnessMode === 'extreme' ? totalResults > 0 : totalResults >= 2;

    return {
      hasCollision,
      totalResults,
      evidence,
      provider: this.name,
      query,
      strictnessMode
    };
  }
}
