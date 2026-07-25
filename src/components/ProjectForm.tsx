import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ProjectBrief } from '../types';
import { Sparkles, ShieldCheck, Zap, Bot, X, Info, GraduationCap, HeartPulse, ShoppingBag, Coffee, Wallet, Cpu, ChevronDown } from 'lucide-react';

interface ProjectFormProps {
  initialBrief?: Partial<ProjectBrief>;
  onSubmitBrief: (brief: ProjectBrief) => void;
}

const PERSONALITY_OPTIONS = [
  'modern', 'premium', 'friendly', 'bold', 'trustworthy', 
  'technical', 'playful', 'professional', 'minimal', 'futuristic', 'artisan', 'global'
];

const MEANING_OPTIONS = [
  'growth', 'readiness', 'opportunity', 'success', 'confidence', 
  'progress', 'connection', 'discovery', 'purity', 'vitality', 'clarity', 'speed'
];

const DOMAIN_OPTIONS = [
  "Education / EdTech",
  "Technology / SaaS / AI",
  "Healthcare & Wellness",
  "Food & Beverage / Dining",
  "Fashion & Consumer Goods",
  "Finance & Fintech",
  "Real Estate & Hospitality",
  "Travel & Lifestyle",
  "Gaming & Entertainment",
  "Creative Agency / Studio",
  "Agriculture & Sustainability",
  "Professional Services"
];

