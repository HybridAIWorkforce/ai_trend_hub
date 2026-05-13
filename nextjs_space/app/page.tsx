'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Mail, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Suspense } from 'react';

function HomePageInner() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoLoggingIn, setAutoLoggingIn] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession() || {};

  // Check if user just logged out
  const didLogout = searchParams?.get('logout') === 'true';

  // Auto-login effect
  useEffect(() => {
    // If user explicitly logged out, skip auto-login and show manual form
    if (didLogout) {
      setAutoLoggingIn(false);
      return;
    }

    const performAutoLogin = async () => {
      // If user is already authenticated, redirect to dashboard
      if (status === 'authenticated') {
        router.push('/dashboard');
        return;
      }

      // If still loading session status, wait
      if (status === 'loading') {
        return;
      }

      // If not authenticated, auto-login with owner credentials
      if (status === 'unauthenticated') {
        try {
          const result = await signIn('credentials', {
            email: 'owner@aitrendhub.com',
            password: 'trendhub2024',
            redirect: false,
          });

          if (result?.error) {
            console.error('Auto-login failed:', result.error);
            setAutoLoggingIn(false);
            toast.error('Auto-login failed. Please login manually.');
          } else {
            toast.success('Auto-login successful!');
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Auto-login error:', error);
          setAutoLoggingIn(false);
          toast.error('Auto-login failed. Please login manually.');
        }
      }
    };

    performAutoLogin();
  }, [status, router, didLogout]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid email or password');
      } else {
        toast.success('Login successful!');
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen during auto-login
  if (autoLoggingIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative text-center">
          <div className="inline-flex items-center justify-center p-4 bg-blue-500/20 rounded-2xl mb-6">
            <Sparkles className="w-12 h-12 text-blue-400 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">AI Trend Hub</h1>
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            <p className="text-lg text-zinc-400">Logging you in automatically...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-blue-500/20 rounded-2xl mb-4">
            <Sparkles className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">AI Trend Hub</h1>
          <p className="text-zinc-400">Your personal AI trend tracking dashboard</p>
        </div>

        {/* Login Form - Only shown if auto-login fails */}
        <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white mb-6">Welcome Back</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Login Info */}
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-yellow-500/80 text-center">
              {didLogout
                ? '👋 You have been logged out successfully. Sign in to continue.'
                : '⚠️ Auto-login failed. Please login manually with your credentials.'}
            </p>
          </div>
          
          {/* Demo Credentials */}
          <div className="mt-4 p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-lg">
            <p className="text-xs text-zinc-500 text-center mb-2 font-semibold">
              Test Accounts:
            </p>
            <p className="text-xs text-zinc-400 text-center">
              owner@aitrendhub.com / trendhub2024
            </p>
            <p className="text-xs text-zinc-400 text-center">
              john@doe.com / johndoe123
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-500 text-sm mt-6">
          Track trending AI topics from news, Reddit, and specialized sources
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    }>
      <HomePageInner />
    </Suspense>
  );
}