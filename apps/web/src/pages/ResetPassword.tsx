import { useState } from 'react';
import { useNavigate } from 'react-router';
import { TopBar } from '../components/layout/TopBar';
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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--k-surface)' }}>
      <TopBar title="Set New Password" />

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
              <h1
                className="font-headline text-3xl font-bold mb-2"
                style={{ color: 'var(--k-primary)' }}
              >
                {success ? 'Password Updated' : 'Set New Password'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--k-secondary)' }}>
                {success
                  ? 'Your password has been updated successfully.'
                  : 'Choose a strong password for your account.'}
              </p>
            </div>

            {success ? (
              <div className="text-center">
                <p className="text-[17px] mb-6" style={{ color: 'var(--k-secondary)' }}>
                  Your password has been updated. You can now sign in.
                </p>
                <button
                  onClick={() => navigate('/', { replace: true })}
                  className="w-full h-12 bg-silk-gradient text-white font-bold rounded-full shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Continue
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="new-password"
                    className="text-xs font-semibold tracking-wider uppercase px-1"
                    style={{ color: 'var(--k-secondary)' }}
                  >
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full h-12 rounded-xl px-4 text-sm border-none outline-none transition-all focus:ring-2"
                    style={{
                      background: 'var(--k-surface-container-low)',
                      color: 'var(--k-on-surface)',
                      '--tw-ring-color': 'color-mix(in srgb, var(--k-primary) 20%, transparent)',
                    } as React.CSSProperties}
                  />
                  <p className="text-xs px-1" style={{ color: 'var(--k-secondary)' }}>
                    Password must be at least 6 characters
                  </p>
                </div>

                {error && (
                  <p className="text-sm text-center" style={{ color: 'var(--k-error)' }}>
                    {error}
                  </p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || password.length < 6}
                    className="w-full h-12 bg-silk-gradient text-white font-bold rounded-full shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Update Password'}
                    {!loading && (
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
