import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, FolderKanban, Settings, HelpCircle, User as UserIcon, LogOut, Sparkles, ArrowUpDown, Menu, X, Lightbulb, Github, Star } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onNewProject: () => void;
  onOpenTour?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab, onNewProject, onOpenTour }) => {
  const { user, loginWithGoogle, signOut, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabSelect = (tab: string) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  const handleNewProjectClick = () => {
    onNewProject();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            id="logo-button"
            onClick={() => handleTabSelect('landing')}
            className="flex items-center gap-2 text-base sm:text-lg font-bold tracking-tight hover:opacity-90 transition-opacity shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-950 flex items-center justify-center font-black text-base shadow-sm">
              0
            </div>
            <span>Zero<span className="text-zinc-400 font-normal">Name</span></span>
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full font-medium">
              Collision Guarded
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-zinc-400">
            <button
              id="nav-new-project"
              onClick={handleNewProjectClick}
              className={`px-3 py-1.5 rounded-lg transition-all ${currentTab === 'new-project' ? 'bg-zinc-800 text-white font-bold' : 'hover:text-white hover:bg-zinc-900'}`}
            >
              New Project
            </button>
            <button
              id="nav-saved-projects"
              onClick={() => handleTabSelect('saved')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${currentTab === 'saved' ? 'bg-zinc-800 text-white font-bold' : 'hover:text-white hover:bg-zinc-900'}`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              Saved
            </button>
            <button
              id="nav-compare"
              onClick={() => handleTabSelect('compare')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${currentTab === 'compare' ? 'bg-zinc-800 text-white font-bold' : 'hover:text-white hover:bg-zinc-900'}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
              Compare
            </button>
            <button
              id="nav-methodology"
              onClick={() => handleTabSelect('methodology')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${currentTab === 'methodology' ? 'bg-zinc-800 text-white font-bold' : 'hover:text-white hover:bg-zinc-900'}`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Methodology
            </button>
            {onOpenTour && (
              <button
                id="nav-quick-tour"
                onClick={onOpenTour}
                className="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-amber-300 hover:text-amber-200 hover:bg-zinc-900"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Tour</span>
              </button>
            )}
            {isAdmin && (
              <button
                id="nav-admin"
                onClick={() => handleTabSelect('admin')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${currentTab === 'admin' ? 'bg-zinc-800 text-white font-bold' : 'hover:text-white hover:bg-zinc-900'}`}
              >
                <Settings className="w-3.5 h-3.5" />
                Admin
              </button>
            )}
          </nav>
        </div>

        {/* Action Buttons & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            id="btn-github-star"
            href="https://github.com/JSNrepo/ZeroName"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 bg-zinc-900 border border-zinc-700/80 hover:border-amber-400/80 text-zinc-100 hover:text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm shrink-0"
          >
            <Github className="w-4 h-4 text-white" />
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Star on GitHub</span>
          </a>

          <button
            id="cta-find-name"
            onClick={handleNewProjectClick}
            className="hidden sm:flex items-center gap-2 bg-zinc-100 text-zinc-950 hover:bg-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-sm shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
            <span>Find Unclaimed Name</span>
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <button
                id="nav-account"
                onClick={() => handleTabSelect('account')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 hover:border-zinc-700 transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span className="max-w-[100px] truncate">{user.displayName || user.email || 'Account'}</span>
              </button>
              <button
                id="btn-logout"
                onClick={signOut}
                title="Sign out"
                className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                id="btn-google-login"
                onClick={loginWithGoogle}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
              >
                Sign In with Google
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            id="btn-mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-800 px-4 py-4 space-y-3 shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={handleNewProjectClick}
              className={`p-3 rounded-xl flex items-center gap-2 border text-left min-h-[44px] ${currentTab === 'new-project' ? 'bg-zinc-800 border-zinc-700 text-white font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-300'}`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>New Project</span>
            </button>
            <button
              onClick={() => handleTabSelect('saved')}
              className={`p-3 rounded-xl flex items-center gap-2 border text-left min-h-[44px] ${currentTab === 'saved' ? 'bg-zinc-800 border-zinc-700 text-white font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-300'}`}
            >
              <FolderKanban className="w-4 h-4 text-sky-400" />
              <span>Saved</span>
            </button>
            <button
              onClick={() => handleTabSelect('compare')}
              className={`p-3 rounded-xl flex items-center gap-2 border text-left min-h-[44px] ${currentTab === 'compare' ? 'bg-zinc-800 border-zinc-700 text-white font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-300'}`}
            >
              <ArrowUpDown className="w-4 h-4 text-emerald-400" />
              <span>Compare</span>
            </button>
            <button
              onClick={() => handleTabSelect('methodology')}
              className={`p-3 rounded-xl flex items-center gap-2 border text-left min-h-[44px] ${currentTab === 'methodology' ? 'bg-zinc-800 border-zinc-700 text-white font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-300'}`}
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Methodology</span>
            </button>
            {onOpenTour && (
              <button
                onClick={() => { onOpenTour(); setMobileMenuOpen(false); }}
                className="p-3 rounded-xl flex items-center gap-2 border text-left min-h-[44px] bg-amber-500/10 border-amber-500/20 text-amber-300 col-span-2"
              >
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Quick Tour Guide</span>
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => handleTabSelect('admin')}
                className={`p-3 rounded-xl flex items-center gap-2 border text-left min-h-[44px] col-span-2 ${currentTab === 'admin' ? 'bg-zinc-800 border-zinc-700 text-white font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-300'}`}
              >
                <Settings className="w-4 h-4 text-purple-400" />
                <span>Admin Dashboard</span>
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <button
                  onClick={() => handleTabSelect('account')}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 min-h-[44px]"
                >
                  <UserIcon className="w-4 h-4 text-zinc-400" />
                  <span className="font-medium truncate max-w-[160px]">{user.displayName || user.email || 'Account'}</span>
                </button>
                <button
                  onClick={() => { signOut(); setMobileMenuOpen(false); }}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={() => { loginWithGoogle(); setMobileMenuOpen(false); }}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold transition-colors min-h-[44px]"
                >
                  Sign In with Google
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
