import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageContainer } from '../components/layout/PageContainer';
import { TopBar } from '../components/layout/TopBar';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { supabase } from '../services/supabase';

export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || password.length < 6) return;

    setLoading(true);
    setError(null);

    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
    }
  }

  return (
    <>
      <TopBar title="Set New Password" />
      <PageContainer>
        <div className="flex flex-col items-center pt-8 pb-4">
          <h2
            className="text-[22px] font-semibold tracking-tight text-center"
            style={{ color: 'var(--ios-label)' }}
          >
            {success ? 'Password Updated' : 'Choose a new password'}
          </h2>
        </div>

        {success ? (
          <div className="mt-8 text-center">
            <p className="text-[17px] mb-6" style={{ color: 'var(--ios-secondary-label)' }}>
              Your password has been updated. You can now sign in.
            </p>
            <PrimaryButton onClick={() => navigate('/', { replace: true })}>
              Continue
            </PrimaryButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-3">
            <div
              className="rounded-[10px] px-4"
              style={{ background: 'var(--ios-bg-grouped-secondary)' }}
            >
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                autoComplete="new-password"
                className="w-full py-[11px] text-[17px] bg-transparent outline-none"
                style={{ color: 'var(--ios-label)' }}
              />
            </div>

            <p
              className="text-center text-[13px]"
              style={{ color: 'var(--ios-secondary-label)' }}
            >
              Password must be at least 6 characters
            </p>

            <PrimaryButton type="submit" loading={loading} disabled={password.length < 6}>
              Update Password
            </PrimaryButton>

            {error && (
              <p
                className="mt-4 text-center text-[15px]"
                style={{ color: 'var(--ios-red)' }}
              >
                {error}
              </p>
            )}
          </form>
        )}
      </PageContainer>
    </>
  );
}
