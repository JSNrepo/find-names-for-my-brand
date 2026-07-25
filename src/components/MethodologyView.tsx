import React from 'react';
import { ShieldCheck, Search, Database, Globe, AlertTriangle, Layers, Lock } from 'lucide-react';

export const MethodologyView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 text-white">
      
      {/* Header */}
      <div className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Full Transparency & Verification Protocols</span>
        </div>
        <h1 className="text-3xl font-extrabold">Find Names for My Brand Collision Verification Methodology</h1>
        <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
          How Find Names for My Brand validates brand candidates against live search indexes before displaying them to users.
        </p>
      </div>

      {/* Methodology Breakdown Cards */}
      <div className="space-y-6 text-xs text-zinc-300">
        
        {/* Step 1 */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Search className="w-4 h-4 text-emerald-400" />
            <span>1. Exact Quoted Web Search ("CandidateName")</span>
          </div>
          <p className="text-zinc-400 leading-relaxed">
            Every candidate is queried using exact string quotes e.g. <code className="text-emerald-300 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 font-mono">"CandidateName"</code>. Standard search engines auto-correct or return fuzzy matches without quotes. Quoting forces the index to return only verbatim occurrences of the name as a distinct word.
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>2. Context-Specific Entity Searches</span>
          </div>
          <p className="text-zinc-400 leading-relaxed">
            To prevent collisions with active software products, mobile applications, startups, or registered businesses, Find Names for My Brand executes targeted context queries:
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 font-mono text-[11px] bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <li>"CandidateName" software</li>
            <li>"CandidateName" company</li>
            <li>"CandidateName" app</li>
            <li>"CandidateName" startup</li>
            <li>"CandidateName" AI platform</li>
          </ul>
        </div>

        {/* Step 3 */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Globe className="w-4 h-4 text-amber-400" />
            <span>3. Domain Availability & DNS Probing</span>
          </div>
          <p className="text-zinc-400 leading-relaxed">
            Find Names for My Brand queries DNS servers for .com, .in, .ai, .app, and .io extensions.
            Note: Domain registration status alone does NOT determine whether a name is unclaimed. Many domains are parked or unconfigured; conversely, many software products run under alternate TLDs. Find Names for My Brand treats domain checks as a supporting signal alongside exact web search.
          </p>
        </div>

        {/* Step 4 */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Database className="w-4 h-4 text-purple-400" />
            <span>4. Phonetic & Soundex Similarity Matrix</span>
          </div>
          <p className="text-zinc-400 leading-relaxed">
            Find Names for My Brand generates phonetic variations (replacing i/ee, v/w, c/k, a/ah) and calculates Levenshtein distance against known brand vocabularies to ensure your candidate does not sound confusingly similar to existing famous software or brands.
          </p>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-3 text-amber-300 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Legal Disclaimer & Trademark Clearance Notice</span>
          </div>
          <p className="text-zinc-300 leading-relaxed">
            "No detected exact-match collision" means that Find Names for My Brand's search verification routines returned zero verbatim occurrences of the candidate name across connected web indexes at the moment of verification.
          </p>
          <p className="text-zinc-300 leading-relaxed font-semibold">
            This automated check does NOT constitute a formal legal, trademark, or corporate registry clearance. Search engine indexes may be unindexed, private, or delayed. You must always perform an official trademark search on government registry portals (such as IP India or WIPO) prior to commercial registration or trademark filing.
          </p>
        </div>
      </div>
    </div>
  );
};
