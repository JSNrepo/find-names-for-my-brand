import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Key, 
  Smartphone, 
  Check, 
  Zap, 
  Save, 
  Eye, 
  EyeOff, 
  Trash2,
  AlertTriangle,
  CreditCard,
  Lightbulb,
  ExternalLink,
  Github,
  Star
} from 'lucide-react';

interface AccountViewProps {
  onOpenTour?: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({ onOpenTour }) => {
  const { user, profile, signOut, saveGeminiKey, updatePlan, deviceError } = useAuth();
  const [apiKeyInput, setApiKeyInput] = useState(profile?.customGeminiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);

  const isPro = profile?.plan === 'pro';
  const runsUsed = profile?.runsUsed || 0;
  const freeRemaining = Math.max(0, 2 - runsUsed);

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveGeminiKey(apiKeyInput.trim());
    setSavedKeySuccess(true);
    setTimeout(() => setSavedKeySuccess(false), 3000);
  };

  const handleRemoveKey = async () => {
    setApiKeyInput('');
    await saveGeminiKey('');
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      
      {/* Page Title */}
      <div className="border-b border-zinc-800/80 pb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Settings & Account</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage your plan, personal Gemini API Key, and connected device sessions.</p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenTour && (
            <button
              onClick={onOpenTour}
              className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition-all flex items-center gap-1.5 min-h-[38px]"
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>1-Min Tour Guide</span>
            </button>
          )}

          <button
            onClick={signOut}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-colors min-h-[38px]"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Device Session Limit Warning */}
      {deviceError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Concurrent Device Limit Reached</strong>
            {deviceError}
          </div>
        </div>
      )}

      {/* Profile & Current Access Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white font-bold text-lg">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <UserIcon className="w-6 h-6 text-zinc-300" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{user?.displayName || user?.email?.split('@')[0] || 'User Account'}</h2>
              <p className="text-xs text-zinc-400 mt-0.5">{user?.email || 'Authenticated Session'}</p>
            </div>
          </div>

          <div className="shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
              profile?.customGeminiKey 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
            }`}>
              <ShieldCheck className="w-4 h-4" />
              <span>{profile?.customGeminiKey ? 'BYOK Key Active (Unlimited)' : 'Gemini Key Required'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bring Your Own Key (BYOK) Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Bring Your Own Gemini API Key (BYOK)</h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              When standard server credits are exhausted, add your personal Gemini API key to continue running brief generations for free.
            </p>
          </div>

          {profile?.customGeminiKey && (
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase shrink-0">
              Key Active
            </span>
          )}
        </div>

        {/* How to get key box */}
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
          <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>How to get a Free Gemini API Key in 1 Minute:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px] leading-relaxed pl-1">
            <li>Go to Google AI Studio at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold underline hover:text-emerald-300">aistudio.google.com/app/apikey</a></li>
            <li>Click <strong>"Create API Key"</strong> (100% Free, no credit card needed)</li>
            <li>Copy your key (starts with <code className="text-zinc-300 bg-zinc-900 px-1 py-0.5 rounded">AIzaSy...</code>) and paste it below:</li>
          </ol>
        </div>

        <form onSubmit={handleSaveKey} className="space-y-4">
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 pr-24 font-mono"
            />
            
            <div className="absolute right-2 top-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              {apiKeyInput && (
                <button
                  type="button"
                  onClick={handleRemoveKey}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                  title="Remove key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-zinc-500">
              Get a free API key from Google AI Studio at <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">aistudio.google.com</a>
            </p>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition-all shadow-sm flex items-center gap-1.5 min-h-[40px]"
            >
              <Save className="w-4 h-4" />
              <span>Save Personal Key</span>
            </button>
          </div>

          {savedKeySuccess && (
            <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Personal Gemini API Key saved successfully!</span>
            </p>
          )}
        </form>
      </div>

      {/* Data Clearing Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-400" />
              <span>Clear All Local & Project Data</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Permanently wipe all cached brand name search history, brief drafts, and stored API keys from this device and reset application state.
            </p>
          </div>

          <button
            type="button"
            onClick={async () => {
              if (window.confirm('Are you sure you want to clear all stored project data and local preferences?')) {
                // Clear localStorage
                localStorage.clear();
                // Clear server state
                try {
                  await fetch('/api/admin/clear-all', { method: 'POST' });
                } catch (e) {
                  console.error(e);
                }
                alert('All project data, history, and stored preferences have been cleared successfully!');
                window.location.reload();
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 shrink-0 min-h-[40px]"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All My Data</span>
          </button>
        </div>
      </div>

      {/* Open Source & Star Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Github className="w-5 h-5 text-white" />
              <span>Find Names for My Brand is 100% Free & Open Source</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Find Names for My Brand is built for the community. Star the repository on GitHub to support development or contribute!
            </p>
          </div>

          <a
            href="https://github.com/JSNrepo/ZeroName"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 shrink-0 min-h-[40px]"
          >
            <Github className="w-4 h-4 text-zinc-950" />
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Star on GitHub</span>
          </a>
        </div>
      </div>

    </div>
  );
};
