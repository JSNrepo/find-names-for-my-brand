import React, { useEffect, useState } from 'react';
import { AdminConfig } from '../types';
import { Settings, Save, ShieldAlert, Check, Trash2 } from 'lucide-react';

export const AdminView: React.FC = () => {
  const [config, setConfig] = useState<AdminConfig>({
    geminiModel: 'gemini-3.6-flash',
    batchSize: 60,
    maxSearchCalls: 100,
    searchProvider: 'auto',
    cacheDurationDays: 7,
    minPronunciationScore: 80,
    strictnessMode: 'extreme',
    dailyUserLimit: 50,
    blockedWords: ['job', 'hire', 'prep'],
    blockedBrands: ['google', 'apple', 'microsoft'],
    blockedSuffixes: ['ly', 'ify', 'io', 'ai']
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/config')
      .then(res => res.json())
      .then(data => { if (data) setConfig(data); })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error('Save admin config error:', err);
    }
  };

  const handleClearAllData = async () => {
    if (!window.confirm('Are you sure you want to clear ALL users, projects, and session data to start completely fresh?')) return;
    try {
      await fetch('/api/admin/clear-all', { method: 'POST' });
      localStorage.clear();
      alert('All system memory, project data, and local user sessions have been cleared fresh!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed clearing database data.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <span>Admin System Controls & Settings</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Global model configuration, search quotas, caching rules, and blocklists.
          </p>
        </div>

        <button
          id="btn-save-admin-config"
          onClick={handleSave}
          className="px-6 py-3 rounded-xl bg-zinc-100 text-zinc-950 font-extrabold text-xs uppercase tracking-wider hover:bg-white transition-all flex items-center gap-2 shadow-sm"
        >
          {saved ? <Check className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Settings Saved!' : 'Save Configuration'}</span>
        </button>
      </div>

      <div className="space-y-6 text-xs text-white">
        
        {/* Model & Generation Settings */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-300">Model & Generation Settings</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Gemini Model Alias</label>
              <select
                value={config.geminiModel}
                onChange={e => setConfig({ ...config, geminiModel: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option value="gemini-3.6-flash">gemini-3.6-flash (Default Fast Text/JSON)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Advanced Reasoning)</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Candidate Batch Size</label>
              <input
                type="number"
                value={config.batchSize}
                onChange={e => setConfig({ ...config, batchSize: Number(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Search Engine Settings */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-300">Search Provider & Caching</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Primary Search Provider</label>
              <select
                value={config.searchProvider}
                onChange={e => setConfig({ ...config, searchProvider: e.target.value as any })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option value="auto">Auto Select (Google CS / Gemini Grounding)</option>
                <option value="google">Google Custom Search API</option>
                <option value="serper">Serper API</option>
                <option value="brave">Brave Search API</option>
                <option value="gemini_grounding">Gemini Search Grounding</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Max Search Calls / Run</label>
              <input
                type="number"
                value={config.maxSearchCalls}
                onChange={e => setConfig({ ...config, maxSearchCalls: Number(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Cache Lifetime (Days)</label>
              <input
                type="number"
                value={config.cacheDurationDays}
                onChange={e => setConfig({ ...config, cacheDurationDays: Number(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Quality Thresholds */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-300">Pronunciation & Strictness</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Min Pronunciation Score Threshold</label>
              <input
                type="number"
                value={config.minPronunciationScore}
                onChange={e => setConfig({ ...config, minPronunciationScore: Number(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Default Strictness Mode</label>
              <select
                value={config.strictnessMode}
                onChange={e => setConfig({ ...config, strictnessMode: e.target.value as any })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option value="extreme">Extreme (Reject on any match)</option>
                <option value="commercial">Commercial (Reject on brand match)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Database Purge & Fresh Start */}
        <div className="p-6 rounded-3xl bg-red-950/20 border border-red-500/30 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-red-400 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>Clear All System & Database Data</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Purges all active projects, saved brand names, search cache, and local user sessions to start completely fresh.
              </p>
            </div>

            <button
              onClick={handleClearAllData}
              className="px-5 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 font-extrabold text-xs uppercase hover:bg-red-500/30 transition-all flex items-center gap-2 min-h-[40px] shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Everything Fresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
