import { SearchProvider } from './search-provider.interface';
import { GoogleCustomSearchProvider } from './google-search.provider';
import { SerperSearchProvider } from './serper.provider';
import { BraveSearchProvider } from './brave.provider';
import { GeminiGroundingSearchProvider } from './gemini-grounding.provider';

export function getSearchProvider(overrideProvider?: string, userApiKey?: string): SearchProvider {
  const providerType = (overrideProvider || process.env.SEARCH_PROVIDER || 'auto').toLowerCase();

  if (providerType === 'google' || (providerType === 'auto' && process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID)) {
    try {
      return new GoogleCustomSearchProvider();
    } catch (e) {
      console.warn('Falling back from Google Search Provider:', e);
    }
  }

  if (providerType === 'serper' || (providerType === 'auto' && process.env.SERPER_API_KEY)) {
    try {
      return new SerperSearchProvider();
    } catch (e) {
      console.warn('Falling back from Serper Provider:', e);
    }
  }

  if (providerType === 'brave' || (providerType === 'auto' && process.env.BRAVE_SEARCH_API_KEY)) {
    try {
      return new BraveSearchProvider();
    } catch (e) {
      console.warn('Falling back from Brave Provider:', e);
    }
  }

  // Always fallback to Gemini Search Grounding (use user's BYOK key if available)
  return new GeminiGroundingSearchProvider(userApiKey);
}
