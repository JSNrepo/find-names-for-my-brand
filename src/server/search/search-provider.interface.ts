import { ExactSearchResult, SearchCheckResult } from '../../types';

export interface SearchProvider {
  name: string;
  exactSearch(name: string, strictnessMode?: 'extreme' | 'commercial'): Promise<ExactSearchResult>;
  contextualSearch(name: string, context: string, strictnessMode?: 'extreme' | 'commercial'): Promise<SearchCheckResult>;
}
