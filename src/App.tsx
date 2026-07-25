import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { ProjectForm } from './components/ProjectForm';
import { LivePipelineView } from './components/LivePipelineView';
import { ResultsView } from './components/ResultsView';
import { CompareView } from './components/CompareView';
import { SavedProjectsView } from './components/SavedProjectsView';
import { ValidationReportView } from './components/ValidationReportView';
import { AccountView } from './components/AccountView';
import { AdminView } from './components/AdminView';
import { MethodologyView } from './components/MethodologyView';
import { OnboardingTour } from './components/OnboardingTour';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CookieBanner } from './components/LegalModals';
import { ProjectBrief, NamingProject, ValidatedName } from './types';
import { ShieldCheck, AlertCircle, Sparkles, CreditCard, Key, ExternalLink, Save, Check } from 'lucide-react';

export function AppContent() {
  const { user, profile, loading, incrementRuns, markTourSeen, saveGeminiKey } = useAuth();
  
  const [currentTab, setCurrentTab] = useState<string>('new-project');
  const [presetBrief, setPresetBrief] = useState<Partial<ProjectBrief> | undefined>();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [validatedNames, setValidatedNames] = useState<ValidatedName[]>([]);
  const [savedCandidateIds, setSavedCandidateIds] = useState<string[]>([]);
  const [comparedCandidates, setComparedCandidates] = useState<ValidatedName[]>([]);
  const [reportCandidate, setReportCandidate] = useState<ValidatedName | null>(null);
  
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
    // Require BYOK Gemini API Key
    const hasCustomKey = Boolean(profile?.customGeminiKey);

    if (!hasCustomKey) {
      setShowLimitModal(true);
      return;
    }

    try {
      // 1. Create project
      const projRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, title: brief.productType })
      });
      const project: NamingProject = await projRes.json();
      setActiveProjectId(project.id);

      // 2. Start run pipeline with custom Gemini API key header if available
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (profile?.customGeminiKey) {
        headers['x-gemini-key'] = profile.customGeminiKey;
      }

      const runRes = await fetch('/api/name-runs', {
        method: 'POST',
        headers,
        body: JSON.stringify({ brief, projectId: project.id, targetCount: brief.targetCount })
      });
      const run = await runRes.json();
      
      // Increment runs used
      await incrementRuns();

      setActiveRunId(run.id);
      setCurrentTab('running');
    } catch (err) {
      console.error('Error starting project run:', err);
    }
  };

  const handleViewResults = (results: ValidatedName[]) => {
    setValidatedNames(results);
    setCurrentTab('results');
  };

  const handleCancelRun = async () => {
    if (activeRunId) {
      await fetch(`/api/name-runs/${activeRunId}/cancel`, { method: 'POST' });
    }
    setCurrentTab('results');
  };

  const handleSaveCandidate = (vn: ValidatedName) => {
    if (savedCandidateIds.includes(vn.id)) {
      setSavedCandidateIds(prev => prev.filter(id => id !== vn.id));
    } else {
      setSavedCandidateIds(prev => [...prev, vn.id]);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateName: vn.candidate.name, strictnessMode: 'extreme' })
      });
      const data = await res.json();
      alert(`Recheck complete for "${vn.candidate.name}". Has exact collision: ${data.hasCollision ? 'YES' : 'NO'}`);
    } catch (err) {
      console.error('Recheck error:', err);
    }
  };

  const handleGenerateSimilar = async (vn: ValidatedName) => {
    try {
      const res = await fetch('/api/candidates/similar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: vn.candidate.name,
          brief: {
            productType: vn.candidate.originExplanation,
            description: vn.candidate.semanticConnection,
            minimumLetters: 4,
            maximumLetters: 8,
            maximumSyllables: 3,
            avoidTerms: []
          }
        })
      });
      const candidates = await res.json();
      alert(`Generated ${candidates.length} similar candidates! Re-launching pipeline with similar criteria.`);
      if (candidates.length > 0) {
        handleStartNewProject({
          productType: `Similar to ${vn.candidate.name}`,
          description: vn.candidate.semanticConnection,
          minimumLetters: 4,
          maximumLetters: 8
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportReport = (vn: ValidatedName) => {
    setReportCandidate(vn);
    setCurrentTab('report');
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
              activeRunId ? (
                <LivePipelineView
                  runId={activeRunId}
                  onViewResults={handleViewResults}
                  onCancelRun={handleCancelRun}
                />
              ) : (
                <div className="p-12 text-center bg-zinc-900/60 border border-zinc-800 rounded-3xl space-y-4 max-w-xl mx-auto my-12">
                  <h3 className="text-lg font-bold text-white">No Active Brand Generation Run</h3>
                  <p className="text-xs text-zinc-400">Please create a new naming brief to start a live search generation.</p>
                  <button
                    onClick={handleStartNewProject}
                    className="px-6 py-3 rounded-xl bg-zinc-100 text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-white"
                  >
                    Start New Naming Brief
                  </button>
                </div>
              )
            )}

            {currentTab === 'results' && (
              <ResultsView
                validatedNames={validatedNames || []}
                onSaveCandidate={handleSaveCandidate}
                onRejectCandidate={() => {}}
                onRecheckCandidate={handleRecheckCandidate}
                onGenerateSimilar={handleGenerateSimilar}
                onCompareCandidate={handleCompareCandidate}
                onExportReport={handleExportReport}
                onOpenCompare={() => setCurrentTab('compare')}
                savedCandidateIds={savedCandidateIds || []}
                comparedCandidateIds={(comparedCandidates || []).map(c => c?.id).filter(Boolean)}
              />
            )}

            {currentTab === 'compare' && (
              <CompareView
                comparedCandidates={comparedCandidates || []}
                onRemoveFromCompare={(id) => setComparedCandidates(prev => prev.filter(c => c?.id !== id))}
                onClearCompare={() => setComparedCandidates([])}
                onSelectFavorite={(vn) => handleSaveCandidate(vn)}
                onGenerateSimilar={handleGenerateSimilar}
              />
            )}

            {currentTab === 'saved' && (
              <SavedProjectsView
                onOpenProject={handleOpenSavedProject}
                onNewProject={() => handleStartNewProject()}
              />
            )}

            {currentTab === 'report' && (
              reportCandidate ? (
                <ValidationReportView
                  validatedName={reportCandidate}
                  onBack={() => setCurrentTab('results')}
                />
              ) : (
                <div className="p-12 text-center bg-zinc-900/60 border border-zinc-800 rounded-3xl space-y-4 max-w-xl mx-auto my-12">
                  <h3 className="text-lg font-bold text-white">No Brand Certificate Selected</h3>
                  <p className="text-xs text-zinc-400">Select a validated name from your results dashboard to view or export its clearance certificate.</p>
                  <button
                    onClick={() => setCurrentTab('results')}
                    className="px-6 py-3 rounded-xl bg-zinc-100 text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-white"
                  >
                    Back to Results
                  </button>
                </div>
              )
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
