import { GoogleGenAI } from '@google/genai';
import { SearchProvider } from './search-provider.interface';
import { ExactSearchResult, SearchCheckResult, EvidenceItem } from '../../types';

export class GeminiGroundingSearchProvider implements SearchProvider {
  name = 'Gemini Google Search Grounding';
  private ai: GoogleGenAI | null = null;

  constructor(userApiKey?: string) {
    const key = userApiKey || process.env.GEMINI_API_KEY;
    if (key) {
      this.ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
    }
  }

  async exactSearch(candidateName: string, strictnessMode: 'extreme' | 'commercial' = 'extreme'): Promise<ExactSearchResult> {
    const query = `"${candidateName}"`;
    if (!this.ai) {
      return {
        hasCollision: false,
        exactMatchCount: 0,
        totalResults: 0,
        evidence: [],
        provider: this.name,
        query
      };
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Search the web for the exact brand/product name "${candidateName}" and tell me if it is currently used by any company, product, software, app, organization, or online entity anywhere in the world.

First use Google Search to find ALL results. Then analyze what you found.

Return ONLY valid JSON with this exact structure (no markdown, no code fences):
{
  "hasCollision": boolean,
  "exactMatchCount": number,
  "summary": "list every entity you found using this name",
  "evidence": [{"title": "string", "url": "string", "snippet": "string"}]
}

IMPORTANT: In extreme strictness mode, hasCollision must be true if ANY entity anywhere uses this exact name, regardless of industry or geography.`,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.1
        }
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const groundingEvidence: EvidenceItem[] = [];
      for (const chunk of chunks) {
        if (chunk.web?.uri && chunk.web?.title) {
          groundingEvidence.push({
            title: chunk.web.title,
            url: chunk.web.uri,
            snippet: `Found via Google Search for "${candidateName}"`
          });
        }
      }

      let parsedEvidence: EvidenceItem[] = [];
      let parsedHasCollision = false;
      let parsedExactMatchCount = 0;
      try {
        const text = response.text?.trim() || '';
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const json = text.slice(jsonStart, jsonEnd + 1);
          const parsed = JSON.parse(json);
          parsedEvidence = parsed.evidence || [];
          parsedHasCollision = Boolean(parsed.hasCollision);
          parsedExactMatchCount = parsed.exactMatchCount || 0;
        }
      } catch { }

      const combinedEvidence = [...parsedEvidence, ...groundingEvidence];
      const uniqueEvidenceMap = new Map<string, EvidenceItem>();
      for (const ev of combinedEvidence) {
        if (ev.url) uniqueEvidenceMap.set(ev.url, ev);
      }
      const uniqueEvidence = Array.from(uniqueEvidenceMap.values());

      const hasGroundingResults = groundingEvidence.length > 0;
      let hasCollision = parsedHasCollision || hasGroundingResults;

      if (strictnessMode === 'extreme' && uniqueEvidence.length > 0) {
        const nameLower = candidateName.toLowerCase();
        const foundExactInTitleOrSnippet = uniqueEvidence.some(e =>
          e.title.toLowerCase().includes(nameLower) || (e.snippet && e.snippet.toLowerCase().includes(nameLower))
        );
        if (foundExactInTitleOrSnippet) {
          hasCollision = true;
        }
      }

      return {
        hasCollision,
        exactMatchCount: parsedExactMatchCount || uniqueEvidence.length,
        totalResults: uniqueEvidence.length,
        evidence: uniqueEvidence,
        provider: this.name,
        query
      };
    } catch (err) {
      console.error('Gemini search grounding error:', err);
      return {
        hasCollision: false,
        exactMatchCount: 0,
        totalResults: 0,
        evidence: [],
        provider: this.name,
        query
      };
    }
  }

  async contextualSearch(candidateName: string, context: string, strictnessMode: 'extreme' | 'commercial' = 'extreme'): Promise<SearchCheckResult> {
    const query = `"${candidateName}" ${context}`;
    if (!this.ai) {
      return {
        hasCollision: false,
        totalResults: 0,
        evidence: [],
        provider: this.name,
        query,
        strictnessMode
      };
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Search the web for "${candidateName}" in the context of "${context}".
Use Google Search to find if "${candidateName}" is used as a ${context} or brand.

Return ONLY valid JSON (no markdown, no code fences):
{
  "hasCollision": boolean,
  "totalResults": number,
  "summary": "what entities were found",
  "evidence": [{"title": "string", "url": "string", "snippet": "string"}]
}`,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.1
        }
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const groundingEvidence: EvidenceItem[] = [];
      for (const chunk of chunks) {
        if (chunk.web?.uri && chunk.web?.title) {
          groundingEvidence.push({
            title: chunk.web.title,
            url: chunk.web.uri,
            snippet: `Contextual check for "${candidateName}" ${context}`
          });
        }
      }

      let parsedHasCollision = false;
      let parsedTotalResults = 0;
      let parsedEvidence: EvidenceItem[] = [];
      try {
        const text = response.text?.trim() || '';
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const json = text.slice(jsonStart, jsonEnd + 1);
          const parsed = JSON.parse(json);
          parsedHasCollision = Boolean(parsed.hasCollision);
          parsedTotalResults = parsed.totalResults || 0;
          parsedEvidence = parsed.evidence || [];
        }
      } catch { }

      const combined = [...parsedEvidence, ...groundingEvidence];
      const uniqueMap = new Map<string, EvidenceItem>();
      for (const ev of combined) {
        if (ev.url) uniqueMap.set(ev.url, ev);
      }
      const uniqueEvidence = Array.from(uniqueMap.values());

      return {
        hasCollision: parsedHasCollision || groundingEvidence.length > 0,
        totalResults: parsedTotalResults || uniqueEvidence.length,
        evidence: uniqueEvidence,
        provider: this.name,
        query,
        strictnessMode
      };
    } catch (e) {
      return {
        hasCollision: false,
        totalResults: 0,
        evidence: [],
        provider: this.name,
        query,
        strictnessMode
      };
    }
  }
}
