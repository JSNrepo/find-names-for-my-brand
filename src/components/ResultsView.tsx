import React, { useState } from 'react';
import { ValidatedName } from '../types';
import { 
  ShieldCheck, CheckCircle2, Copy, Star, RefreshCw, Sparkles, 
  ChevronDown, ChevronUp, ExternalLink, SlidersHorizontal, ArrowUpDown, FileSpreadsheet
} from 'lucide-react';

interface ResultsViewProps {
  validatedNames: ValidatedName[];
  onStarToggle: (vn: ValidatedName) => void;
  onRecheckCandidate: (vn: ValidatedName) => void;
  onGenerateSimilar: (vn: ValidatedName) => void;
  onCompareCandidate: (vn: ValidatedName) => void;
  onOpenCompare?: () => void;
  starredIds: string[];
  comparedCandidateIds: string[];
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  validatedNames,
  onStarToggle,
  onRecheckCandidate,
  onGenerateSimilar,
  onCompareCandidate,
  onOpenCompare,
  starredIds,
  comparedCandidateIds
}) => {
  const [expandedEvidenceId, setExpandedEvidenceId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [minScoreFilter, setMinScoreFilter] = useState<number>(80);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'pronunciation' | 'confidence'>('score');

  const handleCopy = (name: string, id: string) => {
    navigator.clipboard.writeText(name);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const safeValidatedNames = Array.isArray(validatedNames) ? validatedNames : [];

  const filteredNames = safeValidatedNames
    .filter(vn => vn && typeof vn === 'object' && vn.candidate)
    .filter(vn => (vn.finalScore ?? 0) >= minScoreFilter)
    .filter(vn => categoryFilter === 'all' || vn.candidate?.category === categoryFilter)
    .sort((a, b) => {
      if (sortBy === 'score') return (b.finalScore ?? 0) - (a.finalScore ?? 0);
      if (sortBy === 'pronunciation') return (b.pronunciationScore ?? 0) - (a.pronunciationScore ?? 0);
      return (b.uniquenessConfidence ?? 0) - (a.uniquenessConfidence ?? 0);
    });

  const handleExportAllCsv = () => {
    const headers = ['Name', 'Score', 'Pronunciation', 'Confidence', 'Category', 'Pronounced', 'Syllables', 'Meaning', 'Story', 'Domains', 'Starred'];
    const rows = filteredNames.map(vn => [
      vn.candidate.name,
      vn.finalScore ?? '',
      vn.pronunciationScore ?? '',
      vn.uniquenessConfidence ?? '',
      vn.candidate.category ?? '',
      vn.candidate.pronunciation ?? '',
      (vn.candidate.syllables || []).join(' - '),
      vn.candidate.meaning ?? '',
      vn.candidate.originExplanation ?? '',
      (vn.domains || []).map(d => `${d.domain}:${d.status}`).join('; '),
      starredIds.includes(vn.id) ? 'Yes' : 'No'
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brand-names.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>Search Verified Brand Names</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Available Brand Names ({filteredNames.length})</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Status: <span className="text-emerald-400 font-bold">No exact match collisions detected</span> across live web searches and domain registries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 text-xs">
          <button
            onClick={handleExportAllCsv}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export All to CSV
          </button>

          <div>
            <label className="text-zinc-400 block mb-1 font-medium">Min Score</label>
            <select
              value={minScoreFilter}
              onChange={e => setMinScoreFilter(Number(e.target.value))}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-white focus:outline-none"
            >
              <option value={80}>80+ (Recommended)</option>
              <option value={70}>70+</option>
              <option value={0}>All Scores</option>
            </select>
          </div>

          <div>
            <label className="text-zinc-400 block mb-1 font-medium">Category</label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-white capitalize focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="coined">Coined</option>
              <option value="blended">Blended</option>
              <option value="abstract">Abstract</option>
              <option value="phonetic">Phonetic</option>
              <option value="language-inspired">Language-Inspired</option>
            </select>
          </div>

          <div>
            <label className="text-zinc-400 block mb-1 font-medium">Sort By</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-white focus:outline-none"
            >
              <option value="score">Overall Score</option>
              <option value="pronunciation">Pronunciation</option>
              <option value="confidence">Confidence</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidates List */}
      {filteredNames.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/40 border border-zinc-800/80 rounded-3xl space-y-3">
          <p className="text-zinc-400 font-medium">No candidates match the selected filter criteria.</p>
          <button onClick={() => { setMinScoreFilter(0); setCategoryFilter('all'); }} className="text-xs text-white underline font-semibold">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredNames.map((vn) => {
            const isStarred = starredIds.includes(vn.id);
            const isCompared = comparedCandidateIds.includes(vn.id);
            const isExpanded = expandedEvidenceId === vn.id;
            const checksList = vn.checks || [];
            const domainsList = vn.domains || [];
            const syllablesList = vn.candidate?.syllables || [];
            const exactCheck = checksList.find(c => c?.type === 'exact-search');

            return (
              <div 
                key={vn.id}
                className={`p-6 sm:p-8 rounded-3xl transition-all border ${
                  isStarred 
                    ? 'bg-zinc-900/90 border-amber-500/40 shadow-amber-500/5 shadow-xl' 
                    : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {/* Primary Card Top Row */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-zinc-800/80 pb-6">
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-3xl font-extrabold text-white tracking-tight">{vn.candidate?.name || 'Unnamed'}</h2>
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        No detected exact-match collision
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-950 text-zinc-400 border border-zinc-800 capitalize">
                        {vn.candidate?.category || 'coined'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                      <span>Pronunciation: <strong className="text-zinc-200">{vn.candidate?.pronunciation || ''}</strong></span>
                      <span>•</span>
                      <span>Syllables: <strong className="text-zinc-200">{syllablesList.join(' - ')}</strong> ({vn.candidate?.syllableCount || syllablesList.length})</span>
                      <span>•</span>
                      <span>Exact Query: <code className="text-emerald-300 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">"{vn.candidate?.name || ''}"</code></span>
                    </div>
                  </div>

                  {/* Score Matrix */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center min-w-20">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Final Score</span>
                      <span className="text-2xl font-black text-white">{vn.finalScore ?? 0}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center min-w-20">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Pronunciation</span>
                      <span className="text-lg font-extrabold text-zinc-200">{vn.pronunciationScore ?? 0}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center min-w-20">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Confidence</span>
                      <span className="text-lg font-extrabold text-emerald-400">{vn.uniquenessConfidence ?? 0}%</span>
                    </div>
                  </div>
                </div>

                {/* Story & Semantic Connection */}
                <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border-b border-zinc-800/80">
                  <div>
                    <h4 className="font-bold text-zinc-300 uppercase tracking-wider text-[10px] mb-1">Origin & Linguistic Story</h4>
                    <p className="text-zinc-400 leading-relaxed">{vn.candidate?.originExplanation || 'No story provided.'}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-300 uppercase tracking-wider text-[10px] mb-1">Product Relationship</h4>
                    <p className="text-zinc-400 leading-relaxed">{vn.candidate?.semanticConnection || 'No connection provided.'}</p>
                  </div>
                </div>

                {/* Domain Summary & Completed Checks Row */}
                <div className="py-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                  
                  {/* Domain Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-zinc-500 font-medium">Domains:</span>
                    {domainsList.map(d => (
                      <span key={d.domain} className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        d.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        d.status === 'registered' ? 'bg-zinc-950 text-zinc-500 border-zinc-800' :
                        'bg-zinc-950 text-amber-400 border-zinc-800'
                      }`}>
                        .{d.extension}: {d.status.toUpperCase()}
                      </span>
                    ))}
                  </div>

                  <div className="text-zinc-500">
                    Checked against <strong className="text-zinc-300">{checksList.length} web queries</strong> and selected availability sources.
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80">
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      id={`btn-star-${vn.id}`}
                      onClick={() => onStarToggle(vn)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isStarred ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5" fill={isStarred ? 'currentColor' : 'none'} />
                      <span>{isStarred ? 'Starred' : 'Star'}</span>
                    </button>

                    <button
                      id={`btn-copy-${vn.id}`}
                      onClick={() => handleCopy(vn.candidate.name, vn.id)}
                      className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedId === vn.id ? 'Copied!' : 'Copy'}</span>
                    </button>

                    <button
                      id={`btn-similar-${vn.id}`}
                      onClick={() => onGenerateSimilar(vn)}
                      className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-sky-400 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Similar</span>
                    </button>

                    <button
                      id={`btn-compare-${vn.id}`}
                      onClick={() => onCompareCandidate(vn)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isCompared ? 'bg-zinc-100 text-zinc-950 font-bold' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                      }`}
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      <span>{isCompared ? 'In Compare Matrix' : 'Compare'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-recheck-${vn.id}`}
                      onClick={() => onRecheckCandidate(vn)}
                      title="Bypass cache and recheck now"
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                      id={`btn-expand-evidence-${vn.id}`}
                      onClick={() => setExpandedEvidenceId(isExpanded ? null : vn.id)}
                      className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <span>Search Evidence ({exactCheck?.evidence?.length || 0})</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expandable Search Evidence Section */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-zinc-800/80 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Live Search Audit Evidence for "{vn.candidate.name}"
                    </h4>

                    {vn.checks.map((chk, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs space-y-2">
                        <div className="flex items-center justify-between text-zinc-400">
                          <span className="font-bold text-zinc-200 capitalize">{chk.type} ({chk.provider})</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            chk.status === 'passed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {chk.status.toUpperCase()}
                          </span>
                        </div>

                        {chk.query && (
                          <p className="text-zinc-500">Query: <code className="text-zinc-300">{chk.query}</code></p>
                        )}

                        {chk.evidence && chk.evidence.length > 0 ? (
                          <div className="space-y-2 pt-2 border-t border-zinc-800">
                            {chk.evidence.map((ev, evIdx) => (
                              <div key={evIdx} className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
                                <a href={ev.url} target="_blank" rel="noreferrer" className="font-semibold text-sky-400 hover:underline flex items-center gap-1">
                                  <span>{ev.title || ev.url}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                                {ev.snippet && <p className="text-zinc-400 text-[11px]">{ev.snippet}</p>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-zinc-500 italic">No exact match collisions detected in live search index.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky Compare Floating Bar */}
      {comparedCandidateIds.length > 0 && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 p-3 sm:p-4 rounded-2xl shadow-2xl shadow-black flex flex-col sm:flex-row items-center justify-between gap-3 text-xs w-[92vw] sm:w-auto max-w-lg">
          <div className="flex items-center gap-2 text-white font-bold shrink-0">
            <ArrowUpDown className="w-4 h-4 text-emerald-400" />
            <span>{comparedCandidateIds.length} / 4 Selected for Comparison</span>
          </div>

          <button
            id="btn-open-compare-bar"
            onClick={onOpenCompare}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-extrabold uppercase tracking-wider hover:bg-emerald-400 transition-all shadow-md min-h-[40px] flex items-center justify-center gap-1 shrink-0"
          >
            <span>Open Compare Matrix →</span>
          </button>
        </div>
      )}
    </div>
  );
};
