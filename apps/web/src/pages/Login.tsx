import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageContainer } from '../components/layout/PageContainer';
import { TopBar } from '../components/layout/TopBar';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const navigate = useNavigate();
  const { signInWithEmail, verifyOtp, isLoggedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect to settings
  if (isLoggedIn) {
    navigate('/settings', { replace: true });
    return null;
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    setError(null);
    const result = await signInWithEmail(email.trim());
    setSending(false);

    if (result.error) {
      setError(result.error);
    } else {
      setStep('otp');
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!otpCode.trim()) return;

    setVerifying(true);
    setError(null);
    const result = await verifyOtp(email.trim(), otpCode.trim());
    setVerifying(false);

    if (result.error) {
      setError(result.error);
    } else {
      navigate('/settings', { replace: true });
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

        {step === 'email' ? (
          <form onSubmit={handleSendCode} className="mt-8 space-y-3">
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
              Send Verification Code
            </PrimaryButton>
          </form>
        ) : (
          <>
            <div
              className="mt-8 rounded-[10px] p-4 text-center"
              style={{ background: 'var(--ios-bg-grouped-secondary)' }}
            >
              <p
                className="text-[15px]"
                style={{ color: 'var(--ios-secondary-label)' }}
              >
                We sent a verification code to
              </p>
              <p
                className="text-[17px] font-semibold mt-1"
                style={{ color: 'var(--ios-label)' }}
              >
                {email}
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="mt-4 space-y-3">
              <div
                className="rounded-[10px] px-4"
                style={{ background: 'var(--ios-bg-grouped-secondary)' }}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="Enter verification code"
                  className="w-full py-[11px] text-[17px] text-center tracking-[0.5em] bg-transparent outline-none"
                  style={{ color: 'var(--ios-label)' }}
                  maxLength={8}
                />
              </div>
              <PrimaryButton type="submit" loading={verifying} disabled={otpCode.length < 6}>
                Verify
              </PrimaryButton>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => { setStep('email'); setOtpCode(''); setError(null); }}
                className="text-[15px] active:opacity-60"
                style={{ color: 'var(--ios-blue)' }}
              >
                Use a different email
              </button>
            </div>
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
