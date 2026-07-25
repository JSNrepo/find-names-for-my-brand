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

  const creativeTechniques = `
- NEO-CLASSICAL: Greek/Latin roots fused unconventionally (Aetheron, Velaris, Crystalis)
- METAPHOR + ABSTRACTION: Evocative concepts (Ember, Pivot, Apex, Cipher, Vellum)
- PORTMANTEAU: Two meaningful words fused (Codex + Apex = Codexpex, Bright + Harbor = Brighter)
- PHONETIC INVENTIONS: Pure sound sculptures with no dictionary meaning (Zylara, Noven, Quixos)
- BIOMIMICRY: Nature-inspired (Sparrow, Canopy, Drift, Pollen, Mycelium)
- ARCHITECTURAL: Structural terms reimagined (Keystone, Facet, Spire, Strata, Axis)
- CELESTIAL: Stars/space metaphors (Nova, Solara, Orion, Lyra, Eclipse)
- MATERIAL: Fabric/mineral names (Silica, Velvox, Brassia, Chroma, Lumen)
- COMPOUND ABSTRACT: Two short evocative words (BrightField, NextPulse, TrueNorth, ClearState)
- CULTURAL FUSION: Blend roots from 2+ languages (Mandarin + Latin = Luminao)
`;

  const prompt = likedName
    ? `You are a world-class naming strategist. Generate ${count} fresh, creative brand names for this project.

PROJECT: ${brief.productType}
DESCRIPTION: ${brief.description}
AUDIENCE: ${brief.audience}
INDUSTRY: ${brief.industry}
VIBE: ${personalityStr}
THEMES: ${meaningsStr}

The user liked "${likedName}". Generate names in a similar creative spirit but using completely different root words and structures. No lazy letter swaps.

CREATIVE TOOLKIT (use these techniques, mix them up):${creativeTechniques}
RULES:
- Length: ${brief.minimumLetters}-${brief.maximumLetters} chars, max ${brief.maximumSyllables} syllables
- Easy global pronunciation
- Avoid dictionary words
- No: ${avoidTermsStr}
- No: -ify, -ly, -io, -ai, -labs, -hub suffixes
- No: obvious famous brand clones

Return JSON array of candidate objects.`
    : `You are an award-winning naming strategist. Brainstorm ${count} bold, original brand names for:

PROJECT: ${brief.productType}
DESCRIPTION: ${brief.description}
AUDIENCE: ${brief.audience}
INDUSTRY: ${brief.industry}
VIBE: ${personalityStr}
THEMES: ${meaningsStr}

CREATIVE TOOLKIT (mix these techniques across the batch):${creativeTechniques}
RULES:
- Length: ${brief.minimumLetters}-${brief.maximumLetters} chars, max ${brief.maximumSyllables} syllables
- Globally easy to pronounce
- Not standard dictionary words
- Avoid: ${avoidTermsStr}
- Avoid: -ify, -ly, -io, -ai, -labs, -hub suffixes
- Avoid: obvious famous brand clones

Generate maximum diversity in structure, sound, and technique across all ${count} names. Don't repeat patterns. Wild creativity encouraged as long as it meets the rules.

Return JSON array of candidate objects.`;

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
