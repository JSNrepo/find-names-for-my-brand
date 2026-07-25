export function estimatedSyllables(word: string): number {
  const w = word.toLowerCase().trim();
  if (w.length <= 3) return 1;
  const cleaned = w.replace(/(?:[^laeiouy]|ed|es|e)$/i, '').replace(/^y/i, '');
  const matches = cleaned.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

export const DIFFICULT_CLUSTERS = [
  'vyu', 'dhr', 'ksh', 'tsk', 'xq', 'zvr', 'xpt', 'qwt', 'bgr',
  'mzp', 'zkr', 'pft', 'ftk', 'vzh', 'kzt', 'gzh', 'rzt'
];

export function hasDifficultCluster(name: string): boolean {
  const lower = name.toLowerCase();
  return DIFFICULT_CLUSTERS.some(cluster => lower.includes(cluster));
}

export function hasAmbiguousSpelling(name: string): boolean {
  const lower = name.toLowerCase();
  // Double silent or confusing spellings like gh, ph, xh, ough, eigh
  return /(ough|eigh|psh|mn|cz|kn|gn|wr)/.test(lower);
}

export function hasMoreThanTwoConsecutiveConsonants(name: string): boolean {
  return /[^aeiouy]{3,}/i.test(name);
}

export function hasBalancedVowels(name: string): boolean {
  const vowels = (name.match(/[aeiouy]/gi) || []).length;
  const consonants = name.length - vowels;
  if (consonants === 0) return false;
  const ratio = vowels / consonants;
  return ratio >= 0.4 && ratio <= 1.2;
}

export function pronunciationScore(name: string, targetLanguage?: string): number {
  let score = 100;

  if (name.length > 8) score -= 12;
  if (name.length < 3) score -= 15;
  if (estimatedSyllables(name) > 3) score -= 20;
  if (hasDifficultCluster(name)) score -= 25;
  if (hasAmbiguousSpelling(name)) score -= 15;
  if (hasMoreThanTwoConsecutiveConsonants(name)) score -= 20;
  if (hasBalancedVowels(name)) score += 5;

  // Easy open vowel ending bonus (e.g., -a, -o, -ia, -ra)
  if (/[aeiou]$/i.test(name)) score += 5;

  return Math.max(0, Math.min(100, score));
}

export function generatePhoneticVariants(name: string): string[] {
  const variants = new Set<string>();
  const lower = name.toLowerCase();

  // Replace 'i' with 'ee' or 'e'
  if (lower.includes('i')) {
    variants.add(lower.replace(/i/g, 'ee'));
    variants.add(lower.replace(/i/g, 'e'));
  }
  // Replace 'v' with 'w'
  if (lower.includes('v')) {
    variants.add(lower.replace(/v/g, 'w'));
  }
  // Replace 'c' with 'k' or 's'
  if (lower.includes('c')) {
    variants.add(lower.replace(/c/g, 'k'));
  }
  // Replace 'a' with 'ah' or 'aa'
  if (lower.includes('a')) {
    variants.add(lower.replace(/a/g, 'aa'));
  }

  // Capitalize first letter
  return Array.from(variants).map(v => v.charAt(0).toUpperCase() + v.slice(1));
}

export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function isPhoneticallyTooSimilar(a: string, b: string): boolean {
  const dist = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  if (a.length <= 4 || b.length <= 4) {
    return dist <= 1;
  }
  return dist <= 2;
}
