import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Scissors, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [ownerExists, setOwnerExists] = useState<boolean | null>(null);

  const from = (location.state as any)?.from?.pathname || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  // Check if owner exists (show Register link if not)
  useEffect(() => {
    authApi.checkOwnerExists().then(({ ownerExists }) => setOwnerExists(ownerExists)).catch(() => setOwnerExists(true));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left — brand / dashboard showcase panel */}
      <div 
        className="hidden lg:flex lg:w-[54%] relative overflow-hidden flex-col justify-between px-14 py-12 xl:px-20"
        style={{
          background: 'linear-gradient(180deg, #e8dcc4 0%, #d9cdb4 20%, #8a8791 45%, #3d3f56 70%, #1b1c30 100%)',
        }}
      >
        {/* Dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="pointer-events-none absolute -top-32 -left-10 w-[420px] h-[420px] rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-[380px] h-[380px] rounded-full bg-black/20 blur-3xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center backdrop-blur-sm">
            <Scissors className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-[1.05rem] tracking-tight">
            <span className="font-bold text-white">Boutique</span>
            <span className="font-medium text-white/70"> CRM</span>
          </span>
        </div>

        {/* Floating dashboard cards */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="relative w-full max-w-md h-[230px] mx-auto">
            {/* Live badge */}
            <span className="absolute -top-3 right-6 z-20 flex items-center gap-1.5 bg-white/90 text-[var(--primary-hex)] text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live
            </span>

            {/* Main revenue card */}
            <div className="absolute top-0 left-0 w-[62%] rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md p-5 shadow-2xl">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="w-2 h-2 rounded-full bg-white/30" />
                <span className="w-2 h-2 rounded-full bg-white/30" />
                <span className="h-1.5 w-16 rounded-full bg-white/25 ml-1" />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl font-bold text-white tracking-tight">₹8.4L</span>
                <span className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-300 bg-emerald-400/15 rounded-full px-2 py-0.5">
                  ▲ 18.2%
                </span>
              </div>
              <svg viewBox="0 0 200 60" className="w-full h-14" preserveAspectRatio="none">
                <polyline
                  points="0,45 30,38 60,42 90,26 120,30 150,14 180,18 200,4"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                <circle cx="200" cy="4" r="4" fill="white" />
              </svg>
            </div>

            {/* Bar chart card */}
            <div className="absolute bottom-0 left-0 w-[38%] h-[110px] rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md p-4 flex items-end gap-1.5 shadow-2xl">
              {[28, 40, 34, 52, 46, 66].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-white/70"
                  style={{ height: `${h}%`, opacity: 0.5 + i * 0.08 }}
                />
              ))}
            </div>

            {/* Circular progress card */}
            <div className="absolute bottom-[-18px] right-0 w-[46%] rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md p-4 flex items-center gap-4 shadow-2xl">
              <div
                className="relative w-16 h-16 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: 'conic-gradient(#34D399 0% 92%, rgba(255,255,255,0.15) 92% 100%)',
                }}
              >
                <div className="absolute inset-[3px] rounded-full bg-[var(--primary-hex)]" />
                <span className="relative text-white text-sm font-bold">92%</span>
              </div>
              <div className="space-y-1.5 flex-1">
                <span className="h-1.5 w-full block rounded-full bg-white/25" />
                <span className="h-1.5 w-3/4 block rounded-full bg-white/25" />
                <span className="h-1.5 w-1/2 block rounded-full bg-white/25" />
              </div>
            </div>
          </div>
        </div>

        {/* Headline block */}
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase text-white/80 bg-white/10 border border-white/15 rounded-full px-3 py-1 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            One Platform · Every Boutique
          </span>
          <h1 className="font-serif text-4xl xl:text-[2.75rem] leading-[1.15] font-semibold text-white max-w-md">
            Run your whole boutique in one place.
          </h1>
          <p className="text-white/60 text-sm mt-4 max-w-sm leading-relaxed">
            Sales, fittings, orders and clients — unified on a single platform your team can rely on.
          </p>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="w-full lg:w-[46%] flex items-center justify-center px-6 sm:px-12 lg:px-16 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile-only brand mark */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary-hex)] flex items-center justify-center">
              <Scissors className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-[1.05rem] tracking-tight">
              <span className="font-bold text-gray-900">Boutique</span>
              <span className="font-medium text-gray-500"> CRM</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
          <p className="text-sm text-gray-500 mt-2 mb-8">Sign in to continue to your Boutique CRM account.</p>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="Enter your registered email address"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-hex)]/25 focus:border-[var(--primary-hex)]/50 text-sm placeholder:text-slate-400 bg-white transition duration-200 text-gray-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <Link to="/auth/forgot-password" className="text-xs font-semibold text-[var(--primary-hex)] hover:opacity-80 transition">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-hex)]/25 focus:border-[var(--primary-hex)]/50 text-sm placeholder:text-slate-400 bg-white transition duration-200 text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[var(--primary-hex)] hover:opacity-95 transform active:scale-[0.98] disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-all duration-150 shadow-md shadow-[var(--primary-hex)]/20 flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            {ownerExists === false ? (
              <p className="text-sm text-gray-500">
                No account set up yet?{' '}
                <Link to="/auth/register" className="font-semibold text-[var(--primary-hex)] hover:opacity-80 transition">
                  Set up your boutique →
                </Link>
              </p>
            ) : ownerExists === true ? (
              <p className="text-sm text-gray-500">
                Not a Member?{' '}
                <Link to="/auth/register" className="font-semibold text-[var(--primary-hex)] hover:opacity-80 transition">
                  Sign Up
                </Link>
              </p>
            ) : null}
          </div>

          <p className="text-center text-xs text-gray-400 mt-8 font-medium">
            Boutique Aadai Plus CRM · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;