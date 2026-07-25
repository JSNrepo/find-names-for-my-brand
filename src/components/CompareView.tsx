import React from 'react';
import { ValidatedName } from '../types';
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, X, ArrowUpDown, 
  Sparkles, Award, Volume2, Bookmark, Eye, Layers, Globe, ShieldAlert, Check
} from 'lucide-react';

interface CompareViewProps {
  comparedCandidates: ValidatedName[];
  onRemoveFromCompare: (id: string) => void;
  onClearCompare: () => void;
  onSelectFavorite: (vn: ValidatedName) => void;
  onGenerateSimilar: (vn: ValidatedName) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  comparedCandidates,
  onRemoveFromCompare,
  onClearCompare,
  onSelectFavorite,
  onGenerateSimilar
}) => {

  if (comparedCandidates.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
          <ArrowUpDown className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white">Compare Matrix Empty</h2>
        <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
          Select up to 4 validated candidate names from your results list to compare their objective collision status, pronunciation, visual balance, domain availability, and strengths/weaknesses side-by-side.
        </p>
      </div>
    );
  }

  // Find candidate with top score
  const topCandidateId = [...comparedCandidates].sort((a, b) => b.finalScore - a.finalScore)[0]?.id;

  const getObjectiveCollisionStatus = (vn: ValidatedName) => {
    const checksList = vn?.checks || [];
    const name = vn?.candidate?.name || '';
    const collisionCheck = checksList.find(c => 
      c?.status === 'collision' || 
      (c?.type === 'exact-search' && c?.totalResults && c.totalResults > 0)
    );

    if (collisionCheck) {
      return {
        hasCollision: true,
        query: collisionCheck.query || `"${name}"`,
        evidence: collisionCheck.evidence || [],
        overrideReason: 'Search engine index returned exact matching brand/entity evidence.'
      };
    }
    return {
      hasCollision: false,
      query: `"${name}"`,
      evidence: [],
      overrideReason: null
    };
  };

  const getStrengthsAndWeaknesses = (vn: ValidatedName) => {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const domainsList = vn?.domains || [];
    const checksList = vn?.checks || [];
    const name = vn?.candidate?.name || '';

    const comDomain = domainsList.find(d => d?.extension === 'com');
    if (comDomain && comDomain.status === 'available') {
      strengths.push('.com domain is currently available');
    } else {
      weaknesses.push('.com domain is registered');
    }

    if ((vn?.pronunciationScore ?? 0) >= 88) {
      strengths.push(`High global pronunciation clarity (${vn.pronunciationScore}/100)`);
    }

    if ((vn?.memorabilityScore ?? 0) >= 80) {
      strengths.push(`Compact & recall-friendly (${name.length} letters)`);
    } else if (name.length >= 9) {
      weaknesses.push(`Slightly longer letter count (${name.length} chars)`);
    }

    const collisionObj = getObjectiveCollisionStatus(vn);
    if (!collisionObj.hasCollision) {
      strengths.push('0 exact quoted search collisions');
    } else {
      weaknesses.push('Objective search evidence collision detected');
    }

    const softwareCheck = checksList.find(c => c?.type === 'software-search');
    if (softwareCheck && softwareCheck.status === 'passed') {
      strengths.push('No software / app entity collisions');
    }

    const phoneticCheck = checksList.find(c => c?.type === 'phonetic');
    if (phoneticCheck && phoneticCheck.status === 'warning') {
      weaknesses.push('Minor phonetic variant similarity online');
    }

    return { strengths, weaknesses };
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-8">
      
      {/* Matrix Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Objective Evidence Priority Matrix</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-emerald-400" />
            <span>Side-by-Side Name Comparison ({comparedCandidates.length}/4)</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Compare pronunciation, search evidence, phonetic risk, domain availability, and visual balance. Search result evidence overrides AI confidence scores.
          </p>
        </div>

        <button
          id="btn-clear-compare"
          onClick={onClearCompare}
          className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 font-bold border border-zinc-800 transition-colors shrink-0"
        >
          Clear Matrix
        </button>
      </div>

      {/* Side-by-Side Columns */}
      <div className="overflow-x-auto pb-8 touch-pan-x">
        <div className={`grid gap-6 ${
          comparedCandidates.length === 1 ? 'grid-cols-1 max-w-lg mx-auto' :
          comparedCandidates.length === 2 ? 'grid-cols-1 md:grid-cols-2 min-w-[640px]' :
          comparedCandidates.length === 3 ? 'grid-cols-1 md:grid-cols-3 min-w-[850px]' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 min-w-[1000px]'
        }`}>
          {comparedCandidates.map((vn) => {
            const isTopWinner = vn.id === topCandidateId && comparedCandidates.length > 1;
            const collisionObj = getObjectiveCollisionStatus(vn);
            const { strengths, weaknesses } = getStrengthsAndWeaknesses(vn);

            // Compute visual stats
            const vowelsCount = (vn.candidate.name.match(/[aeiouy]/gi) || []).length;
            const consonantsCount = vn.candidate.name.length - vowelsCount;

            // Score override if objective search collision is detected
            const effectiveScore = collisionObj.hasCollision ? 0 : vn.finalScore;
            const effectiveConfidence = collisionObj.hasCollision ? 0 : vn.uniquenessConfidence;

            return (
              <div 
                key={vn.id}
                className={`p-6 rounded-3xl space-y-6 flex flex-col justify-between transition-all border ${
                  isTopWinner 
                    ? 'bg-zinc-900/90 border-emerald-500/50 shadow-2xl shadow-emerald-500/10 ring-1 ring-emerald-500/30' 
                    : 'bg-zinc-900/60 border-zinc-800/80'
                }`}
              >
                {/* Column Top Card */}
                <div className="space-y-4">
                  {/* Top Winner Badge */}
                  {isTopWinner && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 w-full justify-center">
                      <Award className="w-3.5 h-3.5" />
                      <span>Top Recommended Choice</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-3xl font-extrabold text-white tracking-tight">{vn.candidate.name}</h2>
                      <p className="text-xs font-semibold text-zinc-400 mt-0.5">
                        {vn.candidate.pronunciation} • <span className="capitalize text-zinc-300">{vn.candidate.category}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => onRemoveFromCompare(vn.id)}
                      className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors shrink-0"
                      title="Remove from comparison"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Recommendation Score Card */}
                  <div className={`p-4 rounded-2xl border text-center space-y-1 ${
                    collisionObj.hasCollision 
                      ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                      : 'bg-zinc-950 border-zinc-800'
                  }`}>
                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
                      Overall Score {collisionObj.hasCollision && '(Collision Override)'}
                    </span>
                    <span className={`text-4xl font-black ${collisionObj.hasCollision ? 'text-red-400' : 'text-white'}`}>
                      {effectiveScore} <span className="text-xs text-zinc-500 font-normal">/ 100</span>
                    </span>
                    {collisionObj.hasCollision ? (
                      <p className="text-[10px] text-red-300 font-semibold mt-1">
                        Overridden: Search index evidence detected active usage.
                      </p>
                    ) : (
                      <p className="text-[10px] text-emerald-400 font-semibold mt-1">
                        Confidence: {effectiveConfidence}% (Search Guarded)
                      </p>
                    )}
                  </div>
                </div>

                {/* Section 1: Objective Collision Status */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                  <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Exact Search Status</span>
                  </span>

                  {collisionObj.hasCollision ? (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 space-y-1">
                      <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>COLLISION DETECTED</span>
                      </div>
                      <p className="text-[11px] text-red-300 leading-snug">{collisionObj.overrideReason}</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>No detected exact match</span>
                      </span>
                      <p className="text-[11px] text-zinc-400">
                        Quoted Query: <code className="text-emerald-300 bg-zinc-900 px-1.5 py-0.5 rounded">{collisionObj.query}</code>
                      </p>
                    </div>
                  )}
                </div>

                {/* Section 2: Pronunciation & Phonetics */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                  <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Pronunciation & Rhythm</span>
                  </span>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Pronunciation Score:</span>
                    <span className="text-white font-bold text-sm">{vn.pronunciationScore} / 100</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Syllables:</span>
                    <span className="text-zinc-200 font-mono font-medium">{vn.candidate.syllables.join(' • ')} ({vn.candidate.syllableCount})</span>
                  </div>

                  <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                    Phonetic guide: <strong className="text-zinc-200">{vn.candidate.pronunciation}</strong>
                  </div>
                </div>

                {/* Section 3: Visual Balance */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                  <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-purple-400" />
                    <span>Visual Balance & Typography</span>
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                      <span className="text-zinc-400 block text-[9px] uppercase font-bold">Length</span>
                      <span className="text-white font-bold">{vn.candidate.name.length} letters</span>
                    </div>
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                      <span className="text-zinc-400 block text-[9px] uppercase font-bold">Vowel / Consonant</span>
                      <span className="text-white font-bold">{vowelsCount} V / {consonantsCount} C</span>
                    </div>
                  </div>
                </div>

                {/* Section 4: Origin & Product Story */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                  <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Meaning & Product Story</span>
                  </span>

                  <div>
                    <h5 className="text-[10px] font-bold text-zinc-400 uppercase">Etymology & Origin</h5>
                    <p className="text-zinc-300 text-[11px] leading-relaxed mt-0.5">{vn.candidate.originExplanation}</p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80">
                    <h5 className="text-[10px] font-bold text-zinc-400 uppercase">Product Connection</h5>
                    <p className="text-zinc-300 text-[11px] leading-relaxed mt-0.5">{vn.candidate.semanticConnection}</p>
                  </div>
                </div>

                {/* Section 5: Domain Availability Matrix */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                  <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Domain Matrix</span>
                  </span>

                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {vn.domains.map((d) => (
                      <div 
                        key={d.domain}
                        className={`p-2 rounded-xl border flex items-center justify-between text-[11px] ${
                          d.status === 'available'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                        }`}
                      >
                        <span className="font-bold">.{d.extension}</span>
                        <span className="text-[10px] uppercase font-black">{d.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 6: Strengths & Weaknesses Breakdown */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
                  <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block">
                    Strengths & Considerations
                  </span>

                  {/* Strengths List */}
                  <div className="space-y-1.5">
                    {strengths.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-emerald-400 font-medium leading-snug">
                        <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>

                  {/* Weaknesses List */}
                  {weaknesses.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                      {weaknesses.map((w, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-amber-400 font-medium leading-snug">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Action Toolbar */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <button
                    id={`btn-select-favorite-${vn.id}`}
                    onClick={() => onSelectFavorite(vn)}
                    className="w-full py-3 rounded-xl bg-zinc-100 text-zinc-950 font-extrabold text-xs uppercase tracking-wider hover:bg-white transition-all text-center flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Bookmark className="w-4 h-4 fill-zinc-950" />
                    <span>Select as Favorite</span>
                  </button>

                  <button
                    id={`btn-similar-compare-${vn.id}`}
                    onClick={() => onGenerateSimilar(vn)}
                    className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-sky-400 font-bold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>Generate Similar Names</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
