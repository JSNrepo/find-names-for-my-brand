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
    ? `You are a world-class naming strategist and creative branding expert.
Analyze the liked candidate name "${likedName}" and generate ${count} NEW structurally and phonetically similar brand names.

PRODUCT TYPE: ${brief.productType}
DESCRIPTION: ${brief.description}
INDUSTRY: ${brief.industry}
TARGET AUDIENCE: ${brief.audience}
BRAND PERSONALITY: ${personalityStr}

STRICT CONSTRAINTS:
1. DO NOT do lazy edits (changing 1-2 letters like "${likedName}" -> "${likedName.slice(0, -1)}o").
2. DO NOT add overused suffixes (-ify, -ly, -io, -ai, -labs, -hub).
3. Minimum length: ${brief.minimumLetters}, Maximum length: ${brief.maximumLetters}.
4. Must be easy to pronounce globally.
5. FORBIDDEN TERMS: ${avoidTermsStr}

Return a JSON array of candidate objects matching the requested schema.`
    : `You are a world-class naming strategist and creative branding expert.
Generate a highly diverse, creative batch of ${count} original candidate brand names specifically tailored for this project:

PRODUCT TYPE: ${brief.productType}
DESCRIPTION: ${brief.description}
TARGET AUDIENCE: ${brief.audience}
INDUSTRY: ${brief.industry}
BRAND PERSONALITY: ${personalityStr}
DESIRED MEANINGS & THEMES: ${meaningsStr}

CREATIVE BRAINSTORMING INSTRUCTIONS:
1. Brainstorm names deeply relevant to ${brief.productType} and ${brief.industry}. Use diverse linguistic structures (blended roots, domain-inspired coinages, evocative metaphors, dynamic action words, and clean phonetic inventions).
2. DO NOT use identical structural templates or repetitive suffix patterns across names. Mix 1-syllable, 2-syllable, and 3-syllable names with varying vowel and consonant flows.
3. STRICT LENGTH RULES: Minimum length: ${brief.minimumLetters} letters, Maximum length: ${brief.maximumLetters} letters. Maximum syllables: ${brief.maximumSyllables}.
4. PRONUNCIATION: Must be smooth, natural, and easily pronounceable globally.
5. AVOID: Do NOT output standard English dictionary words.
6. FORBIDDEN TERMS TO AVOID: ${avoidTermsStr}. Do not include these specific terms inside the generated names.
7. AVOID famous company imitations (e.g. Google, Apple, Amazon, Stripe, Meta).

Return a JSON array of candidate objects matching the requested schema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
    config: {
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
