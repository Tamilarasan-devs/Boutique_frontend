import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Scissors } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F4F3F8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#16132D] mb-4 shadow-lg shadow-[#16132D]/20">
            <Scissors className="w-7 h-7 text-[#7209B7]" />
          </div>
          <h1 className="text-3xl font-serif font-semibold text-[#16132D] tracking-tight">Boutique CRM</h1>
          <p className="text-sm text-[#16132D]/50 mt-2 font-medium">Sign in to manage your atelier</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-[#16132D]/[0.07] shadow-[0_8px_40px_rgba(28,36,48,0.08)] p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#7209B7] mb-1">Welcome back</p>
            <h2 className="text-xl font-serif font-semibold text-[#16132D]">Sign in to your account</h2>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-[#F43F5E]/[0.08] border border-[#F43F5E]/20 rounded-xl text-sm font-medium text-[#F43F5E]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@boutique.com"
                className="w-full px-4 py-3 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition bg-[#F4F3F8]/50 text-[#16132D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16132D]/45 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 border border-[#16132D]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7209B7]/25 focus:border-[#7209B7]/40 text-sm transition bg-[#F4F3F8]/50 text-[#16132D]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#16132D]/35 hover:text-[#16132D]/70 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#16132D] hover:bg-[#2a3545] disabled:opacity-60 text-[#F4F3F8] rounded-xl text-sm font-semibold transition shadow-md shadow-[#16132D]/10 flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#16132D]/[0.06] text-center">
            {ownerExists === false ? (
              <>
                <p className="text-xs text-[#16132D]/45 mb-3">No account set up yet?</p>
                <Link
                  to="/auth/register"
                  className="text-sm font-semibold text-[#7209B7] hover:text-[#a3531f] transition"
                >
                  Set up your boutique →
                </Link>
              </>
            ) : ownerExists === true ? (
              <>
                <p className="text-xs text-[#16132D]/45 mb-3">Don't have an account?</p>
                <Link
                  to="/auth/register"
                  className="text-sm font-semibold text-[#7209B7] hover:text-[#a3531f] transition"
                >
                  Sign up here
                </Link>
              </>
            ) : null}
          </div>
        </div>

        <p className="text-center text-xs text-[#16132D]/35 mt-6 font-medium">
          Boutique Aadai Plus CRM · All rights reserved
        </p>
      </div>
    </div>
  );
};

export default Login;
