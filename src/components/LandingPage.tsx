import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LegalModal } from './LegalModals';
import { 
  ShieldCheck, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Database, 
  Cpu, 
  Layers, 
  User as UserIcon,
  X,
  Lock,
  Globe,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Scale,
  Award,
  ExternalLink,
  HelpCircle,
  Building2,
  Github,
  Star,
  Code,
  AlertTriangle,
  Key
} from 'lucide-react';

interface LandingPageProps {
  onStartNewProject: (preset?: any) => void;
  onSeeMethodology: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartNewProject, onSeeMethodology }) => {
  const { user, loginWithGoogle } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingPreset, setPendingPreset] = useState<any>(null);
  const [signingIn, setSigningIn] = useState(false);

  // Legal Modal States
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms'>('privacy');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const openLegal = (tab: 'privacy' | 'terms') => {
    setLegalTab(tab);
    setShowLegalModal(true);
  };

  const handleAction = async (preset?: any) => {
    if (!user) {
      setPendingPreset(preset || null);
      setShowAuthModal(true);
      return;
    }
    onStartNewProject(preset);
  };

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    const u = await loginWithGoogle();
    setSigningIn(false);
    if (u) {
      setShowAuthModal(false);
      onStartNewProject(pendingPreset);
    }
  };

  const FAQS = [
    {
      q: "What problem does Find Names for My Brand solve for founders and business owners?",
      a: "99% of AI name generators hallucinate brand names that are already registered trademarks or active websites. Business owners waste dozens of hours Googling AI suggestions only to hit dead ends. Naming agencies charge $10,000+. Find Names for My Brand solves this by verifying real-time web search collisions and domain availability before presenting candidate names."
    },
    {
      q: "Is Find Names for My Brand 100% free and open-source?",
      a: "Yes! Find Names for My Brand is completely open-source under the MIT license. There are no paywalls, hidden tiers, or commercial subscriptions. You can use it freely or self-host it yourself."
    },
    {
      q: "How do API keys work? Can I use my own Gemini key?",
      a: "Yes. Find Names for My Brand supports Bring Your Own Key (BYOK). You can generate a 100% free Gemini API key from Google AI Studio (aistudio.google.com) in 30 seconds and paste it into Find Names for My Brand. Your key stays stored locally in your browser."
    },
    {
      q: "How does Find Names for My Brand verify that a brand name is unclaimed?",
      a: "Find Names for My Brand executes automated exact-match search queries across live web indexes (Brave Search / Google Grounding) and domain registries. If a name has exact active results or registered domains, our pipeline flags a collision and discards it."
    },
    {
      q: "Does Find Names for My Brand guarantee official trademark legal clearance?",
      a: "Find Names for My Brand guarantees live internet search and domain availability verification. For official trademark filings, we provide direct links to official IP offices (USPTO, WIPO, IP India) so you can execute official legal registry searches."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-zinc-800 selection:text-white flex flex-col font-sans">
      
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-950 font-black flex items-center justify-center text-sm shadow-sm">
              F
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base sm:text-lg tracking-tight leading-none">Find Names for My Brand</span>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase mt-0.5">Open Source Brand Safety Engine</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-400">
            <a href="#problem" className="hover:text-white transition-colors">The Problem</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#comparison" className="hover:text-white transition-colors">Comparison</a>
            <a href="#faqs" className="hover:text-white transition-colors">FAQs</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/JSNrepo/ZeroName"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-400/80 text-zinc-200 hover:text-white text-xs font-bold transition-all shadow-sm"
            >
              <Github className="w-4 h-4 text-white" />
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="hidden sm:inline">Star on GitHub</span>
            </a>

            {user ? (
              <button
                onClick={() => handleAction()}
                className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-950 font-extrabold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-sm flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
                <span>Launch App</span>
              </button>
            ) : (
              <button
                id="btn-landing-top-signin"
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 mb-8 font-medium shadow-sm">
          <Code className="w-4 h-4 text-emerald-400" />
          <span>100% Free & Open Source • Zero Taken Names Guarantee</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          Brand names verified available <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-300 to-emerald-400">
            before you ever see them.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
          Ordinary AI generators output taken names. Find Names for My Brand generates original brand names, verifies live web collisions across search engines and domain registries, and presents only available candidates.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            id="hero-cta-primary"
            onClick={() => handleAction()}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-100 text-zinc-950 font-extrabold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-xl flex items-center justify-center gap-2.5 min-h-[50px]"
          >
            <Sparkles className="w-4 h-4 text-zinc-950" />
            <span>Create Brand Brief Now</span>
          </button>

          <a
            href="https://github.com/JSNrepo/ZeroName"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-zinc-700/80 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 font-bold text-xs transition-all flex items-center justify-center gap-2 min-h-[50px] shadow-sm"
          >
            <Github className="w-4 h-4 text-white" />
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Star on GitHub</span>
          </a>
        </div>

        {/* Live Interactive Sample Showcase Card */}
        <div className="mt-16 max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-md shadow-2xl text-left space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">Live Real-Time Verification Pipeline</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              0 Collision Guard Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sample Candidate 1 */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-lg text-white">Vespera</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                  100% Passed
                </span>
              </div>
              <p className="text-xs text-zinc-400">Evokes twilight clarity and modern tech precision.</p>
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-zinc-900 text-zinc-500">
                <span className="text-emerald-400 font-mono">0 Exact Search Matches</span>
                <span className="text-zinc-300 font-mono">vespera.co Available</span>
              </div>
            </div>

            {/* Sample Candidate 2 */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-lg text-white">Lunaris</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                  100% Passed
                </span>
              </div>
              <p className="text-xs text-zinc-400">Seamless vocal cadence for premium fintech & SaaS.</p>
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-zinc-900 text-zinc-500">
                <span className="text-emerald-400 font-mono">0 Exact Search Matches</span>
                <span className="text-zinc-300 font-mono">lunaris.io Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-20 bg-zinc-900/40 border-y border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>The Naming Dilemma</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Why standard naming AI fails founders</h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Naming a company is hard. Standard tools make it harder by handing you list after list of taken, trademarked, or occupied domain names.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-base font-bold text-white">The Hallucination Trap</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Generative AI models output words based on training text. That means most "cool AI suggestions" are actually existing brands, trademarked products, or parked domains.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-base font-bold text-white">Hours of Manual Googling</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Founders spend days typing every single candidate into Google, Namecheap, and trademark databases only to realize every good option is occupied.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/70 border border-emerald-500/30 space-y-4 bg-emerald-950/10">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-base font-bold text-white">Automated Collision Clearance</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Find Names for My Brand runs real-time web searches and domain queries in the background. If a candidate name has exact search results, it is discarded before you ever see it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
            3-Step Verification Protocol
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How Find Names for My Brand delivers unclaimed brand names</h2>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Unlike standard AI chatbots that generate unchecked strings from training data, Find Names for My Brand runs a strict 3-stage validation pipeline before presenting candidates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-4 relative">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-white font-extrabold flex items-center justify-center text-sm border border-zinc-700">
              1
            </div>
            <h3 className="text-base font-bold text-white">Brand Brief & Connotations</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Define your business sector, target audience, brand personality traits, syllable caps, and specific meanings or terms to emphasize or avoid.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-4 relative">
            <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-white font-extrabold flex items-center justify-center text-sm border border-zinc-700">
              2
            </div>
            <h3 className="text-base font-bold text-white">Dual Engine Brainstorming</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Google Gemini AI produces domain-tailored name candidates while our local phonetic engine validates vocal cadence, syllable balance, and pronunciation scores.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-zinc-900/50 border border-emerald-500/30 space-y-4 relative bg-emerald-950/10">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-sm border border-emerald-500/30">
              3
            </div>
            <h3 className="text-base font-bold text-white">Live Search & Domain Clearance</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Automated queries scan web indexes and top domain registries in real-time. Colliding names are rejected; only 100% available candidates make the cut.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparison" className="py-20 bg-zinc-900/30 border-y border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold text-white">Find Names for My Brand vs. Alternatives</h2>
            <p className="text-xs text-zinc-400">See why founders and agency strategists choose Find Names for My Brand for brand naming.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Traditional AI Chatbots</h3>
              <p className="text-2xl font-extrabold text-zinc-300">Free / $20/mo</p>
              <ul className="space-y-3 text-xs text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">×</span>
                  <span>Lists taken names and existing companies.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">×</span>
                  <span>Forces manual Googling for every suggestion.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">×</span>
                  <span>No domain availability verification.</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Naming Agencies</h3>
              <p className="text-2xl font-extrabold text-zinc-300">$5,000 - $25,000</p>
              <ul className="space-y-3 text-xs text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Thorough naming research.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">×</span>
                  <span>Takes 4 to 8 weeks for deliverables.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">×</span>
                  <span>Exorbitant cost for early-stage startups.</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-zinc-900 border border-emerald-500/40 space-y-4 shadow-xl relative bg-emerald-950/10">
              <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 uppercase">
                100% Free
              </div>
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Find Names for My Brand</h3>
              <p className="text-2xl font-extrabold text-white">$0 <span className="text-xs text-zinc-400 font-normal">Free Forever</span></p>
              <ul className="space-y-3 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Real-time web search collision checks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Domain registry availability scanner.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Downloadable PDF Clearance Certificates.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Instant results in under 60 seconds.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faqs" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-zinc-400">Everything you need to know about Find Names for My Brand and open source usage.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-emerald-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 bg-zinc-900/60 border-t border-zinc-800 text-center px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-extrabold text-white">Ready to find your unclaimed brand name?</h2>
          <p className="text-xs text-zinc-400">Launch a brand brief in seconds with automated real-time web verification.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="cta-landing-bottom"
              onClick={() => handleAction()}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-100 text-zinc-950 font-extrabold text-xs uppercase tracking-wider hover:bg-white transition-all inline-flex items-center justify-center gap-2 shadow-xl min-h-[50px]"
            >
              <Sparkles className="w-4 h-4 text-zinc-950" />
              <span>Start Your First Brand Brief</span>
            </button>

            <a
              href="https://github.com/JSNrepo/ZeroName"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-900 border border-zinc-700/80 text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 transition-all inline-flex items-center justify-center gap-2 shadow-sm min-h-[50px]"
            >
              <Github className="w-4 h-4 text-white" />
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Star on GitHub</span>
            </a>
          </div>
        </div>
      </section>

      {/* Comprehensive Legal & Publishable Footer */}
      <footer className="mt-auto bg-black border-t border-zinc-900 py-12 px-4 sm:px-6 lg:px-8 text-xs text-zinc-400 space-y-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-zinc-100 text-zinc-950 font-black flex items-center justify-center text-xs">
                F
              </div>
              <span className="font-extrabold text-white text-base">Find Names for My Brand</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Real-time brand safety & web collision verification protocol. Guaranteeing unclaimed brand names before you register.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Product & Open Source</h4>
            <ul className="space-y-1.5 text-zinc-400">
              <li><button onClick={() => handleAction()} className="hover:text-white transition-colors">Start Brand Brief</button></li>
              <li><button onClick={onSeeMethodology} className="hover:text-white transition-colors">Validation Protocol</button></li>
              <li>
                <a href="https://github.com/JSNrepo/ZeroName" target="_blank" rel="noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Legal & Compliance</h4>
            <ul className="space-y-1.5 text-zinc-400">
              <li>
                <button onClick={() => openLegal('privacy')} className="hover:text-white transition-colors">
                  Privacy Policy (GDPR / CCPA)
                </button>
              </li>
              <li>
                <button onClick={() => openLegal('terms')} className="hover:text-white transition-colors">
                  Terms of Service & Disclaimer
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Official Trademark Registers</h4>
            <ul className="space-y-1.5 text-zinc-400">
              <li>
                <a href="https://tmsearch.uspto.gov" target="_blank" rel="noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  <span>USPTO Search (USA)</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>
              </li>
              <li>
                <a href="https://ipindiaservices.gov.in/tmrpublicsearch/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  <span>IP India Public Search</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>
              </li>
              <li>
                <a href="https://branddb.wipo.int/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  <span>WIPO Global Brand Database</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} Find Names for My Brand Open Source Protocol. Released under MIT License.</p>
          <p className="text-zinc-600">
            Find Names for My Brand is a live verification tool. Automated checks do not constitute legal counsel or trademark registration.
          </p>
        </div>
      </footer>

      {/* Mandatory Sign In Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-zinc-100">
            
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-950 font-black flex items-center justify-center text-xl mx-auto shadow-sm">
                F
              </div>
              <h3 className="text-xl font-bold text-white">Sign In to Find Names for My Brand</h3>
              <p className="text-xs text-zinc-400">
                Sign in securely with Google to run live web collision checks and save your brand shortlists.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                id="btn-signin-google"
                onClick={handleGoogleSignIn}
                disabled={signingIn}
                className="w-full py-3 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2.5 min-h-[44px]"
              >
                <UserIcon className="w-4 h-4" />
                <span>{signingIn ? "Signing In..." : "Continue with Google"}</span>
              </button>
            </div>

            <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
              By continuing, you agree to our{' '}
              <button onClick={() => openLegal('terms')} className="underline text-zinc-400 hover:text-white">Terms of Service</button>
              {' '}and{' '}
              <button onClick={() => openLegal('privacy')} className="underline text-zinc-400 hover:text-white">Privacy Policy</button>.
            </p>

          </div>
        </div>
      )}

      {/* Legal Modals (Privacy & Terms) */}
      <LegalModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        defaultTab={legalTab}
      />

    </div>
  );
};