// Presets for diverse domains
const PRESETS: Record<string, { label: string; icon: any; brief: ProjectBrief }> = {
  placement: {
    label: "EdTech & Career Prep",
    icon: GraduationCap,
    brief: {
      productType: "AI placement prep platform",
      description: "A student career-readiness platform covering aptitude, coding, group discussions, technical interviews, resumes, and job applications.",
      industry: "Education / EdTech",
      audience: "College students and job seekers",
      market: "Global & India",
      languageInfluence: "English & Global",
      personality: ["modern", "friendly", "trustworthy", "professional"],
      meanings: ["readiness", "career launch", "confidence", "progress"],
      minimumLetters: 4,
      maximumLetters: 8,
      maximumSyllables: 3,
      easyPronunciation: true,
      inventedWordsOnly: true,
      allowCompoundWords: true,
      allowDictionaryWords: false,
      avoidDoubleLetters: false,
      avoidSilentLetters: true,
      avoidDifficultConsonantClusters: true,
      avoidNumbers: true,
      avoidHyphens: true,
      avoidTerms: [],
      similarToAvoid: [],
      checkExactSearch: true,
      checkSoftware: true,
      checkCompany: true,
      checkApp: true,
      checkGithub: true,
      checkDomains: true,
      checkSocial: true,
      checkPhonetic: true,
      checkTrademark: true,
      strictnessMode: "extreme",
      targetCount: 10
    }
  },
  health: {
    label: "Health & Wellbeing",
    icon: HeartPulse,
    brief: {
      productType: "Telehealth & mental wellness app",
      description: "A modern digital health platform providing online doctor consultations, meditation guides, sleep tracking, and personalized wellness plans.",
      industry: "Healthcare & Wellness",
      audience: "Health-conscious adults and families",
      market: "Global",
      languageInfluence: "English & Latin roots",
      personality: ["trustworthy", "friendly", "minimal", "premium"],
      meanings: ["vitality", "purity", "clarity", "growth"],
      minimumLetters: 4,
      maximumLetters: 7,
      maximumSyllables: 2,
      easyPronunciation: true,
      inventedWordsOnly: true,
      allowCompoundWords: true,
      allowDictionaryWords: false,
      avoidDoubleLetters: false,
      avoidSilentLetters: true,
      avoidDifficultConsonantClusters: true,
      avoidNumbers: true,
      avoidHyphens: true,
      avoidTerms: ["care", "health", "med", "doc", "clinic"],
      similarToAvoid: [],
      checkExactSearch: true,
      checkSoftware: true,
      checkCompany: true,
      checkApp: true,
      checkGithub: true,
      checkDomains: true,
      checkSocial: true,
      checkPhonetic: true,
      checkTrademark: true,
      strictnessMode: "extreme",
      targetCount: 10
    }
  },
  fashion: {
    label: "Sustainable Fashion",
    icon: ShoppingBag,
    brief: {
      productType: "Eco-friendly apparel & streetwear",
      description: "A sustainable clothing brand crafting organic cotton garments, ethical footwear, and minimalist unisex fashion accessories.",
      industry: "Fashion & Consumer Goods",
      audience: "Gen-Z and millennial fashion enthusiasts",
      market: "Global",
      languageInfluence: "French / Italian / English",
      personality: ["premium", "minimal", "bold", "artisan"],
      meanings: ["purity", "discovery", "confidence"],
      minimumLetters: 4,
      maximumLetters: 8,
      maximumSyllables: 2,
      easyPronunciation: true,
      inventedWordsOnly: true,
      allowCompoundWords: true,
      allowDictionaryWords: false,
      avoidDoubleLetters: false,
      avoidSilentLetters: true,
      avoidDifficultConsonantClusters: true,
      avoidNumbers: true,
      avoidHyphens: true,
      avoidTerms: [],
      similarToAvoid: [],
      checkExactSearch: true,
      checkSoftware: true,
      checkCompany: true,
      checkApp: true,
      checkGithub: true,
      checkDomains: true,
      checkSocial: true,
      checkPhonetic: true,
      checkTrademark: true,
      strictnessMode: "extreme",
      targetCount: 10
    }
  },
  coffee: {
    label: "Artisanal Food & Coffee",
    icon: Coffee,
    brief: {
      productType: "Specialty coffee roastery & cafe",
      description: "An artisanal micro-roastery offering single-origin direct-trade coffee beans, cold brews, and freshly baked organic pastries.",
      industry: "Food & Beverage / Dining",
      audience: "Coffee lovers, urban professionals, foodies",
      market: "Global & Local Cafes",
      languageInfluence: "Global",
      personality: ["friendly", "artisan", "premium", "modern"],
      meanings: ["vitality", "purity", "connection"],
      minimumLetters: 4,
      maximumLetters: 8,
      maximumSyllables: 2,
      easyPronunciation: true,
      inventedWordsOnly: true,
      allowCompoundWords: true,
      allowDictionaryWords: false,
      avoidDoubleLetters: false,
      avoidSilentLetters: true,
      avoidDifficultConsonantClusters: true,
      avoidNumbers: true,
      avoidHyphens: true,
      avoidTerms: [],
      similarToAvoid: [],
      checkExactSearch: true,
      checkSoftware: true,
      checkCompany: true,
      checkApp: true,
      checkGithub: true,
      checkDomains: true,
      checkSocial: true,
      checkPhonetic: true,
      checkTrademark: true,
      strictnessMode: "extreme",
      targetCount: 10
    }
  },
  fintech: {
    label: "Fintech & Payments",
    icon: Wallet,
    brief: {
      productType: "Instant micro-investing wallet",
      description: "A mobile financial application enabling effortless spare-change investing, instant cross-border transfers, and smart budget insights.",
      industry: "Finance & Fintech",
      audience: "Young professionals and small business owners",
      market: "Global",
      languageInfluence: "English & Global",
      personality: ["trustworthy", "modern", "bold", "minimal"],
      meanings: ["growth", "opportunity", "speed", "success"],
      minimumLetters: 4,
      maximumLetters: 7,
      maximumSyllables: 2,
      easyPronunciation: true,
      inventedWordsOnly: true,
      allowCompoundWords: true,
      allowDictionaryWords: false,
      avoidDoubleLetters: false,
      avoidSilentLetters: true,
      avoidDifficultConsonantClusters: true,
      avoidNumbers: true,
      avoidHyphens: true,
      avoidTerms: [],
      similarToAvoid: [],
      checkExactSearch: true,
      checkSoftware: true,
      checkCompany: true,
      checkApp: true,
      checkGithub: true,
      checkDomains: true,
      checkSocial: true,
      checkPhonetic: true,
      checkTrademark: true,
      strictnessMode: "extreme",
      targetCount: 10
    }
  },
  saas: {
    label: "SaaS & AI Workflows",
    icon: Cpu,
    brief: {
      productType: "AI team workflow assistant",
      description: "An automated cloud workspace that summarizes meeting action items, organizes documentation, and orchestrates cross-team task delivery.",
      industry: "Technology / SaaS / AI",
      audience: "Product managers, remote teams, creators",
      market: "Global",
      languageInfluence: "English",
      personality: ["modern", "futuristic", "professional", "minimal"],
      meanings: ["speed", "clarity", "progress", "growth"],
      minimumLetters: 4,
      maximumLetters: 8,
      maximumSyllables: 2,
      easyPronunciation: true,
      inventedWordsOnly: true,
      allowCompoundWords: true,
      allowDictionaryWords: false,
      avoidDoubleLetters: false,
      avoidSilentLetters: true,
      avoidDifficultConsonantClusters: true,
      avoidNumbers: true,
      avoidHyphens: true,
      avoidTerms: [],
      similarToAvoid: [],
      checkExactSearch: true,
      checkSoftware: true,
      checkCompany: true,
      checkApp: true,
      checkGithub: true,
      checkDomains: true,
      checkSocial: true,
      checkPhonetic: true,
      checkTrademark: true,
      strictnessMode: "extreme",
      targetCount: 10
    }
  }
};

