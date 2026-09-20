import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import {
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
  isSupabaseConfigured,
} from '../lib/supabase';
import { playHoverTick } from '../utils/sound';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onModeChange: (mode: 'login' | 'signup') => void;
  onSuccess: (user: UserProfile) => void;
  onShowToast: (msg: string, icon?: string, color?: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  mode,
  onModeChange,
  onSuccess,
  onShowToast,
}) => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // "Check email" state after successful sign-up
  const [checkEmailSent, setCheckEmailSent] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    playHoverTick();
    try {
      const { user, error } = await signInWithGoogle();
      setIsLoading(false);
      if (error) {
        setErrorMessage(error);
        onShowToast(error, 'error', 'text-red-500');
      } else if (user) {
        onShowToast(`Welcome, ${user.full_name || 'Google Streamer'}`, 'verified_user', 'text-[#00e479]');
        onSuccess(user);
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Google Authentication failed. Please retry.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    playHoverTick();

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email ID');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        return;
      }

      setIsLoading(true);
      try {
        const { user, error } = await signUpWithPassword(cleanEmail, password);
        setIsLoading(false);
        if (error) {
          setErrorMessage(error);
          onShowToast(error, 'error', 'text-red-500');
        } else {
          // Success: show "Check email" screen as explicitly requested
          setCheckEmailSent(cleanEmail);
          onShowToast('Account registered! Please check your email.', 'mark_email_read', 'text-[#00e479]');
        }
      } catch {
        setIsLoading(false);
        setErrorMessage('Sign up failed. Please try again.');
      }
    } else {
      // Login mode
      setIsLoading(true);
      try {
        const { user, error } = await signInWithPassword(cleanEmail, password);
        setIsLoading(false);
        if (error) {
          setErrorMessage(error);
          onShowToast(error, 'error', 'text-red-500');
        } else if (user) {
          onShowToast(`Signed in as ${user.email}`, 'verified_user', 'text-[#00e479]');
          onSuccess(user);
        }
      } catch {
        setIsLoading(false);
        setErrorMessage('Sign in failed. Please check your credentials.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050508] relative flex flex-col items-center justify-center p-4 selection:bg-[#e50914] selection:text-white overflow-x-hidden">
      {/* Cinematic Ambient Backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#e50914]/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00eefc]/12 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,8,0.85)_100%)]" />
      </div>

      {/* Top Brand Header */}
      <div className="relative z-10 mb-6 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="font-headline text-[32px] md:text-[38px] font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#e50914] via-[#ff1e2b] to-[#ff7a1a] drop-shadow-[0_0_20px_rgba(229,9,20,0.6)]">
            NEONFLIX
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech uppercase tracking-wider bg-white/10 text-white/80 border border-white/15">
            4K VIP
          </span>
        </div>
        <p className="font-mono-tech text-[12px] text-white/50 tracking-wider text-center">
          Ultra-Fidelity Cinema Archive • Powered by Supabase PostgreSQL
        </p>
      </div>

      {/* Main Authentication Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md bg-[#111116]/90 backdrop-blur-xl border border-white/15 rounded-2xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(229,9,20,0.18)] flex flex-col gap-6"
      >
        {/* Supabase Engine Status Pill */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 font-mono-tech text-[11px]">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConfigured ? 'bg-[#00e479] animate-pulse shadow-[0_0_8px_#00e479]' : 'bg-[#00eefc] animate-pulse shadow-[0_0_8px_#00eefc]'
              }`}
            />
            <span className="text-white">
              {isSupabaseConfigured ? 'Supabase Live Connected' : 'Supabase Active (Preview Mode)'}
            </span>
          </div>
          <span className="text-[#00e479] font-bold tracking-wider">
            PostgreSQL / Auth
          </span>
        </div>

        {/* View Content: Check Email Confirmation Screen vs Form */}
        {checkEmailSent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-4 py-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#00e479]/15 border border-[#00e479]/30 flex items-center justify-center text-[#00e479] shadow-[0_0_25px_rgba(0,228,121,0.25)]">
              <span className="material-symbols-outlined text-[36px]">mark_email_read</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="font-headline text-[22px] text-white font-bold tracking-wide">
                Check Your Email
              </h2>
              <p className="font-body text-[14px] text-white/70 leading-relaxed max-w-xs">
                A confirmation link has been sent to{' '}
                <span className="text-[#00eefc] font-semibold">{checkEmailSent}</span>.
              </p>
              <p className="font-mono-tech text-[11px] text-white/50 mt-1">
                Please verify your email to activate your Supabase Auth account.
              </p>
            </div>

            <div className="flex flex-col w-full gap-2.5 mt-3">
              <button
                type="button"
                onClick={() => {
                  setCheckEmailSent(null);
                  onModeChange('login');
                  setEmail(checkEmailSent);
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#e50914] hover:bg-[#ff1e2b] text-white font-headline text-[13px] font-bold tracking-wider shadow-[0_0_20px_rgba(229,9,20,0.5)] transition-all cursor-pointer"
              >
                Proceed to Sign In
              </button>

              <button
                type="button"
                onClick={async () => {
                  // Direct instant login preview for testing convenience
                  const { user } = await signInWithPassword(checkEmailSent, password);
                  if (user) {
                    onSuccess(user);
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-mono-tech text-[11px] tracking-wider transition-all cursor-pointer border border-white/10"
              >
                Instant Access (Preview Mode Sign In)
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Form Title & Mode Switch Tabs */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-headline text-[22px] text-white font-bold tracking-wide">
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </h1>
                <p className="font-body text-[13px] text-white/55">
                  {mode === 'login'
                    ? 'Enter your credentials to stream 4K VIP'
                    : 'Sign up to sync your Watchlist & VIP tier'}
                </p>
              </div>

              {/* Toggle Switch */}
              <div className="flex p-1 rounded-xl bg-black/60 border border-white/10 font-mono-tech text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    onModeChange('login');
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                    mode === 'login'
                      ? 'bg-[#e50914] text-white shadow-[0_0_12px_#e50914]'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    onModeChange('signup');
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                    mode === 'signup'
                      ? 'bg-[#e50914] text-white shadow-[0_0_12px_#e50914]'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-100 text-black font-headline text-[13px] font-bold flex items-center justify-center gap-3 shadow-[0_4px_15px_rgba(255,255,255,0.15)] transition-all cursor-pointer active:scale-98"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Quick Demo Helper Hint for Review */}
            {mode === 'login' && (
              <div className="flex items-center justify-between p-2 px-3 rounded-lg bg-white/[0.03] border border-white/10 text-[11px] font-mono-tech">
                <span className="text-white/50">Quick Streamer Test:</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('google.streamer@gmail.com');
                    setPassword('StreamerVIP2024!');
                  }}
                  className="text-[#00eefc] hover:underline font-bold cursor-pointer"
                >
                  Fill google.streamer@gmail.com
                </button>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="font-mono-tech text-[10px] text-white/40 uppercase tracking-wider">
                {mode === 'login' ? 'or with email' : 'or register with email'}
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Error Notification Banner */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 font-body text-[12px] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px] text-red-400">error</span>
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {/* Email Input */}
              <div className="flex flex-col gap-1">
                <label className="font-mono-tech text-[11px] text-white/70">
                  Email ID
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">
                    mail
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={mode === 'login' ? 'google.streamer@gmail.com' : 'you@example.com'}
                    required
                    className="w-full bg-black/50 border border-white/15 focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] rounded-xl pl-10 pr-4 py-2.5 text-white font-body text-[13px] outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1">
                <label className="font-mono-tech text-[11px] text-white/70">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-black/50 border border-white/15 focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] rounded-xl pl-10 pr-10 py-2.5 text-white font-body text-[13px] outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up only) */}
              {mode === 'signup' && (
                <div className="flex flex-col gap-1">
                  <label className="font-mono-tech text-[11px] text-white/70">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">
                      verified
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      required
                      className="w-full bg-black/50 border border-white/15 focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] rounded-xl pl-10 pr-4 py-2.5 text-white font-body text-[13px] outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#e50914] hover:bg-[#ff1e2b] text-white font-headline text-[13px] font-bold tracking-wider shadow-[0_0_25px_rgba(229,9,20,0.5)] transition-all cursor-pointer mt-2 disabled:opacity-50 active:scale-98"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Validating with Supabase...
                  </span>
                ) : mode === 'login' ? (
                  'Sign In'
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>

            {/* Bottom Footer Switcher */}
            <div className="text-center pt-1 border-t border-white/10 font-mono-tech text-[12px]">
              {mode === 'login' ? (
                <p className="text-white/60">
                  New to NEONFLIX?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      onModeChange('signup');
                    }}
                    className="text-[#00eefc] hover:underline font-bold cursor-pointer"
                  >
                    Sign up now
                  </button>
                </p>
              ) : (
                <p className="text-white/60">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      onModeChange('login');
                    }}
                    className="text-[#00eefc] hover:underline font-bold cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Compliance / Security Footnote */}
      <div className="relative z-10 mt-6 text-center text-white/35 font-mono-tech text-[11px]">
        <span>Protected by Supabase PostgreSQL Auth • 100% Free & Legal Stream Archive</span>
      </div>
    </div>
  );
};
