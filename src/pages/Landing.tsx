import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Activity, ArrowRight, ShieldCheck, Layers, Users, Sparkles } from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useApp();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col justify-between p-6 relative font-sans overflow-hidden">
      {/* Background elegant shader mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] rounded-full bg-[#818CF8]/5 blur-[140px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#6366F1]/5 blur-[140px]" />
      </div>

      {/* Top Header Navigation bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg shadow-indigo-500/5">
            <Activity className="w-5 h-5 text-[#818CF8]" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white leading-tight">TaskFlow</h1>
            <span className="text-2xs text-slate-500 font-mono tracking-wider uppercase">Enterprise Suite</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="py-2 px-5 border border-white/10 hover:border-white/20 hover:bg-white/5 bg-transparent text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
        >
          Sign In
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-4xl mx-auto w-full my-auto py-12 flex flex-col items-center text-center space-y-8">
        {/* Sandbox Notice Banner */}
        <div className="flex items-center gap-2 text-2xs font-bold text-[#818CF8] bg-[#818CF8]/10 py-1.5 px-3 border border-[#818CF8]/10 rounded-full animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TaskFlow Enterprise Workspace Sandbox v2.4</span>
        </div>

        {/* Hero Copywriting */}
        <div className="space-y-4">
          <h2 className="font-display font-bold text-4xl sm:text-6xl text-white tracking-tight max-w-3xl leading-[1.1] mx-auto">
            Collaborative task intelligence for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#818CF8] via-[#a5b4fc] to-[#6366F1]">
              high-performing squads
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Unify your engineers, product managers, and visual designers under a premium dark obsidian workspace. 
            Track milestones, balance sprint bandwidth, and ship complex software pipelines seamlessly.
          </p>
        </div>

        {/* Primary Call-to-Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md pt-4">
          <button
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto py-3 px-8 bg-[#818CF8] hover:bg-[#818CF8]/90 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/10 cursor-pointer active:scale-95 transition-all"
          >
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
          
          <button
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto py-3 px-8 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <span>Sign In to Workspace</span>
          </button>
        </div>

        {/* Conceptual Feature Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-12 text-left">
          <div className="glass-card p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-[#818CF8]" />
            </div>
            <h3 className="font-display font-bold text-base text-white">Dynamic Boards</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Toggle between highly structured boards or comprehensive tabular lists. Filter instantly by categories, priorities, and custom tags.
            </p>
          </div>

          <div className="glass-card p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#818CF8]" />
            </div>
            <h3 className="font-display font-bold text-base text-white">Teammate Bandwidth</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track active workloads and individual task logs. Align roles and dispatch tasks perfectly matched to squad availability.
            </p>
          </div>

          <div className="glass-card p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#818CF8]" />
            </div>
            <h3 className="font-display font-bold text-base text-white">Secure Sandbox</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enjoy local state replication with full browser persistence, auto-recalculating metrics, and a localized real-time clock.
            </p>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full text-center py-4 border-t border-white/5 mt-12">
        <p className="text-2xs text-slate-500 font-mono">
          TaskFlow © {new Date().getFullYear()} Enterprise Systems Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
