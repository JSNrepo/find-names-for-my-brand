import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  return (
    <footer className="bg-black border-t border-zinc-900 text-zinc-400 py-10 px-4 sm:px-6 lg:px-8 text-xs">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Core Disclaimer Box */}
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-zinc-200">
                Core Integrity Standard: Never Show An Unchecked Name
              </p>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                Clearance status: <span className="text-emerald-400 font-medium">No detected exact-match collision across checked sources.</span>
              </p>
            </div>
          </div>
          <div className="text-zinc-400 text-left md:text-right text-[11px] leading-normal border-t md:border-t-0 border-zinc-800 pt-3 md:pt-0">
            <p className="font-medium text-amber-300/90">
              This is not a trademark clearance. Complete a trademark search before commercial registration.
            </p>
          </div>
        </div>

        {/* Links & Attribution */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-900 text-zinc-400 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <div className="w-5 h-5 rounded bg-white text-black font-bold flex items-center justify-center text-xs">F</div>
            <span className="font-semibold text-zinc-300">Find Names for My Brand</span>
            <span className="text-zinc-500">•</span>
            <span>&copy; {new Date().getFullYear()} Open Source Protocol</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs">
            <button
              id="footer-methodology"
              onClick={() => setCurrentTab('methodology')}
              className="hover:text-white transition-colors p-1"
            >
              Validation Methodology
            </button>
            <button
              id="footer-account"
              onClick={() => setCurrentTab('account')}
              className="hover:text-white transition-colors p-1"
            >
              Plans & Entitlements
            </button>
            <a
              href="https://ipindiaservices.gov.in/tmrpublicsearch/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1 p-1"
            >
              <span>IP India Search</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
