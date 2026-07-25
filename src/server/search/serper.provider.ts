import { SearchProvider } from './search-provider.interface';
import { ExactSearchResult, SearchCheckResult, EvidenceItem } from '../../types';

export class SerperSearchProvider implements SearchProvider {
  name = 'Serper API';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SERPER_API_KEY || '';
  }

  async exactSearch(candidateName: string, strictnessMode: 'extreme' | 'commercial' = 'extreme'): Promise<ExactSearchResult> {
    if (!this.apiKey) throw new Error('SERPER_API_KEY is missing');

    const query = `"${candidateName}"`;
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: query })
    });

    if (!response.ok) throw new Error(`Serper API error: ${response.statusText}`);

    const data = await response.json();
    const organic = data.organic || [];
    const totalResults = organic.length;

    const evidence: EvidenceItem[] = organic.map((item: any) => ({
      title: item.title || '',
      url: item.link || '',
      snippet: item.snippet || ''
    }));

    const hasCollision = strictnessMode === 'extreme' ? totalResults > 0 : evidence.some(e => 
      e.title.toLowerCase().includes(candidateName.toLowerCase()) || 
      (e.snippet && e.snippet.toLowerCase().includes(candidateName.toLowerCase()))
    );

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
    if (!this.apiKey) throw new Error('SERPER_API_KEY is missing');

    const query = `"${candidateName}" ${context}`;
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: query })
    });

    if (!response.ok) throw new Error(`Serper API error: ${response.statusText}`);

    const data = await response.json();
    const organic = data.organic || [];
    const evidence: EvidenceItem[] = organic.map((item: any) => ({
      title: item.title || '',
      url: item.link || '',
      snippet: item.snippet || ''
    }));

    return {
      hasCollision: organic.length > 0,
      totalResults: organic.length,
      evidence,
      provider: this.name,
      query,
      strictnessMode
    };
  }
}
