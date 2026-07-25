import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  HelpCircle, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Compass, 
  Layout, 
  MessageSquare, 
  Award,
  Lightbulb
} from 'lucide-react';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  onNavigateTab: (tab: string) => void;
  onStartNewProject: (preset?: any) => void;
}

interface TourStep {
  id: number;
  title: string;
  badge: string;
  icon: React.ElementType;
  description: string;
  keyPoints: { icon: React.ElementType; text: string }[];
  actionLabel?: string;
  actionTab?: string;
  tipText: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: "Welcome to Find Names for My Brand",
    badge: "1-Minute Quick Guide",
    icon: Compass,
    description: "Finding a brand name shouldn't mean taking a name someone else already owns. Find Names for My Brand searches the live web to guarantee 100% unclaimed brand names for any business or project.",
    keyPoints: [
      { icon: ShieldCheck, text: "Zero exact-match internet collisions guaranteed" },
      { icon: Sparkles, text: "Works for any business, store, app, or service" },
      { icon: Award, text: "Includes downloadable Brand Clearance Certificates" }
    ],
    actionLabel: "How to Create a Brief →",
    tipText: "No technical jargon or legal experience required! Everything is explained in plain English."
  },
  {
    id: 2,
    title: "1-Click Industry Templates",
    badge: "Zero Setup Required",
    icon: Zap,
    description: "Don't know how long or short your brand name should be? Simply pick your industry—such as Coffee, Education, Fashion, Fintech, or Tech—and Find Names for My Brand auto-configures the ideal spelling and character length.",
    keyPoints: [
      { icon: Layout, text: "Pre-configured rules for 12+ diverse business domains" },
      { icon: Sparkles, text: "Auto-excludes overused industry buzzwords" },
      { icon: CheckCircle2, text: "Ensures clear global pronunciation" }
    ],
    actionLabel: "Explore Presets Brief →",
    actionTab: "new-project",
    tipText: "You can load a template with 1 click or customize any rule to your exact taste."
  },
  {
    id: 3,
    title: "Describe Your Vibe in Plain Words",
    badge: "Plain English Input",
    icon: MessageSquare,
    description: "Simply type what your business does and select how you want your customers to feel (like 'Friendly', 'Trustworthy', or 'Modern'). If you get stuck, our built-in AI Assistant can help you fill out the brief!",
    keyPoints: [
      { icon: MessageSquare, text: "Describe your product in simple everyday sentences" },
      { icon: Sparkles, text: "Pick brand emotions with easy 1-click tags" },
      { icon: HelpCircle, text: "Built-in AI Assistant guides you whenever needed" }
    ],
    actionLabel: "Try Brief Assistant →",
    actionTab: "new-project",
    tipText: "No complex terminology needed! Just describe what you sell like you are explaining it to a friend."
  },
  {
    id: 4,
    title: "Live Internet Safety Checks",
    badge: "Instant Verification",
    icon: ShieldCheck,
    description: "Find Names for My Brand searches Google search index, mobile app stores, company directories, and web domain (.com) availability in real-time. Every passing candidate is 100% collision-free.",
    keyPoints: [
      { icon: ShieldCheck, text: "Live real-time web verification progress" },
      { icon: Layout, text: "Compare favorite candidates side-by-side" },
      { icon: Award, text: "Export official PDF Brand Clearance Reports" }
    ],
    actionLabel: "Start My First Brief Now!",
    actionTab: "new-project",
    tipText: "Ready to find your unclaimed brand name? Click below to begin your first search!"
  }
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  currentTab,
  onNavigateTab,
  onStartNewProject
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleClose = () => {
    onClose();
    localStorage.setItem('zeroname_tour_seen', 'true');
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
      onStartNewProject();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepAction = (step: TourStep) => {
    if (step.actionTab) {
      onNavigateTab(step.actionTab);
    }
    if (step.id === TOUR_STEPS.length) {
      handleClose();
      onStartNewProject();
    } else {
      handleNext();
    }
  };

  const step = TOUR_STEPS[currentStep];
  const StepIcon = step.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden relative text-zinc-100"
          >
              
              {/* Header Bar */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-zinc-950 border-b border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                      {step.badge}
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-white">
                      {step.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-xs font-mono font-bold text-zinc-400 mr-2">
                    {step.id} / {TOUR_STEPS.length}
                  </span>
                  <button
                    id="btn-close-tour"
                    onClick={handleClose}
                    className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    title="Skip tour"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tour Step Body */}
              <div className="p-5 sm:p-6 space-y-5">
                
                {/* Description Text */}
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                  {step.description}
                </p>

                {/* Key Benefits / Points */}
                <div className="space-y-2.5 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/80">
                  {step.keyPoints.map((pt, idx) => {
                    const PtIcon = pt.icon;
                    return (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-200">
                        <PtIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="font-medium">{pt.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Friendly Tip Box */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <strong>Tip:</strong> {step.tipText}
                  </p>
                </div>

                {/* Progress Dots */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  {TOUR_STEPS.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => setCurrentStep(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentStep 
                          ? 'w-7 bg-emerald-400' 
                          : 'w-2 bg-zinc-800 hover:bg-zinc-700'
                      }`}
                      aria-label={`Go to step ${s.id}`}
                    />
                  ))}
                </div>
              </div>

              {/* Tour Footer Actions */}
              <div className="p-4 sm:p-5 bg-zinc-900/80 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={`px-3.5 py-2 rounded-xl border border-zinc-800 text-xs font-semibold flex items-center gap-1 transition-all min-h-[40px] ${
                    currentStep === 0 
                      ? 'opacity-30 cursor-not-allowed text-zinc-600' 
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClose}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                  >
                    Skip Tour
                  </button>

                  <button
                    id="btn-tour-next"
                    onClick={() => handleStepAction(step)}
                    className="px-5 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 hover:bg-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 min-h-[40px]"
                  >
                    <span>{step.actionLabel || (currentStep === TOUR_STEPS.length - 1 ? "Finish Guide" : "Next Step")}</span>
                    {currentStep < TOUR_STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
    </AnimatePresence>
  );
};
