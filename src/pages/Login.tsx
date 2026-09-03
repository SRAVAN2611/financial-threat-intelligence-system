import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_USERS } from '../mockData/users';
import { UserRole } from '../types';
import { Modal } from '../components/common/Modal';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('elena.vance@sentinel-fin.internal');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide a valid corporate email address');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed: Invalid credentials or session expired');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    const demo = DEMO_USERS.find((u) => u.role === role);
    if (!demo) return;
    setError(null);
    setLoading(true);
    try {
      await login(demo.email, 'password123');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setResetSuccess(false);
      setResetEmail('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-sky-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Reset Secure Credentials"
        subtitle="Sentinel Multi-Factor Recovery Gateway (FY 2026–27)"
        maxWidth="md"
      >
        {resetSuccess ? (
          <div className="text-center py-6 space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-100">Recovery Challenge Dispatched</h4>
            <p className="text-xs text-slate-400">
              An encrypted one-time hardware challenge token was sent to <strong className="text-slate-200">{resetEmail}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendReset} className="space-y-4 py-2">
            <p className="text-xs text-slate-400">
              Enter your corporate email address to receive an authorized FIDO2 cryptographic password recovery challenge.
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Corporate Email Address
              </label>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="officer@sentinel-fin.internal"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                Dispatch Challenge
              </button>
            </div>
          </form>
        )}
      </Modal>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-xl shadow-sky-950/50">
            <Shield className="w-7 h-7" />
          </div>
        </div>
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-slate-100">
          SENTINEL<span className="text-sky-400 font-mono">-FIN</span>
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400 uppercase tracking-widest font-mono">
          AI Secure Budget Intelligence & Financial Threat Detection • FY 2026–27
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        {/* Main Login Card */}
        <div className="enterprise-card p-6 sm:p-8 bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@sentinel-fin.internal"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 font-sans"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Passcode / Security Key
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-sky-400 hover:text-sky-300 hover:underline cursor-pointer"
                >
                  Forgot Key?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 rounded cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500/20"
                />
                <span className="text-slate-300">Remember session credentials</span>
              </label>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                TLS 1.3 256-bit Encrypted
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-sky-950/60 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Cryptographic Handshake...</span>
                </>
              ) : (
                <>
                  <span>Authenticate & Enter Secure Enclave</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Role Switcher Demo Cards */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Instant 1-Click Demo Accounts (RBAC)
              </span>
              <span className="text-[10px] text-sky-400 font-mono">FY 2026–27 Ready</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {DEMO_USERS.map((demo) => {
                return (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleQuickDemoLogin(demo.role)}
                    className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.02] flex flex-col justify-between cursor-pointer ${
                      demo.role === 'ADMIN'
                        ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/60'
                        : demo.role === 'FINANCE_OFFICER'
                        ? 'bg-sky-950/20 border-sky-500/30 hover:border-sky-500/60'
                        : 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={demo.avatar}
                        alt={demo.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-700"
                      />
                      <div className="min-w-0">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase block px-1.5 py-0.2 rounded w-fit ${
                            demo.role === 'ADMIN'
                              ? 'bg-rose-500/20 text-rose-300'
                              : demo.role === 'FINANCE_OFFICER'
                              ? 'bg-sky-500/20 text-sky-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {demo.role}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-slate-100 truncate">{demo.name}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{demo.roleTitle}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Security Disclaimers */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-1 font-mono">
          <p>ENTERPRISE CORPORATE FINANCIAL SECURITY & TREASURY INTELLIGENCE PLATFORM</p>
          <p className="text-[11px] text-slate-600">
            Complies with statutory Internal Financial Controls (IFC), Companies Act, ISO 27001 ISMS, and SOX 404 audit trail frameworks.
          </p>
        </div>
      </div>
    </div>
  );
};
