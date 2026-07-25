import { GoogleGenAI } from '@google/genai';
import { SearchProvider } from './search-provider.interface';
import { ExactSearchResult, SearchCheckResult, EvidenceItem } from '../../types';

export class GeminiGroundingSearchProvider implements SearchProvider {
  name = 'Gemini Knowledge + DNS';
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
    const query = `"${candidateName}" brand check`;
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
        contents: `You are a brand collision detector. Your job is to identify if the name "${candidateName}" is already used by any real company, product, software, app, organization, or online entity.

Think carefully. Check the name against everything you know from your training data. Be thorough — search your memory for ALL entities using this exact name, across all industries and countries.

For each entity you find, provide the name, what it does, and a URL (if you know one).

Return ONLY valid JSON with this exact structure — no other text, no markdown:
{
  "hasCollision": true,
  "exactMatchCount": 2,
  "summary": "List of all known entities using this name",
  "evidence": [
    {"title": "Entity name and description", "url": "https://known-url-if-available", "snippet": "What this entity does"}
  ]
}

If you find no real entities using this name, return:
{
  "hasCollision": false,
  "exactMatchCount": 0,
  "summary": "Nothing found",
  "evidence": []
}

CRITICAL: hasCollision MUST be true if ANY real company, product, software, app, or organization uses this exact name. Do not guess or make up entities — only use what you know from training.`,
        config: { temperature: 0 }
      });

      const text = response.text?.trim() || '';
      let hasCollision = false;
      let exactMatchCount = 0;
      let evidence: EvidenceItem[] = [];

      try {
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
          hasCollision = Boolean(parsed.hasCollision);
          exactMatchCount = parsed.exactMatchCount || 0;
          evidence = parsed.evidence || [];
        }
      } catch {}

      return {
        hasCollision,
        exactMatchCount,
        totalResults: evidence.length,
        evidence,
        provider: this.name,
        query
      };
    } catch (err) {
      console.error('Gemini knowledge check error:', err);
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
        contents: `Is the name "${candidateName}" used by any real ${context} or brand? Search your training knowledge.

Return ONLY this JSON structure:
{
  "hasCollision": true/false,
  "totalResults": number,
  "summary": "what was found",
  "evidence": [{"title": "string", "url": "string", "snippet": "string"}]
}

hasCollision = true if any real ${context} entity uses this exact name.`,
        config: { temperature: 0 }
      });

      const text = response.text?.trim() || '';
      let hasCollision = false;
      let totalResults = 0;
      let evidence: EvidenceItem[] = [];

      try {
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
          hasCollision = Boolean(parsed.hasCollision);
          totalResults = parsed.totalResults || 0;
          evidence = parsed.evidence || [];
        }
      } catch {}

      return {
        hasCollision,
        totalResults,
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
