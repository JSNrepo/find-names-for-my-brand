import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, CheckCircle2, Scale } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'terms';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, defaultTab = 'privacy' }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-zinc-100">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-800 text-emerald-400 border border-zinc-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Legal & Data Governance</h2>
              <p className="text-xs text-zinc-400">Find Names for My Brand Safety & Privacy Standards</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800/80 bg-zinc-900/30 px-6 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'privacy' 
                ? 'border-emerald-400 text-emerald-400' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Privacy Policy (GDPR / CCPA)</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'terms' 
                ? 'border-emerald-400 text-emerald-400' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Terms of Service & Trademark Disclaimer</span>
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs leading-relaxed text-zinc-300">
          {activeTab === 'privacy' ? (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-400 text-sm">Privacy Guarantee</h4>
                  <p className="text-zinc-300 mt-1">
                    Find Names for My Brand strictly respects user confidentiality. Your brand briefs, generated name candidates, and saved project shortlists are 100% private to your account.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm mb-2">1. Information We Collect</h3>
                <p>
                  We collect minimal necessary data required to operate the service:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-zinc-400">
                  <li><strong className="text-zinc-200">Account Credentials:</strong> Name and email address obtained via Google OAuth for user authentication and authorization.</li>
                  <li><strong className="text-zinc-200">Project Briefs & Shortlists:</strong> Industry parameters, desired connotations, and saved candidate names stored securely in Firebase Firestore.</li>
                  <li><strong className="text-zinc-200">Usage Analytics & Device Security:</strong> Device fingerprint hashes used exclusively to prevent abuse and enforce single-session concurrency rules.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm mb-2">2. How We Use Your Data</h3>
                <p className="text-zinc-400">
                  We use collected data solely to execute brand generation algorithms, perform real-time search verification, deliver clearance PDF certificates, and manage project histories. We <strong className="text-white">NEVER sell, rent, or trade</strong> your personal data or generated brand names to third parties or advertising brokers.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm mb-2">3. Third-Party Search Providers & AI Engines</h3>
                <p className="text-zinc-400">
                  Candidate brand name generation uses Google Gemini AI models via secure server-side API proxy routes. Real-time web collision verification executes queries against live web search providers (Brave Search, Google Grounding). Candidate strings sent to search APIs contain zero personal identifiable information (PII).
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm mb-2">4. User Rights & Data Deletion (GDPR / CCPA)</h3>
                <p className="text-zinc-400">
                  You retain full ownership of your data. You may delete individual projects, candidates, or request complete account erasure at any time via the Project Settings or by contacting our data protection officer.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Scale className="w-5 h-5 text-amber-400" />
                  <span>Important Trademark & Legal Disclaimer</span>
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  Find Names for My Brand performs automated live searches across public search indexes and top-level domain registries. <strong className="text-amber-200">These automated checks do NOT constitute formal legal trademark advice or government clearance guarantees.</strong>
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm mb-2">1. Terms of Agreement</h3>
                <p className="text-zinc-400">
                  By accessing Find Names for My Brand, you agree to these Terms of Service. If you do not agree to all terms, you may not access or use the application.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm mb-2">2. Intellectual Property Rights</h3>
                <p className="text-zinc-400">
                  All candidate brand names generated during your active session belong exclusively to you upon generation. Find Names for My Brand claims no ownership, copyright, or royalty rights over names generated for your project brief.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm mb-2">3. Trademark Verification Responsibility</h3>
                <p className="text-zinc-400">
                  While Find Names for My Brand uses multi-source live search pipelines to verify that candidates have 0 exact-match internet collisions at the time of generation, trademark availability can change rapidly. <strong className="text-white">You must conduct official government trademark searches (e.g., USPTO in the USA, WIPO, or IP India) or consult a qualified trademark attorney before registering business entities, purchasing domain names, or launching commercial operations.</strong>
                </p>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm mb-2">4. Limitation of Liability</h3>
                <p className="text-zinc-400">
                  Find Names for My Brand and its officers shall not be held liable for any trademark infringement claims, domain purchase disputes, business rebranding expenses, or damages resulting from the use of generated names.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            Last Updated: July 2026 • Compliant with global privacy standards
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-100 text-zinc-950 font-extrabold text-xs uppercase hover:bg-white transition-all shadow-sm"
          >
            I Understand & Agree
          </button>
        </div>

      </div>
    </div>
  );
};

export const CookieBanner: React.FC = () => {
  const [accepted, setAccepted] = useState(() => {
    return localStorage.getItem('zn_cookie_consent') === 'true';
  });

  if (accepted) return null;

  const handleAccept = () => {
    localStorage.setItem('zn_cookie_consent', 'true');
    setAccepted(true);
  };

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-40 p-4 rounded-2xl bg-zinc-900/95 border border-zinc-800 backdrop-blur-md shadow-2xl text-xs space-y-3 text-zinc-200">
      <div className="flex items-start gap-3">
        <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white">Privacy & Cookie Consent</p>
          <p className="text-zinc-400 text-[11px] leading-normal">
            Find Names for My Brand uses essential session cookies and local storage to secure user authentication and project shortlists. Zero third-party tracking or data selling.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-800">
        <button
          onClick={handleAccept}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-[11px] uppercase transition-colors"
        >
          Accept Essential Cookies
        </button>
      </div>
    </div>
  );
};
