import { z } from 'zod';

export const CandidateCategoryEnum = z.enum([
  'coined',
  'blended',
  'abstract',
  'phonetic',
  'language-inspired'
]);

export type CandidateCategory = z.infer<typeof CandidateCategoryEnum>;

export const CandidateSchema = z.object({
  name: z.string(),
  lowercaseName: z.string(),
  pronunciation: z.string(),
  syllables: z.array(z.string()),
  syllableCount: z.number(),
  originExplanation: z.string(),
  semanticConnection: z.string(),
  category: CandidateCategoryEnum,
  confidence: z.number().min(0).max(100)
});

export type Candidate = z.infer<typeof CandidateSchema>;

export type CheckStatus =
  | 'passed'
  | 'collision'
  | 'warning'
  | 'unavailable'
  | 'pending';

export type CheckType =
  | 'exact-search'
  | 'software-search'
  | 'company-search'
  | 'app-search'
  | 'github'
  | 'domain'
  | 'phonetic'
  | 'social'
  | 'trademark';

export interface EvidenceItem {
  title: string;
  url: string;
  snippet?: string;
}

export interface ValidationCheck {
  type: CheckType;
  status: CheckStatus;
  query?: string;
  totalResults?: number;
  evidence: EvidenceItem[];
  checkedAt: string;
  provider: string;
}

export interface DomainCheckResult {
  domain: string;
  extension: string;
  status: 'available' | 'registered' | 'unknown' | 'error';
}

export interface ValidatedName {
  id: string;
  candidate: Candidate;
  checks: ValidationCheck[];
  domains: DomainCheckResult[];
  pronunciationScore: number;
  memorabilityScore: number;
  relevanceScore: number;
  uniquenessConfidence: number;
  finalScore: number;
  status: 'passed' | 'rejected' | 'uncertain';
  validatedAt: string;
}

export const ProjectBriefSchema = z.object({
  productType: z.string().min(1, 'Product type is required'),
  description: z.string().min(5, 'Detailed product description is required'),
  industry: z.string().default('Technology'),
  audience: z.string().default('Global users'),
  market: z.string().default('Global'),
  languageInfluence: z.string().default('English / Tamil / Global'),
  personality: z.array(z.string()).default(['modern', 'professional', 'trustworthy']),
  meanings: z.array(z.string()).default(['growth', 'progress', 'opportunity']),
  customMeaning: z.string().optional(),
  
  // Naming rules
  minimumLetters: z.coerce.number().min(2).max(15).default(4),
  maximumLetters: z.coerce.number().min(3).max(20).default(8),
  maximumSyllables: z.coerce.number().min(1).max(6).default(3),
  easyPronunciation: z.boolean().default(true),
  inventedWordsOnly: z.boolean().default(true),
  allowCompoundWords: z.boolean().default(true),
  allowDictionaryWords: z.boolean().default(false),
  avoidDoubleLetters: z.boolean().default(false),
  avoidSilentLetters: z.boolean().default(true),
  avoidDifficultConsonantClusters: z.boolean().default(true),
  avoidNumbers: z.boolean().default(true),
  avoidHyphens: z.boolean().default(true),
  requiredStartingLetter: z.string().optional(),
  requiredEndingSound: z.string().optional(),
  avoidTerms: z.array(z.string()).default([]),
  similarToAvoid: z.array(z.string()).default([]),

  // Availability checks
  checkExactSearch: z.boolean().default(true),
  checkSoftware: z.boolean().default(true),
  checkCompany: z.boolean().default(true),
  checkApp: z.boolean().default(true),
  checkGithub: z.boolean().default(true),
  checkDomains: z.boolean().default(true),
  checkSocial: z.boolean().default(true),
  checkPhonetic: z.boolean().default(true),
  checkTrademark: z.boolean().default(true),

  strictnessMode: z.enum(['extreme', 'commercial']).default('extreme'),
  targetCount: z.coerce.number().default(10)
});

export type ProjectBrief = z.infer<typeof ProjectBriefSchema>;

export interface NamingProject {
  id: string;
  userId: string;
  title: string;
  brief: ProjectBrief;
  status: 'draft' | 'running' | 'completed' | 'cancelled';
  savedCandidates: ValidatedName[];
  rejectedCandidates: string[];
  favouriteCandidate?: string;
  notes?: string;
  searchUsageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RunLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface NameRunStats {
  generatedCount: number;
  pronunciationFilteredCount: number;
  localFilteredCount: number;
  searchedCount: number;
  collisionsFoundCount: number;
  passedCount: number;
  currentStage: string;
}

export interface NameRun {
  id: string;
  projectId: string;
  userId: string;
  status: 'running' | 'completed' | 'cancelled' | 'failed';
  targetCount: number;
  stats: NameRunStats;
  validatedNames: ValidatedName[];
  logs: RunLog[];
  createdAt: string;
  completedAt?: string;
}

export interface SearchCheckResult {
  hasCollision: boolean;
  totalResults: number;
  evidence: EvidenceItem[];
  provider: string;
  query: string;
  strictnessMode: 'extreme' | 'commercial';
}

export interface ExactSearchResult {
  hasCollision: boolean;
  exactMatchCount: number;
  totalResults: number;
  evidence: EvidenceItem[];
  provider: string;
  query: string;
}

export interface AdminConfig {
  geminiModel: string;
  batchSize: number;
  maxSearchCalls: number;
  searchProvider: 'google' | 'serper' | 'brave' | 'gemini_grounding' | 'auto';
  cacheDurationDays: number;
  minPronunciationScore: number;
  strictnessMode: 'extreme' | 'commercial';
  dailyUserLimit: number;
  blockedWords: string[];
  blockedBrands: string[];
  blockedSuffixes: string[];
}
