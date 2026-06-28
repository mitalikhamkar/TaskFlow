import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Activity, Mail, Lock, User, ArrowRight, ShieldAlert } from 'lucide-react';

export const Register: React.FC = () => {
  const { register, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirection guard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Frontend validations
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all requested fields.');
      return;
    }

    if (name.trim().length < 3) {
      setError('Full Name must be at least 3 characters.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email format.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, password, confirmPassword);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="register-container" className="min-h-screen bg-transparent text-slate-100 flex items-center justify-center p-6 relative font-sans overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#818CF8]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl shadow-indigo-500/5">
            <Activity className="w-6 h-6 text-[#818CF8]" />
          </div>
          <div className="space-y-1">
            <h1 className="font-display font-bold text-3xl text-white tracking-tight">Create Workspace</h1>
            <p className="text-sm text-slate-400">Initialize your cloud collaborative task managers today</p>
          </div>
        </div>

        {/* Card */}
        <div id="register-card" className="glass-card p-8 rounded-3xl shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="reg-name" className="text-xs font-semibold text-slate-400">Full Name</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., Alex Carter"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="text-xs font-semibold text-slate-400">Corporate Email</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.carter@company.com"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="text-xs font-semibold text-slate-400">Security Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  id="reg-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 chars, 1 upper, 1 lower, 1 num"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="reg-confirm-password" className="text-xs font-semibold text-slate-400">Confirm Security Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  id="reg-confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter security password"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-rose-500 font-semibold bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 mt-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              id="btn-register-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 px-4 bg-[#818CF8] hover:bg-[#818CF8]/90 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>{loading ? 'Initializing Workspace...' : 'Initialize Workspace'}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </form>
        </div>

        {/* Redirect */}
        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link id="link-to-login" to="/login" className="text-[#818CF8] hover:text-[#818CF8]/80 font-semibold">
            Sign In Instead
          </Link>
        </p>
      </div>
    </div>
  );
};
