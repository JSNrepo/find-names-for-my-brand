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
      // Fallback if no key
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
        contents: `Perform an exact search check for the brand/product name "${candidateName}".
Determine if "${candidateName}" is currently used as a brand, company, app, software, product, domain, project, or online entity.
Return JSON with format:
{
  "hasCollision": boolean,
  "exactMatchCount": number,
  "summary": "short explanation",
  "evidence": [{"title": "string", "url": "string", "snippet": "string"}]
}
Notice: If strictnessMode is "extreme", set hasCollision=true if ANY active entity uses this exact name. If "commercial", set hasCollision=true only if commercially or officially used.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json'
        }
      });

      const text = response.text?.trim() || '{}';
      let parsed: any = {};
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        parsed = { hasCollision: false, exactMatchCount: 0, evidence: [] };
      }

      // Also extract grounding chunks if available
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const groundingEvidence: EvidenceItem[] = [];
      for (const chunk of chunks) {
        if (chunk.web?.uri && chunk.web?.title) {
          groundingEvidence.push({
            title: chunk.web.title,
            url: chunk.web.uri,
            snippet: `Found via web search for "${candidateName}"`
          });
        }
      }

      const combinedEvidence = [...(parsed.evidence || []), ...groundingEvidence];
      // Deduplicate evidence by URL
      const uniqueEvidenceMap = new Map<string, EvidenceItem>();
      for (const ev of combinedEvidence) {
        if (ev.url) uniqueEvidenceMap.set(ev.url, ev);
      }

      const uniqueEvidence = Array.from(uniqueEvidenceMap.values());

      let hasCollision = Boolean(parsed.hasCollision);
      if (strictnessMode === 'extreme' && uniqueEvidence.length > 0) {
        // In extreme mode, if there's any active grounding match using exact name, flag collision
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
        exactMatchCount: parsed.exactMatchCount || uniqueEvidence.length,
        totalResults: parsed.exactMatchCount || uniqueEvidence.length,
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
        contents: `Search web for "${candidateName}" ${context}.
Check if "${candidateName}" is used as a ${context} or brand.
Return JSON:
{
  "hasCollision": boolean,
  "totalResults": number,
  "evidence": [{"title": "string", "url": "string", "snippet": "string"}]
}`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json'
        }
      });

      const text = response.text?.trim() || '{}';
      let parsed: any = {};
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        parsed = { hasCollision: false, totalResults: 0, evidence: [] };
      }

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const evidence: EvidenceItem[] = [];
      for (const chunk of chunks) {
        if (chunk.web?.uri && chunk.web?.title) {
          evidence.push({
            title: chunk.web.title,
            url: chunk.web.uri,
            snippet: `Contextual check for "${candidateName}" ${context}`
          });
        }
      }

      return {
        hasCollision: Boolean(parsed.hasCollision || (strictnessMode === 'extreme' && evidence.length > 0)),
        totalResults: parsed.totalResults || evidence.length,
        evidence,
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
