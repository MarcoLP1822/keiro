import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const navigate = useNavigate();
  const { signUp, signIn, forgotPassword, isLoggedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (isLoggedIn) {
    navigate('/settings', { replace: true });
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError(null);

    const result = mode === 'signup'
      ? await signUp(email.trim(), password)
      : await signIn(email.trim(), password);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      navigate('/settings', { replace: true });
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--k-surface)' }}>
      {/* Header */}
      <header
        className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16"
        style={{
          background: 'color-mix(in srgb, var(--k-surface) 90%, transparent)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <span className="font-headline text-xl font-black tracking-tighter" style={{ color: 'var(--k-primary)' }}>
          Keiro
        </span>
        <span className="text-xs font-medium tracking-widest uppercase" style={{ color: 'var(--k-secondary)' }}>
          Pathway to Mastery
        </span>
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-4 pt-16 pb-12">
        <div className="w-full max-w-[440px]">
          {/* Card */}
          <div
            className="p-8 md:p-12 rounded-xl"
            style={{
              background: 'var(--k-surface-container-lowest)',
              boxShadow: '0 12px 32px -4px rgba(12, 46, 46, 0.06)',
              border: '1px solid color-mix(in srgb, var(--k-outline-variant) 10%, transparent)',
            }}
          >
            <div className="mb-10">
              <h1 className="font-headline text-3xl font-bold mb-2" style={{ color: 'var(--k-primary)' }}>
                {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--k-secondary)' }}>
                {mode === 'signin'
                  ? 'Continue your journey through the digital garden.'
                  : 'Start syncing your progress across devices.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold tracking-wider uppercase px-1"
                  style={{ color: 'var(--k-secondary)' }}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full h-12 rounded-xl px-4 text-sm border-none outline-none transition-all focus:ring-2"
                  style={{
                    background: 'var(--k-surface-container-low)',
                    color: 'var(--k-on-surface)',
                    '--tw-ring-color': 'color-mix(in srgb, var(--k-primary) 20%, transparent)',
                  } as React.CSSProperties}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end px-1">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold tracking-wider uppercase"
                    style={{ color: 'var(--k-secondary)' }}
                  >
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!email.trim()) { setError('Enter your email first'); return; }
                        setError(null);
                        setResetSent(false);
                        const result = await forgotPassword(email.trim());
                        if (result.error) setError(result.error);
                        else setResetSent(true);
                      }}
                      className="text-xs font-medium active:opacity-60"
                      style={{ color: 'var(--k-primary)' }}
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    className="w-full h-12 rounded-xl pl-4 pr-12 text-sm border-none outline-none transition-all focus:ring-2"
                    style={{
                      background: 'var(--k-surface-container-low)',
                      color: 'var(--k-on-surface)',
                      '--tw-ring-color': 'color-mix(in srgb, var(--k-primary) 20%, transparent)',
                    } as React.CSSProperties}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--k-secondary)' }}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="text-xs px-1" style={{ color: 'var(--k-secondary)' }}>
                    Password must be at least 6 characters
                  </p>
                )}
              </div>

              {error && (
                <p className="text-sm text-center" style={{ color: 'var(--k-error)' }}>
                  {error}
                </p>
              )}

              {resetSent && (
                <p className="text-sm text-center" style={{ color: 'var(--k-correct-secondary)' }}>
                  Password reset email sent. Check your inbox.
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !email.trim() || password.length < 6}
                  className="w-full h-12 bg-silk-gradient text-white font-bold rounded-full shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                  {!loading && (
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  )}
                </button>
              </div>
            </form>

            <div
              className="mt-8 pt-8 text-center"
              style={{ borderTop: '1px solid var(--k-surface-container)' }}
            >
              <p className="text-sm" style={{ color: 'var(--k-secondary)' }}>
                {mode === 'signin' ? 'Need an account?' : 'Already have an account?'}
                <button
                  onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setResetSent(false); }}
                  className="font-bold ml-1 active:opacity-60"
                  style={{ color: 'var(--k-primary)' }}
                >
                  {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>

          {/* Skip */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/settings')}
              className="text-sm font-medium active:opacity-60"
              style={{ color: 'var(--k-secondary)' }}
            >
              Skip for now
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
