import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageContainer } from '../components/layout/PageContainer';
import { TopBar } from '../components/layout/TopBar';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const navigate = useNavigate();
  const { signUp, signIn, forgotPassword, isLoggedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <>
      <TopBar title={mode === 'signin' ? 'Sign In' : 'Create Account'} onBack={() => navigate('/settings')} />
      <PageContainer>
        <div className="flex flex-col items-center pt-8 pb-4">
          <span
            className="text-[56px] leading-none mb-4"
            style={{ color: 'var(--ios-tertiary-label)' }}
            aria-hidden="true"
          >
            {'\u2601'}
          </span>

          <h2
            className="text-[22px] font-semibold tracking-tight text-center"
            style={{ color: 'var(--ios-label)' }}
          >
            Sync your progress
          </h2>
          <p
            className="mt-2 text-[15px] text-center max-w-[280px]"
            style={{ color: 'var(--ios-secondary-label)' }}
          >
            {mode === 'signin'
              ? 'Sign in to sync your progress across devices'
              : 'Create an account to sync your progress across devices'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-3">
          <div
            className="rounded-[10px] overflow-hidden"
            style={{ background: 'var(--ios-bg-grouped-secondary)' }}
          >
            <div className="px-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                autoComplete="email"
                className="w-full py-[11px] text-[17px] bg-transparent outline-none"
                style={{ color: 'var(--ios-label)' }}
              />
            </div>
            <div
              className="px-4"
              style={{ borderTop: '0.5px solid var(--ios-separator)' }}
            >
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                className="w-full py-[11px] text-[17px] bg-transparent outline-none"
                style={{ color: 'var(--ios-label)' }}
              />
            </div>
          </div>

          <PrimaryButton type="submit" loading={loading} disabled={!email.trim() || password.length < 6}>
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </PrimaryButton>

          {mode === 'signup' && (
            <p
              className="text-center text-[13px]"
              style={{ color: 'var(--ios-secondary-label)' }}
            >
              Password must be at least 6 characters
            </p>
          )}
        </form>

        {error && (
          <p
            className="mt-4 text-center text-[15px]"
            style={{ color: 'var(--ios-red)' }}
          >
            {error}
          </p>
        )}

        {resetSent && (
          <p
            className="mt-4 text-center text-[15px]"
            style={{ color: 'var(--ios-green)' }}
          >
            Password reset email sent. Check your inbox.
          </p>
        )}

        {mode === 'signin' && (
          <div className="mt-4 text-center">
            <button
              onClick={async () => {
                if (!email.trim()) { setError('Enter your email first'); return; }
                setError(null);
                setResetSent(false);
                const result = await forgotPassword(email.trim());
                if (result.error) setError(result.error);
                else setResetSent(true);
              }}
              className="text-[15px] active:opacity-60"
              style={{ color: 'var(--ios-blue)' }}
            >
              Forgot password?
            </button>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setResetSent(false); }}
            className="text-[15px] active:opacity-60"
            style={{ color: 'var(--ios-blue)' }}
          >
            {mode === 'signin' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/settings')}
            className="text-[15px] active:opacity-60"
            style={{ color: 'var(--ios-secondary-label)' }}
          >
            Skip for now
          </button>
        </div>
      </PageContainer>
    </>
  );
}
