import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  FolderKanban, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ShieldCheck, 
  Zap, 
  Menu, 
  X, 
  Lightbulb,
  PlusCircle,
  BarChart3,
  CreditCard,
  User as UserIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onNewProject: () => void;
  onOpenTour?: () => void;
  hasActiveResults?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onNewProject,
  onOpenTour,
  hasActiveResults
}) => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isPro = profile?.plan === 'pro';
  const runsUsed = profile?.runsUsed || 0;
  const hasCustomKey = Boolean(profile?.customGeminiKey);

  const handleNav = (tab: string) => {
    setCurrentTab(tab);
    setMobileOpen(false);
  };

  const navItems = [
    {
      id: 'new-project',
      label: 'New Brand Brief',
      icon: PlusCircle,
      badge: null,
      highlight: true
    },
    {
      id: 'saved',
      label: 'My Projects & Names',
      icon: FolderKanban,
      badge: null
    },
    ...(hasActiveResults ? [{
      id: 'results',
      label: 'Generated Names',
      icon: BarChart3,
      badge: 'Live'
    }] : []),
    {
      id: 'account',
      label: 'Settings & Account',
      icon: Settings,
      badge: hasCustomKey ? 'BYOK Active' : 'Key Needed'
    },
    {
      id: 'methodology',
      label: 'How It Works',
      icon: HelpCircle,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-950 font-extrabold flex items-center justify-center text-sm shadow-sm">
            F
          </div>
          <span className="font-extrabold text-white text-sm tracking-tight truncate">Find Names for My Brand</span>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between transition-all duration-300
        ${collapsed ? 'w-20' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Top Header / Branding */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-950 font-black flex items-center justify-center text-base shadow-sm shrink-0">
              F
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <span className="font-extrabold text-white text-xs sm:text-sm tracking-tight block leading-tight">Find Names for My Brand</span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                  <ShieldCheck className="w-3 h-3 shrink-0" />
                  <span>Verified Names</span>
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="hidden md:flex p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Expand Toggle if collapsed */}
        {collapsed && (
          <div className="p-3 border-b border-zinc-800/80 hidden md:flex justify-center">
            <button
              onClick={() => setCollapsed(false)}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Navigation Area */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all min-h-[44px] group relative
                  ${isActive 
                    ? 'bg-zinc-100 text-zinc-950 font-extrabold shadow-sm' 
                    : item.highlight 
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}
                  ${collapsed ? 'justify-center px-0' : ''}
                `}
                title={item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-zinc-950' : item.highlight ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-white'}`} />
                
                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!collapsed && item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-bold shrink-0 bg-zinc-800 text-zinc-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="my-4 border-t border-zinc-800/60" />
        </div>

        {/* User Account / Footer */}
        <div className="p-3 sm:p-4 border-t border-zinc-800/80 bg-zinc-900/40">
          
          <div className={`flex items-center justify-between gap-2 ${collapsed ? 'flex-col' : ''}`}>
            
            <div className={`flex items-center gap-2.5 overflow-hidden ${collapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <UserIcon className="w-4 h-4 text-zinc-300" />
                )}
              </div>

              {!collapsed && (
                <div className="overflow-hidden text-left">
                  <span className="text-xs font-bold text-white truncate block">
                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    hasCustomKey 
                      ? 'text-emerald-400 bg-emerald-500/10' 
                      : 'text-amber-400 bg-amber-500/10'
                  }`}>
                    {hasCustomKey ? 'BYOK ACTIVE' : 'KEY REQUIRED'}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={signOut}
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>
    </>
  );
};
