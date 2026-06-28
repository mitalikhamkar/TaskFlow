import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Activity, ShieldCheck, Mail, Lock, ArrowRight, User } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please provide a valid corporate email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error || 'Invalid email or credentials.');
      }
    } catch (err: any) {
      setError('An error occurred during sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-transparent text-slate-100 flex items-center justify-center p-6 relative font-sans overflow-hidden">
      {/* Absolute decorative gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#818CF8]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl shadow-indigo-500/5">
            <Activity className="w-6 h-6 text-[#818CF8]" />
          </div>
          <div className="space-y-1">
            <h1 className="font-display font-bold text-3xl text-white tracking-tight">Welcome to TaskFlow</h1>
            <p className="text-sm text-slate-400">Collaborative task intelligence for high-performing teams</p>
          </div>
        </div>

        {/* Card Component */}
        <div id="login-card" className="glass-card p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#818CF8] bg-[#818CF8]/10 py-2 px-3 border border-[#818CF8]/10 rounded-xl">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#818CF8]" />
            <span>Developer Sandbox: Live MongoDB Atlas persistence active</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-semibold text-slate-400">Work Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-semibold text-slate-400">Security Password</label>
                <a href="#reset" className="text-2xs text-[#818CF8] hover:text-[#818CF8]/80 font-semibold">Forgot Password?</a>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-500 font-semibold mt-2">{error}</p>
            )}

            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 px-4 bg-[#818CF8] hover:bg-[#818CF8]/90 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>{loading ? 'Accessing Workspace...' : 'Access Workspace'}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </form>
        </div>

        {/* Footer Redirect link */}
        <p className="text-center text-xs text-slate-500">
          Don't have an enterprise account yet?{' '}
          <Link id="link-to-register" to="/register" className="text-[#818CF8] hover:text-[#818CF8]/80 font-semibold">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};
