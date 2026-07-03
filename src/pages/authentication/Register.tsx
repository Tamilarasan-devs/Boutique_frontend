import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Scissors } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';

const Register: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.register({ name, email, password });
      // Auto-login after registration
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F1] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1C2430] mb-4 shadow-lg shadow-[#1C2430]/20">
            <Scissors className="w-7 h-7 text-[#C1652F]" />
          </div>
          <h1 className="text-3xl font-serif font-semibold text-[#1C2430] tracking-tight">Boutique CRM</h1>
          <p className="text-sm text-[#1C2430]/50 mt-2 font-medium">First-time setup — Register your boutique</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-[#1C2430]/[0.07] shadow-[0_8px_40px_rgba(28,36,48,0.08)] p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#C1652F] mb-1">Owner Registration</p>
            <h2 className="text-xl font-serif font-semibold text-[#1C2430]">Create your owner account</h2>
            <p className="text-sm text-[#1C2430]/50 mt-1">This account will have full access to all features.</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-[#9B3B43]/[0.08] border border-[#9B3B43]/20 rounded-xl text-sm font-medium text-[#9B3B43]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Priya Sharma"
                className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 focus:border-[#C1652F]/40 text-sm transition bg-[#FAF7F1]/50 text-[#1C2430]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="owner@boutique.com"
                className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 focus:border-[#C1652F]/40 text-sm transition bg-[#FAF7F1]/50 text-[#1C2430]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 pr-11 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 focus:border-[#C1652F]/40 text-sm transition bg-[#FAF7F1]/50 text-[#1C2430]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1C2430]/35 hover:text-[#1C2430]/70 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C2430]/45 uppercase tracking-wider mb-1.5">
                Confirm Password *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Re-enter password"
                className="w-full px-4 py-3 border border-[#1C2430]/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1652F]/25 focus:border-[#C1652F]/40 text-sm transition bg-[#FAF7F1]/50 text-[#1C2430]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#C1652F] hover:bg-[#a3531f] disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-[#C1652F]/20 flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Creating account…' : 'Create Owner Account'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#1C2430]/[0.06] text-center">
            <p className="text-xs text-[#1C2430]/45">
              Already have an account?{' '}
              <Link to="/auth/login" className="font-semibold text-[#C1652F] hover:text-[#a3531f] transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
