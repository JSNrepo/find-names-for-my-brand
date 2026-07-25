import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { ProjectForm } from './components/ProjectForm';
import { ResultsView } from './components/ResultsView';
import { CompareView } from './components/CompareView';
import { SavedProjectsView } from './components/SavedProjectsView';
import { AccountView } from './components/AccountView';
import { AdminView } from './components/AdminView';
import { MethodologyView } from './components/MethodologyView';
import { OnboardingTour } from './components/OnboardingTour';
import { ErrorBoundary } from './components/ErrorBoundary';
import { generateCandidates } from './lib/client-generator';
import { CookieBanner } from './components/LegalModals';
import { ProjectBrief, NamingProject, ValidatedName } from './types';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { Sparkles, Key, ExternalLink, Save, Check } from 'lucide-react';

export function AppContent() {
  const { user, profile, loading, incrementRuns, markTourSeen, saveGeminiKey } = useAuth();
  
  const [currentTab, setCurrentTab] = useState<string>('new-project');
  const [presetBrief, setPresetBrief] = useState<Partial<ProjectBrief> | undefined>();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [validatedNames, setValidatedNames] = useState<ValidatedName[]>([]);
  const [currentBrief, setCurrentBrief] = useState<ProjectBrief | null>(null);
  const [starredIds, setStarredIds] = useState<string[]>([]);
  const [comparedCandidates, setComparedCandidates] = useState<ValidatedName[]>([]);
  
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [modalApiKeyInput, setModalApiKeyInput] = useState('');
  const [modalKeySaved, setModalKeySaved] = useState(false);
  const [tourKey, setTourKey] = useState<number>(0);
  const [showTourExplicit, setShowTourExplicit] = useState(false);

  const handleOpenTour = () => {
    setTourKey(prev => prev + 1);
    setShowTourExplicit(true);
  };

  const handleStartNewProject = (preset?: Partial<ProjectBrief>) => {
    setPresetBrief(preset);
    setCurrentTab('new-project');
  };
  const handleSubmitBrief = async (brief: ProjectBrief) => {
    const apiKey = profile?.customGeminiKey;
    if (!apiKey) {
      setShowLimitModal(true);
      return;
    }

    setCurrentBrief(brief);
    setActiveProjectId('generating');
    setCurrentTab('running');

    try {
      const candidates = await generateCandidates(apiKey, brief, 40);

      if (candidates.length === 0) {
        throw new Error('No candidates were generated. Check your Gemini API key and try again.');
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-gemini-key': apiKey
      };

      const validated: ValidatedName[] = [];
      for (let i = 0; i < candidates.length; i++) {
        const c = candidates[i];
        try {
          const valRes = await fetch('/api/candidates/validate', {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: c.name, brief, strictnessMode: brief.strictnessMode })
          });
          const val = await valRes.json();

          const sCount = Math.max(1, c.name.toLowerCase().replace(/(?:[^laeiouy]|ed|es|e)$/i, '').replace(/^y/i, '').match(/[aeiouy]{1,2}/g)?.length || 1);
          const pScore = Math.min(100, Math.max(60, 100 - (sCount * 5) - (c.name.length > 8 ? 10 : 0) - (/[^aeiouy]{3,}/i.test(c.name) ? 10 : 0) - (/(ough|eigh|psh|mn|cz|kn|gn|wr)/.test(c.name.toLowerCase()) ? 10 : 0)));
          const memScore = Math.min(100, Math.max(60, 100 - (c.name.length * 3)));
          const relScore = Math.round(c.confidence || 85);
          const passedChecks = val.checks?.filter((ch: any) => ch.status === 'passed').length || 0;
          const confidence = Math.min(95, Math.max(82, 85 + (passedChecks * 2)));
          const visualSimplicity = c.name.length <= 6 ? 95 : 80;
          const finalScore = Math.round((pScore * 0.3) + (memScore * 0.2) + (relScore * 0.2) + (confidence * 0.2) + (visualSimplicity * 0.1));

          if (!val.hasCollision) {
            validated.push({
              id: `val_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              candidate: c,
              checks: val.checks || [],
              domains: val.domains || [],
              pronunciationScore: pScore,
              memorabilityScore: memScore,
              relevanceScore: relScore,
              uniquenessConfidence: confidence,
              finalScore,
              status: 'passed',
              validatedAt: new Date().toISOString()
            });
          }
        } catch {
          // skip individual validation failures
        }
      }

      validated.sort((a, b) => b.finalScore - a.finalScore);

      await incrementRuns();
      setValidatedNames(validated);
      setCurrentTab('results');

      if (user) {
        try {
          const projectId = `proj_${Date.now()}`;
          const projectRef = doc(db, 'users', user.uid, 'projects', projectId);
          await setDoc(projectRef, {
            brief: JSON.parse(JSON.stringify(brief)),
            names: validated.map(n => ({
              id: n.id,
              name: n.candidate.name,
              originExplanation: n.candidate.originExplanation,
              meaning: n.candidate.meaning,
              finalScore: n.finalScore,
              pronunciationScore: n.pronunciationScore,
              memorabilityScore: n.memorabilityScore,
              relevanceScore: n.relevanceScore,
              uniquenessConfidence: n.uniquenessConfidence,
              domains: n.domains,
              checks: n.checks,
              status: n.status,
              validatedAt: n.validatedAt,
              starred: false
            })),
            createdAt: new Date().toISOString(),
            nameCount: validated.length
          });
          setActiveProjectId(projectId);
        } catch (e) {
          console.error('Auto-save to Firestore failed:', e);
        }
      }
    } catch (err) {
      console.error('Error generating names:', err);
      setCurrentTab('new-project');
    }
  };

  const handleViewResults = (results: ValidatedName[]) => {
    setValidatedNames(results);
    setCurrentTab('results');
  };

  const handleCancelRun = async () => {
    setCurrentTab('results');
  };

  const handleStarToggle = (vn: ValidatedName) => {
    const newStarred = starredIds.includes(vn.id)
      ? starredIds.filter(id => id !== vn.id)
      : [...starredIds, vn.id];
    setStarredIds(newStarred);
    if (user && activeProjectId) {
      const projectRef = doc(db, 'users', user.uid, 'projects', activeProjectId);
      setDoc(projectRef, {
        names: validatedNames.map(n => ({
          ...n,
          starred: newStarred.includes(n.id)
        }))
      }, { merge: true }).catch(() => {});
    }
  };

  const handleCompareCandidate = (vn: ValidatedName) => {
    if (comparedCandidates.some(c => c.id === vn.id)) {
      setComparedCandidates(prev => prev.filter(c => c.id !== vn.id));
    } else {
      if (comparedCandidates.length >= 4) {
        alert('You can compare up to 4 candidates at a time.');
        return;
      }
      setComparedCandidates(prev => [...prev, vn]);
    }
  };

  const handleRecheckCandidate = async (vn: ValidatedName) => {
    try {
      const res = await fetch('/api/search/exact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-gemini-key': profile?.customGeminiKey || '' },
        body: JSON.stringify({ candidateName: vn.candidate.name, strictnessMode: 'extreme' })
      });
      const data = await res.json();
      alert(`Recheck complete for "${vn.candidate.name}". Has exact collision: ${data.hasCollision ? 'YES' : 'NO'}`);
    } catch (err) {
      console.error('Recheck error:', err);
    }
  };

  const handleGenerateSimilar = async (vn: ValidatedName) => {
    const apiKey = profile?.customGeminiKey;
    if (!apiKey) {
      setShowLimitModal(true);
      return;
    }
    setCurrentTab('running');
    try {
      const brief = currentBrief || {
        productType: vn.candidate.originExplanation,
        description: vn.candidate.semanticConnection || '',
        audience: '',
        industry: '',
        personality: [],
        meanings: [],
        avoidTerms: [],
        minimumLetters: 4,
        maximumLetters: 8,
        maximumSyllables: 3,
        strictnessMode: 'moderate',
        originExplanation: ''
      };
      const similar = await generateCandidates(apiKey, brief, 20, vn.candidate.name);
      if (similar.length === 0) {
        throw new Error('No similar candidates generated');
      }
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-gemini-key': apiKey
      };
      const validated: ValidatedName[] = [];
      for (const c of similar) {
        try {
          const valRes = await fetch('/api/candidates/validate', {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: c.name, brief, strictnessMode: brief.strictnessMode })
          });
          const val = await valRes.json();
          const sCount = Math.max(1, c.name.toLowerCase().replace(/(?:[^laeiouy]|ed|es|e)$/i, '').replace(/^y/i, '').match(/[aeiouy]{1,2}/g)?.length || 1);
          const pScore = Math.min(100, Math.max(60, 100 - (sCount * 5) - (c.name.length > 8 ? 10 : 0) - (/[^aeiouy]{3,}/i.test(c.name) ? 10 : 0) - (/(ough|eigh|psh|mn|cz|kn|gn|wr)/.test(c.name.toLowerCase()) ? 10 : 0)));
          const memScore = Math.min(100, Math.max(60, 100 - (c.name.length * 3)));
          const passedChecks = val.checks?.filter((ch: any) => ch.status === 'passed').length || 0;
          const confidence = Math.min(95, Math.max(82, 85 + (passedChecks * 2)));
          if (!val.hasCollision) {
            validated.push({
              id: `val_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              candidate: c,
              checks: val.checks || [],
              domains: val.domains || [],
              pronunciationScore: pScore,
              memorabilityScore: memScore,
              relevanceScore: 80,
              uniquenessConfidence: confidence,
              finalScore: Math.round((pScore * 0.3) + (memScore * 0.2) + (80 * 0.2) + (confidence * 0.2) + ((c.name.length <= 6 ? 95 : 80) * 0.1)),
              status: 'passed',
              validatedAt: new Date().toISOString()
            });
          }
        } catch { }
      }
      validated.sort((a, b) => b.finalScore - a.finalScore);
      setValidatedNames(validated);
      setCurrentTab('results');
    } catch (e) {
      console.error(e);
      setCurrentTab('results');
    }
  };

  const handleOpenSavedProject = (proj: NamingProject) => {
    setActiveProjectId(proj.id);
    if (proj.savedCandidates && proj.savedCandidates.length > 0) {
      setValidatedNames(proj.savedCandidates);
      setCurrentTab('results');
    } else {
      handleStartNewProject(proj.brief);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-950 font-black flex items-center justify-center text-xl mb-4 shadow-sm animate-pulse">
          F
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Loading Find Names for My Brand...</p>
      </div>
    );
  }

  // 1. Mandatory Sign In: If user is NOT signed in, render ONLY LandingPage!
  if (!user) {
    return (
      <LandingPage
        onStartNewProject={(preset) => {
          setPresetBrief(preset);
        }}
        onSeeMethodology={() => {
          // Unauthenticated users stay on landing page
        }}
      />
    );
  }

  // 2. Authenticated App Workspace with Sidebar Layout
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans selection:bg-zinc-800 selection:text-white">
      
      {/* Left Sidebar Layout */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onNewProject={() => handleStartNewProject()}
        onOpenTour={handleOpenTour}
        hasActiveResults={validatedNames.length > 0}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 transition-all duration-300 min-h-screen flex flex-col">
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          
          <ErrorBoundary onReset={() => setCurrentTab('new-project')}>
            {currentTab === 'new-project' && (
              <ProjectForm
                initialBrief={presetBrief}
                onSubmitBrief={handleSubmitBrief}
              />
            )}

            {currentTab === 'running' && (
              <div className="max-w-5xl mx-auto py-20 px-4 text-center space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
                  <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                </div>
                <h3 className="text-lg font-bold text-white">Generating Brand Names</h3>
                <p className="text-sm text-zinc-400 max-w-md mx-auto">
                  Using your Gemini API key to brainstorm names and check availability...
                </p>
              </div>
            )}

            {currentTab === 'results' && (
              <ResultsView
                validatedNames={validatedNames || []}
                onStarToggle={handleStarToggle}
                onRecheckCandidate={handleRecheckCandidate}
                onGenerateSimilar={handleGenerateSimilar}
                onCompareCandidate={handleCompareCandidate}
                onOpenCompare={() => setCurrentTab('compare')}
                starredIds={starredIds || []}
                comparedCandidateIds={(comparedCandidates || []).map(c => c?.id).filter(Boolean)}
              />
            )}

            {currentTab === 'compare' && (
              <CompareView
                comparedCandidates={comparedCandidates || []}
                onRemoveFromCompare={(id) => setComparedCandidates(prev => prev.filter(c => c?.id !== id))}
                onClearCompare={() => setComparedCandidates([])}
                onSelectFavorite={(vn) => handleStarToggle(vn)}
                onGenerateSimilar={handleGenerateSimilar}
              />
            )}

            {currentTab === 'saved' && (
              <SavedProjectsView
                onOpenProject={handleOpenSavedProject}
                onNewProject={() => handleStartNewProject()}
              />
            )}

            {currentTab === 'account' && <AccountView onOpenTour={handleOpenTour} />}

            {currentTab === 'admin' && <AdminView />}

            {currentTab === 'methodology' && <MethodologyView />}
          </ErrorBoundary>

        </main>
      </div>

      {/* BYOK Key Required Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-zinc-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <Key className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-extrabold text-white">Bring Your Own Key (BYOK Required)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
                <strong>Find Names for My Brand</strong> is 100% free and open source. Enter your free personal <strong>Gemini API Key</strong> to run brand name search generations.
              </p>
            </div>

            {/* BYOK Fast Setup Box */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 text-xs">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>Get your Free Gemini Key (1 Min Setup):</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] underline hover:text-emerald-300"
                >
                  <span>Open AI Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="relative">
                <input
                  type="password"
                  value={modalApiKeyInput}
                  onChange={(e) => setModalApiKeyInput(e.target.value)}
                  placeholder="Paste AIzaSy... key here"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <button
                disabled={!modalApiKeyInput.trim()}
                onClick={async () => {
                  if (modalApiKeyInput.trim()) {
                    await saveGeminiKey(modalApiKeyInput.trim());
                    setModalKeySaved(true);
                    setTimeout(() => {
                      setShowLimitModal(false);
                      setModalKeySaved(false);
                    }, 800);
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 min-h-[40px]"
              >
                {modalKeySaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Key Saved! Starting Generation...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Key & Start Generation</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => setShowLimitModal(false)}
              className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Onboarding Tour Guide */}
      <OnboardingTour
        key={tourKey}
        isOpen={showTourExplicit}
        onClose={() => setShowTourExplicit(false)}
        currentTab={currentTab}
        onNavigateTab={setCurrentTab}
        onStartNewProject={handleStartNewProject}
      />

      {/* Cookie Consent Banner */}
      <CookieBanner />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
