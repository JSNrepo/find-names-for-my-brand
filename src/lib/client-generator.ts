import { GoogleGenAI, Type } from '@google/genai';
import type { Candidate, ProjectBrief } from '../types';

function estimatedSyllables(word: string): number {
  const w = word.toLowerCase().trim();
  if (w.length <= 3) return 1;
  const cleaned = w.replace(/(?:[^laeiouy]|ed|es|e)$/i, '').replace(/^y/i, '');
  const matches = cleaned.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

function pronunciationScore(name: string): number {
  const s = estimatedSyllables(name);
  let score = 100;
  score -= s * 5;
  if (name.length > 8) score -= 10;
  if (/[^aeiouy]{3,}/i.test(name)) score -= 10;
  if (/(ough|eigh|psh|mn|cz|kn|gn|wr)/.test(name.toLowerCase())) score -= 10;
  return Math.min(100, Math.max(60, score));
}

export async function generateCandidates(
  apiKey: string,
  brief: ProjectBrief,
  count: number = 40,
  likedName?: string
): Promise<Candidate[]> {
  const ai = new GoogleGenAI({ apiKey });

  const avoidTermsStr = brief.avoidTerms.join(', ') || 'none';
  const personalityStr = brief.personality.join(', ') || 'modern, professional';
  const meaningsStr = brief.meanings.join(', ') || 'readiness, progress';

  const prompt = likedName
    ? `You are a creative naming expert. Generate ${count} original brand names for:

PROJECT: ${brief.productType}
DESCRIPTION: ${brief.description}
AUDIENCE: ${brief.audience}
INDUSTRY: ${brief.industry}
VIBE: ${personalityStr}
THEMES: ${meaningsStr}

The user liked "${likedName}". Create names with a similar creative spirit but using completely different roots and structures. No lazy letter swaps.

RULES:
- Length: ${brief.minimumLetters}-${brief.maximumLetters} chars, max ${brief.maximumSyllables} syllables
- Easy global pronunciation
- Not standard dictionary words
- Avoid: ${avoidTermsStr}
- Avoid: -ify, -ly, -io, -ai, -labs, -hub suffixes
- Avoid: obvious famous brand clones

Each name should be unique in structure and sound. Don't repeat patterns across the batch.

Return JSON array.`
    : `You are a creative naming expert. Brainstorm ${count} original brand names for:

PROJECT: ${brief.productType}
DESCRIPTION: ${brief.description}
AUDIENCE: ${brief.audience}
INDUSTRY: ${brief.industry}
VIBE: ${personalityStr}
THEMES: ${meaningsStr}

RULES:
- Length: ${brief.minimumLetters}-${brief.maximumLetters} chars, max ${brief.maximumSyllables} syllables
- Globally easy to pronounce
- Not standard dictionary words
- Avoid: ${avoidTermsStr}
- Avoid: -ify, -ly, -io, -ai, -labs, -hub suffixes
- Avoid: obvious famous brand clones

Generate maximum diversity. Every name should feel distinct — different syllable patterns, different sounds, different creative approaches. Wild creativity encouraged.

Return JSON array.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
    config: {
      temperature: 0.9,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Capitalized candidate name e.g. Navira' },
            lowercaseName: { type: Type.STRING, description: 'Lowercase name' },
            pronunciation: { type: Type.STRING, description: 'Phonetic guide e.g. Nah-vee-rah' },
            syllables: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Syllables array e.g. ["Na", "vi", "ra"]' },
            syllableCount: { type: Type.INTEGER },
            originExplanation: { type: Type.STRING, description: 'Etymological or linguistic explanation' },
            semanticConnection: { type: Type.STRING, description: 'How it relates to product meanings' },
            category: {
              type: Type.STRING,
              enum: ['coined', 'blended', 'abstract', 'phonetic', 'language-inspired']
            },
            confidence: { type: Type.INTEGER, description: 'Confidence 0-100' }
          },
          required: ['name', 'lowercaseName', 'pronunciation', 'syllables', 'syllableCount', 'originExplanation', 'semanticConnection', 'category', 'confidence']
        }
      }
    }
  });

  const text = response.text?.trim() || '[]';
  const parsed: Candidate[] = JSON.parse(text);

  return parsed.filter(c => {
    const lower = c.name.toLowerCase();
    if (lower.length < brief.minimumLetters || lower.length > brief.maximumLetters) return false;
    if (c.syllableCount > brief.maximumSyllables) return false;
    if (brief.avoidTerms.some(term => term.length > 2 && lower.includes(term.toLowerCase()))) return false;
    return pronunciationScore(c.name) >= 75;
  });
}
