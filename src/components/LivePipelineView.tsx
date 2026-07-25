import React, { useEffect, useState } from 'react';
import { NameRun, NameRunStats, RunLog, ValidatedName } from '../types';
import { ShieldCheck, Loader2, StopCircle, CheckCircle2, Sparkles, Search } from 'lucide-react';

interface LivePipelineViewProps {
  runId: string;
  onViewResults: (validatedNames: ValidatedName[]) => void;
  onCancelRun: () => void;
}

export const LivePipelineView: React.FC<LivePipelineViewProps> = ({ runId, onViewResults, onCancelRun }) => {
  const [stats, setStats] = useState<NameRunStats>({
    generatedCount: 0,
    pronunciationFilteredCount: 0,
    localFilteredCount: 0,
    searchedCount: 0,
    collisionsFoundCount: 0,
    passedCount: 0,
    currentStage: 'Connecting to brand search engine...'
  });

  const [logs, setLogs] = useState<RunLog[]>([]);
  const [validatedNames, setValidatedNames] = useState<ValidatedName[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [targetCount, setTargetCount] = useState(10);

  useEffect(() => {
    // Connect to EventSource / SSE endpoint for real-time progress
    const eventSource = new EventSource(`/api/name-runs/${runId}/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.finished) {
          setIsFinished(true);
          if (data.results) {
            setValidatedNames(data.results);
          }
          eventSource.close();
          return;
        }

        if (data.stats) setStats(data.stats);
        if (data.newLog) {
          setLogs(prev => [...prev, data.newLog]);
        }
        if (data.validatedName) {
          setValidatedNames(prev => [...prev, data.validatedName]);
        }
        if (data.validatedNames) {
          setValidatedNames(data.validatedNames);
        }
        if (data.logs) {
          setLogs(data.logs);
        }
      } catch (e) {
        console.error('SSE JSON parse error:', e);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    // Also fetch current state once via GET
    fetch(`/api/name-runs/${runId}`)
      .then(res => res.json())
      .then((runData: NameRun) => {
        if (runData) {
          setTargetCount(runData.targetCount || 10);
          if (runData.stats) setStats(runData.stats);
          setLogs(runData.logs || []);
          setValidatedNames(runData.validatedNames || []);
          if (runData.status === 'completed' || runData.status === 'cancelled' || runData.status === 'failed') {
            setIsFinished(true);
          }
        }
      })
      .catch(err => {
        console.error('Fetch name run error:', err);
      });

    return () => {
      eventSource.close();
    };
  }, [runId]);

  const progressPercent = Math.min(100, Math.round((validatedNames.length / targetCount) * 100));

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* Top Pipeline Status Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Live Global Internet & Brand Verification</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
              {!isFinished && <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />}
              <span>{isFinished ? 'Search Verification Complete' : (stats?.currentStage || 'Initializing search...')}</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Verifying brand names against live Google search & web domain availability.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            {!isFinished ? (
              <button
                id="btn-cancel-pipeline"
                onClick={onCancelRun}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-semibold text-xs transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                <StopCircle className="w-4 h-4" />
                <span>Cancel Search</span>
              </button>
            ) : (
              <button
                id="btn-view-results"
                onClick={() => onViewResults(validatedNames)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-100 text-zinc-950 font-extrabold text-xs uppercase tracking-wider hover:bg-white transition-all flex items-center justify-center gap-2 shadow-sm min-h-[44px]"
              >
                <Sparkles className="w-4 h-4 text-zinc-950" />
                <span>View Generated Names ({validatedNames.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-300">Search Verification Progress</span>
            <span className="text-emerald-400 font-mono font-bold">{progressPercent}% ({validatedNames.length} / {targetCount} found)</span>
          </div>
          <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-sky-400 to-emerald-400 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Real Stage Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-400 font-medium text-[11px]">Brainstormed</span>
            <p className="text-xl font-extrabold text-white mt-1">{stats?.generatedCount ?? 0}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-400 font-medium text-[11px]">Sound Filters</span>
            <p className="text-xl font-extrabold text-amber-400 mt-1">-{stats?.pronunciationFilteredCount ?? 0}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-400 font-medium text-[11px]">Spelling Filters</span>
            <p className="text-xl font-extrabold text-zinc-400 mt-1">-{stats?.localFilteredCount ?? 0}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-400 font-medium text-[11px]">Web Searches</span>
            <p className="text-xl font-extrabold text-sky-400 mt-1">{stats?.searchedCount ?? 0}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-400 font-medium text-[11px]">Taken Names</span>
            <p className="text-xl font-extrabold text-red-400 mt-1">{stats?.collisionsFoundCount ?? 0}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-emerald-500/30 bg-emerald-950/20">
            <span className="text-emerald-400 font-bold text-[11px]">Passed Names</span>
            <p className="text-xl font-extrabold text-emerald-400 mt-1">{stats?.passedCount ?? 0} / {targetCount}</p>
          </div>
        </div>
      </div>

      {/* Verified Names Banner as they arrive + Skeleton Loaders */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
          <span>Verified Available Names ({validatedNames.length})</span>
          {!isFinished && <span className="text-emerald-400 animate-pulse text-[11px] font-normal">Live searching internet...</span>}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {validatedNames.map((vn) => (
            <div 
              key={vn.id} 
              className="p-5 rounded-2xl bg-zinc-950 border border-emerald-500/30 flex items-center justify-between shadow-md transition-all hover:border-emerald-500/60"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-white">{vn.candidate.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    Score: {vn.finalScore}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">{vn.candidate.pronunciation} • {vn.candidate.category}</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            </div>
          ))}

          {/* Skeleton Shimmer Loaders for pending names */}
          {!isFinished && Array.from({ length: Math.max(1, Math.min(3, targetCount - validatedNames.length)) }).map((_, idx) => (
            <div 
              key={`skeleton-${idx}`}
              className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 animate-pulse flex items-center justify-between"
            >
              <div className="space-y-2 w-full pr-4">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-28 bg-zinc-800 rounded-md" />
                  <div className="h-4 w-12 bg-zinc-800/80 rounded-full" />
                </div>
                <div className="h-3 w-36 bg-zinc-800/50 rounded-md" />
              </div>
              <Search className="w-4 h-4 text-zinc-700 animate-spin shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Completion CTA when finished */}
      {isFinished && (
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Brand Safety Search Complete!</h3>
          <p className="text-xs text-zinc-400 max-w-xl mx-auto leading-relaxed">
            {validatedNames.length >= targetCount 
              ? `Successfully found and verified ${validatedNames.length} brand names with 0 exact-match internet collisions across Google, app stores, and domains.`
              : `Found ${validatedNames.length} unclaimed brand names that passed all strict safety checks.`}
          </p>
          <button
            id="btn-finished-results"
            onClick={() => onViewResults(validatedNames)}
            className="px-8 py-3.5 rounded-xl bg-zinc-100 text-zinc-950 font-extrabold text-xs uppercase tracking-wider hover:bg-white transition-all inline-flex items-center gap-2 shadow-lg min-h-[44px]"
          >
            <Sparkles className="w-4 h-4 text-zinc-950" />
            <span>Open Validated Brand Dashboard</span>
          </button>
        </div>
      )}
    </div>
  );
};
