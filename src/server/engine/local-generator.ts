import { Candidate, ProjectBrief } from '../../types';
import { pronunciationScore, estimatedSyllables, hasDifficultCluster } from './pronunciation';

const DEFAULT_BEGINNINGS = [
  'a', 'an', 'ava', 'e', 'ela', 'ena', 'i', 'ira',
  'ka', 'la', 'ma', 'na', 'ora', 'ra', 'sa', 'ta', 'va',
  'ori', 'zora', 'syr', 'vyr', 'al'
];

const DEFAULT_MIDDLES = [
  'ba', 'da', 'la', 'ma', 'na', 'ra', 're',
  'ri', 'ro', 'sa', 'ta', 'va', 've', 'mi', 'li'
];

const DEFAULT_ENDINGS = [
  'a', 'an', 'ar', 'en', 'ia', 'in', 'ira',
  'is', 'o', 'on', 'ora', 'ra', 'va', 'us', 'ix'
];

export function generateLocalCandidates(brief: ProjectBrief, count: number = 30): Candidate[] {
  const candidates: Candidate[] = [];
  const seen = new Set<string>();

  const beginnings = [...DEFAULT_BEGINNINGS];
  const middles = [...DEFAULT_MIDDLES];
  const endings = [...DEFAULT_ENDINGS];

  // Adjust syllable pools based on brief
  if (brief.requiredStartingLetter) {
    const letter = brief.requiredStartingLetter.toLowerCase();
    beginnings.unshift(letter + 'a', letter + 'e', letter + 'i', letter + 'o', letter + 'a');
  }

  const avoidTermsLower = brief.avoidTerms.map(t => t.toLowerCase());

  let attempts = 0;
  while (candidates.length < count && attempts < count * 20) {
    attempts++;

    const b = beginnings[Math.floor(Math.random() * beginnings.length)];
    const m = middles[Math.floor(Math.random() * middles.length)];
    const e = endings[Math.floor(Math.random() * endings.length)];

    // 2 or 3 syllable combination
    const nameRaw = Math.random() > 0.5 ? `${b}${m}${e}` : `${b}${e}`;
    const name = nameRaw.charAt(0).toUpperCase() + nameRaw.slice(1);
    const lowercaseName = name.toLowerCase();

    if (seen.has(lowercaseName)) continue;
    seen.add(lowercaseName);

    // Rule checks
    if (lowercaseName.length < brief.minimumLetters || lowercaseName.length > brief.maximumLetters) continue;

    const sylCount = estimatedSyllables(lowercaseName);
    if (sylCount > brief.maximumSyllables) continue;

    if (hasDifficultCluster(lowercaseName)) continue;

    // Check avoid terms
    if (avoidTermsLower.some(term => term.length > 2 && lowercaseName.includes(term))) continue;

    const score = pronunciationScore(name);
    if (score < 75) continue;

    const syllables = [b, m, e].filter(Boolean);

    candidates.push({
      name,
      lowercaseName,
      pronunciation: `${b}-${m ? m + '-' : ''}${e}`,
      syllables: syllables.length ? syllables : [name],
      syllableCount: sylCount,
      originExplanation: `Elegantly constructed invented name blending rhythmic root elements (${b}/${e}).`,
      semanticConnection: `Symbolizes ${brief.meanings.join(', ') || 'readiness and momentum'} with clean phonetic appeal.`,
      category: 'coined',
      confidence: Math.round(80 + Math.random() * 15)
    });
  }

  return candidates;
}