export const ProjectForm: React.FC<ProjectFormProps> = ({ initialBrief, onSubmitBrief }) => {
  const [activeTab, setActiveTab] = useState<'brief' | 'rules' | 'checks'>('brief');
  const [customMeaning, setCustomMeaning] = useState('');
  const [avoidTermInput, setAvoidTermInput] = useState('');
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  
  // Assistant Chat drawer state
  const [showAssistant, setShowAssistant] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Hello! I am Brand Assistant. Tell me about your business or project in plain English, and I will help configure your brand criteria!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const defaultValues: ProjectBrief = {
    productType: initialBrief?.productType || '',
    description: initialBrief?.description || '',
    industry: initialBrief?.industry || 'Technology / SaaS / AI',
    audience: initialBrief?.audience || 'Global Audience',
    market: initialBrief?.market || 'Global',
    languageInfluence: initialBrief?.languageInfluence || 'English & Global',
    personality: initialBrief?.personality || ['modern', 'professional', 'trustworthy'],
    meanings: initialBrief?.meanings || ['growth', 'progress', 'confidence'],
    minimumLetters: initialBrief?.minimumLetters || 4,
    maximumLetters: initialBrief?.maximumLetters || 8,
    maximumSyllables: initialBrief?.maximumSyllables || 3,
    easyPronunciation: initialBrief?.easyPronunciation ?? true,
    inventedWordsOnly: initialBrief?.inventedWordsOnly ?? true,
    allowCompoundWords: initialBrief?.allowCompoundWords ?? true,
    allowDictionaryWords: initialBrief?.allowDictionaryWords ?? false,
    avoidDoubleLetters: initialBrief?.avoidDoubleLetters ?? false,
    avoidSilentLetters: initialBrief?.avoidSilentLetters ?? true,
    avoidDifficultConsonantClusters: initialBrief?.avoidDifficultConsonantClusters ?? true,
    avoidNumbers: initialBrief?.avoidNumbers ?? true,
    avoidHyphens: initialBrief?.avoidHyphens ?? true,
    avoidTerms: initialBrief?.avoidTerms || [],
    similarToAvoid: initialBrief?.similarToAvoid || [],
    checkExactSearch: initialBrief?.checkExactSearch ?? true,
    checkSoftware: initialBrief?.checkSoftware ?? true,
    checkCompany: initialBrief?.checkCompany ?? true,
    checkApp: initialBrief?.checkApp ?? true,
    checkGithub: initialBrief?.checkGithub ?? true,
    checkDomains: initialBrief?.checkDomains ?? true,
    checkSocial: initialBrief?.checkSocial ?? true,
    checkPhonetic: initialBrief?.checkPhonetic ?? true,
    checkTrademark: initialBrief?.checkTrademark ?? true,
    strictnessMode: initialBrief?.strictnessMode || 'extreme',
    targetCount: initialBrief?.targetCount || 10
  };

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ProjectBrief>({
    defaultValues
  });

  const selectedPersonality = watch('personality') || [];
  const selectedMeanings = watch('meanings') || [];
  const avoidTerms = watch('avoidTerms') || [];

  const handleApplyPresetKey = (key: string) => {
    const preset = PRESETS[key];
    if (preset) {
      reset(preset.brief);
      setShowPresetsMenu(false);
    }
  };

  const togglePersonality = (item: string) => {
    if (selectedPersonality.includes(item)) {
      setValue('personality', selectedPersonality.filter(p => p !== item));
    } else {
      setValue('personality', [...selectedPersonality, item]);
    }
  };

  const toggleMeaning = (item: string) => {
    if (selectedMeanings.includes(item)) {
      setValue('meanings', selectedMeanings.filter(m => m !== item));
    } else {
      setValue('meanings', [...selectedMeanings, item]);
    }
  };

  const handleAddCustomMeaning = () => {
    if (customMeaning.trim() && !selectedMeanings.includes(customMeaning.trim())) {
      setValue('meanings', [...selectedMeanings, customMeaning.trim()]);
      setCustomMeaning('');
    }
  };

  const handleAddAvoidTerm = () => {
    if (avoidTermInput.trim() && !avoidTerms.includes(avoidTermInput.trim().toLowerCase())) {
      setValue('avoidTerms', [...avoidTerms, avoidTermInput.trim().toLowerCase()]);
      setAvoidTermInput('');
    }
  };

  const handleRemoveAvoidTerm = (term: string) => {
    setValue('avoidTerms', avoidTerms.filter(t => t !== term));
  };

  // Assistant Chat handler
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, { role: 'user', content: userMsg }],
          currentBrief: watch()
        })
      });
      const data = await res.json();
      if (data.text) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const onFormSubmit = (data: ProjectBrief) => {
    onSubmitBrief(data);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-zinc-900/60 p-5 sm:p-6 rounded-2xl border border-zinc-800/80 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Works for Any Business or Domain</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Create Brand Naming Brief</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Describe what you are building in simple English. Find Names for My Brand will generate and verify completely collision-free brand names.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 relative">
          <button
            id="btn-toggle-assistant"
            type="button"
            onClick={() => setShowAssistant(!showAssistant)}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-all flex items-center gap-2 min-h-[44px]"
          >
            <Bot className="w-3.5 h-3.5 text-sky-400" />
            <span>AI Assistant</span>
          </button>
        </div>
      </div>

      {/* Form Navigation Tabs */}
      <div className="flex border-b border-zinc-800 mb-8 text-xs font-semibold overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('brief')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition-colors shrink-0 min-h-[44px] ${activeTab === 'brief' ? 'border-zinc-100 text-white font-bold' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
        >
          1. Business & Personality
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition-colors shrink-0 min-h-[44px] ${activeTab === 'rules' ? 'border-zinc-100 text-white font-bold' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
        >
          2. Name Length & Spelling Rules
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('checks')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition-colors shrink-0 min-h-[44px] ${activeTab === 'checks' ? 'border-zinc-100 text-white font-bold' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
        >
          3. Search Verification Sources
        </button>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">

        {/* TAB 1: BASIC BRIEF & PERSONALITY */}
        {activeTab === 'brief' && (
          <div className="space-y-6">
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  What are you naming? <span className="text-red-400">*</span>
                </label>
                <span className="text-[10px] text-zinc-500 font-medium">Any product, service, brand, or store</span>
              </div>
              <input
                {...register('productType', { required: 'Product or business type is required' })}
                placeholder="e.g. Specialty Coffee Shop, Telehealth App, Eco Fashion Brand, Career Platform..."
                className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-zinc-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
              />
              {errors.productType && <p className="text-xs text-red-400 mt-1">{errors.productType.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Detailed Business Description <span className="text-red-400">*</span>
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                placeholder="Describe what your business does, key products/services, special features, or customer benefits in plain English..."
                className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-zinc-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
              />
              {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Industry / Category
                </label>
                <select
                  {...register('industry')}
                  className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-zinc-500 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
                >
                  {DOMAIN_OPTIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Target Customers / Audience
                </label>
                <input
                  {...register('audience')}
                  placeholder="e.g. Health-conscious families, Gen-Z fashion lovers, Global professionals..."
                  className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-zinc-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Brand Personality Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Brand Tone & Vibe (Select Multiple)
              </label>
              <div className="flex flex-wrap gap-2">
                {PERSONALITY_OPTIONS.map(opt => {
                  const isSelected = selectedPersonality.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => togglePersonality(opt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize border transition-all ${isSelected ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-bold' : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:border-zinc-700'}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desired Meanings */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Desired Feelings & Connotations
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {MEANING_OPTIONS.map(opt => {
                  const isSelected = selectedMeanings.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleMeaning(opt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize border transition-all ${isSelected ? 'bg-emerald-400 text-zinc-950 border-emerald-400 font-bold' : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:border-zinc-700'}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Custom meaning input */}
              <div className="flex gap-2">
                <input
                  value={customMeaning}
                  onChange={e => setCustomMeaning(e.target.value)}
                  placeholder="Add custom keyword e.g. momentum, organic, speed..."
                  className="bg-zinc-900/80 border border-zinc-800 text-xs text-white px-3 py-2 rounded-xl focus:outline-none w-64"
                />
                <button
                  type="button"
                  onClick={handleAddCustomMeaning}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white rounded-xl"
                >
                  Add Feeling
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('rules')}
                className="px-6 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-sm min-h-[44px]"
              >
                Next: Name Length & Spelling →
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: NAMING RULES & RESTRICTIONS */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-start gap-3">
              <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-300 leading-relaxed">
                <strong>Plain English Guide:</strong> Short, 4–8 letter invented brand names (like <em>Spotify, Rolex, or Kodak</em>) are easiest for customers to remember, type, and trademark globally.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Min Character Length
                </label>
                <input
                  type="number"
                  {...register('minimumLetters', { valueAsNumber: true })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Max Character Length
                </label>
                <input
                  type="number"
                  {...register('maximumLetters', { valueAsNumber: true })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Max Syllables (Beats)
                </label>
                <input
                  type="number"
                  {...register('maximumSyllables', { valueAsNumber: true })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            {/* Toggle Rules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-zinc-300 bg-zinc-950 p-4 rounded-2xl border border-zinc-900">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('inventedWordsOnly')} className="w-4 h-4 accent-white rounded" />
                <span>Invented Words Only (New unique words, easier to trademark)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('easyPronunciation')} className="w-4 h-4 accent-white rounded" />
                <span>Easy Pronunciation Guarantee (Clear global sound)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('avoidDifficultConsonantClusters')} className="w-4 h-4 accent-white rounded" />
                <span>Avoid Awkward Consonants (e.g. xq, tsk, dhr)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('avoidSilentLetters')} className="w-4 h-4 accent-white rounded" />
                <span>Avoid Silent Letters & Confusing Spellings</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('avoidNumbers')} className="w-4 h-4 accent-white rounded" />
                <span>Avoid Digits / Numbers</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('avoidHyphens')} className="w-4 h-4 accent-white rounded" />
                <span>Avoid Hyphens</span>
              </label>
            </div>

            {/* Avoid Crowded Terms */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Words to Exclude / Avoid
              </label>
              <p className="text-xs text-zinc-400 mb-3">Add overused industry buzzwords you don't want in your brand name.</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {avoidTerms.map(term => (
                  <span key={term} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-amber-300">
                    <span>{term}</span>
                    <button type="button" onClick={() => handleRemoveAvoidTerm(term)} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={avoidTermInput}
                  onChange={e => setAvoidTermInput(e.target.value)}
                  placeholder="e.g. app, shop, cafe, tech, hub..."
                  className="bg-zinc-900 border border-zinc-800 text-xs text-white px-3 py-2 rounded-xl focus:outline-none w-64"
                />
                <button
                  type="button"
                  onClick={handleAddAvoidTerm}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white rounded-xl"
                >
                  Add Excluded Word
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('brief')}
                className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold min-h-[44px]"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('checks')}
                className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all min-h-[44px]"
              >
                Next: Search Checks →
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: COLLISION CHECK OPTIONS & SUBMIT */}
        {activeTab === 'checks' && (
          <div className="space-y-6">
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Search Safety Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${watch('strictnessMode') === 'extreme' ? 'bg-zinc-900 border-white text-white' : 'bg-zinc-950 border-zinc-900 text-zinc-400'}`}>
                  <input type="radio" value="extreme" {...register('strictnessMode')} className="mt-1 accent-white" />
                  <div>
                    <span className="font-bold text-sm block">100% Zero Collision Mode (Recommended)</span>
                    <span className="text-xs text-zinc-400 mt-1 block">Rejects any name that returns even a single exact-quoted result online, guaranteeing a completely unclaimed brand name.</span>
                  </div>
                </label>

                <label className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${watch('strictnessMode') === 'commercial' ? 'bg-zinc-900 border-white text-white' : 'bg-zinc-950 border-zinc-900 text-zinc-400'}`}>
                  <input type="radio" value="commercial" {...register('strictnessMode')} className="mt-1 accent-white" />
                  <div>
                    <span className="font-bold text-sm block">Commercial Brand Mode</span>
                    <span className="text-xs text-zinc-400 mt-1 block">Rejects a name only if it is already used as an active commercial entity or business.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Target Count Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                How Many Unclaimed Names Do You Want?
              </label>
              <div className="flex flex-wrap gap-3">
                {[5, 10, 20].map(cnt => {
                  const currentTarget = Number(watch('targetCount'));
                  const isSelected = currentTarget === cnt;
                  return (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setValue('targetCount', cnt)}
                      className={`px-6 py-3 rounded-xl border text-sm font-bold transition-all min-h-[44px] ${
                        isSelected 
                          ? 'bg-white text-black border-white shadow-md' 
                          : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:border-zinc-700'
                      }`}
                    >
                      <span>{cnt} Verified Names</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Availability Checkboxes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">
                Live Verification Sources Enabled
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs bg-zinc-950 p-4 rounded-2xl border border-zinc-900 text-zinc-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('checkExactSearch')} className="w-4 h-4 accent-emerald-400 rounded" />
                  <span>Google Search Index Guard</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('checkSoftware')} className="w-4 h-4 accent-emerald-400 rounded" />
                  <span>Software & Digital Products</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('checkCompany')} className="w-4 h-4 accent-emerald-400 rounded" />
                  <span>Company & Startup Directory</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('checkApp')} className="w-4 h-4 accent-emerald-400 rounded" />
                  <span>Mobile App Stores</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('checkGithub')} className="w-4 h-4 accent-emerald-400 rounded" />
                  <span>Code & Open Source Index</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('checkDomains')} className="w-4 h-4 accent-emerald-400 rounded" />
                  <span>Web Domain (.com) Availability</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('checkPhonetic')} className="w-4 h-4 accent-emerald-400 rounded" />
                  <span>Sound-Alike & Mishearing Guard</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('checkTrademark')} className="w-4 h-4 accent-emerald-400 rounded" />
                  <span>Official IP Search Quick Links</span>
                </label>
              </div>
            </div>

            <div className="pt-6 flex justify-between items-center border-t border-zinc-900">
              <button
                type="button"
                onClick={() => setActiveTab('rules')}
                className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold min-h-[44px]"
              >
                ← Back
              </button>
              
              <button
                id="btn-launch-pipeline"
                type="submit"
                className="px-8 py-4 rounded-xl bg-white text-black font-extrabold text-sm uppercase tracking-wider hover:bg-zinc-200 transition-all shadow-xl flex items-center gap-2 min-h-[48px]"
              >
                <Sparkles className="w-5 h-5 text-black" />
                <span>Find Collision-Free Names</span>
              </button>
            </div>
          </div>
        )}
      </form>

      {/* AI Assistant Drawer */}
      {showAssistant && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-zinc-950 border-l border-zinc-800 shadow-2xl z-50 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Bot className="w-5 h-5 text-sky-400" />
                <span>AI Brand Assistant</span>
              </div>
              <button onClick={() => setShowAssistant(false)} className="text-zinc-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto text-xs pr-1">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`p-3 rounded-xl ${msg.role === 'user' ? 'bg-zinc-800 text-white ml-6' : 'bg-zinc-900 text-zinc-300 mr-6 border border-zinc-800'}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
              {chatLoading && <p className="text-zinc-500 italic">Assistant is analyzing...</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-900 flex gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
              placeholder="Ask how to define your business vibe or rules..."
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
            <button
              onClick={handleSendChatMessage}
              disabled={chatLoading}
              className="px-3.5 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
