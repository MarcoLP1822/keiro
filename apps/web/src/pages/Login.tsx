import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageContainer } from '../components/layout/PageContainer';
import { TopBar } from '../components/layout/TopBar';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const navigate = useNavigate();
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    setError(null);
    const result = await signInWithEmail(email.trim());
    setSending(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
  }

  async function handleGoogle() {
    setError(null);
    const result = await signInWithGoogle();
    if (result.error) {
      setError(result.error);
    }
  }

  return (
    <>
      <TopBar title="Sign In" onBack={() => navigate('/settings')} />
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
            Sign in to sync your progress across devices
          </p>
        </div>

        {sent ? (
          <div
            className="mt-8 rounded-[10px] p-6 text-center"
            style={{ background: 'var(--ios-bg-grouped-secondary)' }}
          >
            <p
              className="text-[17px] font-semibold"
              style={{ color: 'var(--ios-label)' }}
            >
              Check your email
            </p>
            <p
              className="mt-2 text-[15px]"
              style={{ color: 'var(--ios-secondary-label)' }}
            >
              We sent a magic link to <strong>{email}</strong>. Tap it to sign in.
            </p>
          </div>
        ) : (
          <>
            {/* Email magic link */}
            <form onSubmit={handleSendMagicLink} className="mt-8 space-y-3">
              <div
                className="rounded-[10px] px-4"
                style={{ background: 'var(--ios-bg-grouped-secondary)' }}
              >
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
              <PrimaryButton type="submit" loading={sending} disabled={!email.trim()}>
                Send Magic Link
              </PrimaryButton>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px" style={{ background: 'var(--ios-separator)' }} />
              <span
                className="text-[13px] uppercase"
                style={{ color: 'var(--ios-secondary-label)' }}
              >
                or
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--ios-separator)' }} />
            </div>

            {/* Google sign in */}
            <button
              onClick={handleGoogle}
              className="w-full min-h-[50px] rounded-[12px] px-6 py-3 text-[17px] font-semibold
                transition-all duration-[350ms] active:brightness-90"
              style={{
                background: 'var(--ios-bg-grouped-secondary)',
                color: 'var(--ios-label)',
                border: '0.5px solid var(--ios-separator)',
              }}
            >
              Continue with Google
            </button>
          </>
        )}

        {error && (
          <p
            className="mt-4 text-center text-[15px]"
            style={{ color: 'var(--ios-red)' }}
          >
            {error}
          </p>
        )}

        {/* Skip */}
        <div className="mt-8 text-center">
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
