import { GoogleGenAI, Type } from '@google/genai';
import { Candidate, ProjectBrief } from '../../types';
import { pronunciationScore, estimatedSyllables } from './pronunciation';

export class GeminiCandidateGenerator {
  private ai: GoogleGenAI | null = null;

  constructor(customApiKey?: string) {
    const key = customApiKey || process.env.GEMINI_API_KEY;
    if (key) {
      this.ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
    }
  }

  async generateCandidates(brief: ProjectBrief, batchSize: number = 60): Promise<Candidate[]> {
    if (!this.ai) {
      console.warn('GEMINI_API_KEY is missing. Candidate generator returning empty.');
      return [];
    }

    const avoidTermsStr = brief.avoidTerms.join(', ') || 'none';
    const personalityStr = brief.personality.join(', ') || 'modern, professional';
    const meaningsStr = brief.meanings.join(', ') || 'readiness, progress';

    const prompt = `You are a world-class naming strategist and creative branding expert.
Generate a highly diverse, creative batch of ${batchSize} original candidate brand names specifically tailored for this project:

PRODUCT TYPE: ${brief.productType}
DESCRIPTION: ${brief.description}
TARGET AUDIENCE: ${brief.audience}
INDUSTRY: ${brief.industry}
BRAND PERSONALITY: ${personalityStr}
DESIRED MEANINGS & THEMES: ${meaningsStr}

CREATIVE BRAINSTORMING INSTRUCTIONS:
1. Brainstorm names deeply relevant to ${brief.productType} and ${brief.industry}. Use diverse linguistic structures (blended roots, domain-inspired coinages, evocative metaphors, dynamic action words, and clean phonetic inventions).
2. DO NOT use identical structural templates or repetitive suffix patterns across names. Mix 1-syllable, 2-syllable, and 3-syllable names with varying vowel and consonant flows.
3. Make names feel tailored specifically to this domain (e.g. if the project relates to jobs, recruitment, or career, explore clever job/work/career/talent/match roots or metaphors unless explicitly forbidden in avoidTerms).
4. STRICT LENGTH RULES: Minimum length: ${brief.minimumLetters} letters, Maximum length: ${brief.maximumLetters} letters. Maximum syllables: ${brief.maximumSyllables}.
5. PRONUNCIATION: Must be smooth, natural, and easily pronounceable globally.
6. AVOID: Do NOT output standard English dictionary words.
7. FORBIDDEN TERMS TO AVOID: ${avoidTermsStr}. Do not include these specific terms inside the generated names.
8. AVOID famous company imitations (e.g. Google, Apple, Amazon, Stripe, Meta).

Return a JSON array of candidate objects matching the requested schema.`;

    try {
      const response = await this.ai.models.generateContent({
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

      // Post-process & filter candidates
      return parsed.filter(c => {
        const lower = c.name.toLowerCase();
        if (lower.length < brief.minimumLetters || lower.length > brief.maximumLetters) return false;
        if (c.syllableCount > brief.maximumSyllables) return false;
        if (brief.avoidTerms.some(term => term.length > 2 && lower.includes(term.toLowerCase()))) return false;
        
        // Pronunciation threshold check
        const pScore = pronunciationScore(c.name);
        return pScore >= 75;
      });
    } catch (e) {
      console.error('Gemini candidate generation error:', e);
      return [];
    }
  }

  async generateSimilarCandidates(originalName: string, brief: ProjectBrief, count: number = 20): Promise<Candidate[]> {
    if (!this.ai) return [];

    const prompt = `Perform an in-depth linguistic, phonetic, and semantic analysis of the liked candidate name "${originalName}":

1. RHYTHM & SYLLABLES: Analyze the syllable count, stress points, and rhythmic cadence (e.g., trochaic, dactylic flow).
2. VOWEL PATTERN & CONSONANT TEXTURE: Map out the vowel progression (e.g., open front/back vowel sequence) and soft vs hard consonant distribution.
3. VISUAL LENGTH & SYMMETRY: Character count, visual balance, and casing symmetry.
4. EMOTIONAL CHARACTER & BRAND TONE: The underlying mood, energy, and psychological resonance (e.g., visionary, agile, grounded, modern).
5. SEMANTIC CONNECTION: The etymological vibe and relationship to the product domain.

PRODUCT BRIEF CONTEXT:
Product Type: ${brief.productType}
Description: ${brief.description}
Industry: ${brief.industry || 'Technology'}
Audience: ${brief.audience || 'Global'}

TASK:
Generate ${count} NEW, genuinely invented candidate names that capture the SAME structural elegance, rhythmic beauty, and emotional character as "${originalName}".

STRICT NEGATIVE CONSTRAINTS:
- DO NOT perform lazy edits (e.g. changing just 1 or 2 letters like "${originalName}" -> "${originalName.slice(0, -1)}o" or "${originalName}x").
- DO NOT add overused generic suffixes (-ify, -ly, -io, -ai, -labs, -hub, -tech, -flow, -nest).
- DO NOT add overused generic prefixes (neo-, nova-, nex-, hyper-, super-).
- MUST be completely distinct, invented brand names that match the 4-8 letter range and are easy to pronounce globally.

Return a JSON array matching the Candidate schema.`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                lowercaseName: { type: Type.STRING },
                pronunciation: { type: Type.STRING },
                syllables: { type: Type.ARRAY, items: { type: Type.STRING } },
                syllableCount: { type: Type.INTEGER },
                originExplanation: { type: Type.STRING },
                semanticConnection: { type: Type.STRING },
                category: {
                  type: Type.STRING,
                  enum: ['coined', 'blended', 'abstract', 'phonetic', 'language-inspired']
                },
                confidence: { type: Type.INTEGER }
              },
              required: ['name', 'lowercaseName', 'pronunciation', 'syllables', 'syllableCount', 'originExplanation', 'semanticConnection', 'category', 'confidence']
            }
          }
        }
      });

      const parsed: Candidate[] = JSON.parse(response.text?.trim() || '[]');
      return parsed;
    } catch (e) {
      console.error('Generate similar error:', e);
      return [];
    }
  }
}
