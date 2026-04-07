import { useState } from 'react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/layout/BottomNav';
import { PageHeader } from '../components/layout/PageHeader';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { Modal } from '../components/common/Modal';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../hooks/useAuth';
import { storage } from '../services/storage';
import { syncService } from '../services/sync';
import { supabase } from '../services/supabase';
import { db } from '../services/db';

const themeOptions = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

const planSizeOptions = [
  { label: 'Small (~10 min)', value: 'small' },
  { label: 'Medium (~20 min)', value: 'medium' },
  { label: 'Large (~30 min)', value: 'large' },
];

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="relative w-14 h-8 rounded-full p-1 flex items-center transition-colors"
      style={{ background: checked ? 'var(--k-primary)' : 'var(--k-secondary-container)' }}
    >
      <span
        className="w-6 h-6 rounded-full bg-white shadow-sm transition-transform"
        style={{ transform: checked ? 'translateX(24px)' : 'translateX(0)' }}
      />
    </button>
  );
}

export function Settings() {
  const navigate = useNavigate();
  const {
    audio, planSize, theme, showFurigana,
    setAudio, setPlanSize, setTheme, setShowFurigana,
  } = useSettings();
  const { user, isLoggedIn, isBanned, banReason, signOut } = useAuth();
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleSignOut() {
    await signOut();
    storage.setUserId(null);
  }

  async function handleSyncNow() {
    setSyncing(true);
    await syncService.syncNow();
    setSyncing(false);
  }

  function formatLastSynced(): string {
    const last = syncService.lastSyncedAt;
    if (!last) return 'Not synced';
    const diff = Date.now() - new Date(last).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  }

  async function handleExportData() {
    if (!supabase || !user) return;
    setActionError(null);
    setExporting(true);
    try {
      const [
        { data: progress },
        { data: cards },
        { data: plans },
        { data: settings },
      ] = await Promise.all([
        supabase.from('module_progress').select('*').eq('user_id', user.id),
        supabase.from('srs_cards').select('*').eq('user_id', user.id),
        supabase.from('daily_plans').select('*').eq('user_id', user.id),
        supabase.from('user_settings').select('*').eq('user_id', user.id),
      ]);

      const exportData = {
        exportedAt: new Date().toISOString(),
        email: user.email,
        moduleProgress: progress ?? [],
        srsCards: cards ?? [],
        dailyPlans: plans ?? [],
        settings: settings ?? [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'keiro-data-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      setActionError('Export failed — please try again');
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteAccount() {
    if (!supabase || !user) return;
    setActionError(null);
    try {
      const { error } = await supabase.rpc('delete_own_account');
      if (error) throw error;
      await db.delete();
      await signOut();
      navigate('/welcome');
    } catch (err) {
      console.error('Account deletion failed:', err);
      setActionError('Account deletion failed — please try again');
    }
  }

  async function handleReset() {
    await storage.resetAll();
    navigate('/welcome');
  }

  return (
    <>
      <main className="pt-8 px-4 max-w-2xl mx-auto space-y-4 pb-32">
        <div className="pl-2">
          <PageHeader titleJp="設定" subtitle="Settings" />
        </div>

        {/* Ban message */}
        {isBanned && (
          <div className="rounded-xl p-4" style={{ background: 'var(--k-error)', color: 'var(--k-on-error)' }}>
            <p className="font-semibold">Account Suspended</p>
            <p className="text-sm mt-1 opacity-90">
              {banReason || 'Your account has been suspended. Contact support for more information.'}
            </p>
          </div>
        )}

        {actionError && (
          <div className="rounded-xl px-4 py-3" style={{ background: 'var(--k-error-container)', color: 'var(--k-error)' }}>
            <p className="text-sm">{actionError}</p>
          </div>
        )}

        {/* Account Section */}
        <section className="rounded-xl p-6 shadow-sm" style={{ background: 'var(--k-surface-container-lowest)' }}>
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined" style={{ color: 'var(--k-primary)' }}>account_circle</span>
            <h3 className="font-bold" style={{ color: 'var(--k-primary)' }}>Account</h3>
          </div>
          {isLoggedIn ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs px-1" style={{ color: 'var(--k-secondary)' }}>Email Address</label>
                <div
                  className="px-4 py-3 rounded-xl flex justify-between items-center mt-1"
                  style={{ background: 'var(--k-surface-container-low)' }}
                >
                  <span className="text-sm" style={{ color: 'var(--k-on-surface)' }}>{user?.email}</span>
                </div>
                <p className="text-xs mt-1 px-1" style={{ color: 'var(--k-secondary)' }}>
                  Last synced: {formatLastSynced()}
                </p>
                {syncService.lastError && (
                  <p className="text-xs mt-1 px-1" style={{ color: 'var(--k-error)' }}>
                    {syncService.lastError}
                  </p>
                )}
              </div>
              <button
                onClick={handleSyncNow}
                disabled={syncing}
                className="w-full px-4 py-3 rounded-xl flex justify-between items-center disabled:opacity-50"
                style={{ background: 'var(--k-surface-container-low)' }}
              >
                <span className="text-sm" style={{ color: 'var(--k-on-surface)' }}>
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </span>
                <span className="material-symbols-outlined text-lg" style={{ color: 'var(--k-secondary)' }}>sync</span>
              </button>
              <button
                onClick={handleSignOut}
                className="text-sm font-semibold active:opacity-60"
                style={{ color: 'var(--k-error)' }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full px-4 py-3 rounded-xl flex justify-between items-center"
              style={{ background: 'var(--k-surface-container-low)' }}
            >
              <span className="text-sm font-semibold" style={{ color: 'var(--k-primary)' }}>Sign In</span>
              <span className="material-symbols-outlined text-lg" style={{ color: 'var(--k-secondary)' }}>chevron_right</span>
            </button>
          )}
        </section>

        {/* Appearance Section */}
        <section className="rounded-xl p-6 shadow-sm" style={{ background: 'var(--k-surface-container-lowest)' }}>
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined" style={{ color: 'var(--k-primary)' }}>palette</span>
            <h3 className="font-bold" style={{ color: 'var(--k-primary)' }}>Appearance</h3>
          </div>
          <div className="space-y-6">
            <SegmentedControl
              options={themeOptions}
              selected={theme}
              onChange={(value) => setTheme(value as 'system' | 'light' | 'dark')}
            />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--k-on-surface)' }}>Show Furigana</span>
                <p className="text-xs mt-0.5" style={{ color: 'var(--k-secondary)' }}>
                  Show reading above kanji in exercises
                </p>
              </div>
              <Toggle checked={showFurigana} onChange={() => setShowFurigana(!showFurigana)} label="Toggle furigana" />
            </div>
          </div>
        </section>

        {/* Audio Section */}
        <section className="rounded-xl p-6 shadow-sm" style={{ background: 'var(--k-surface-container-lowest)' }}>
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined" style={{ color: 'var(--k-primary)' }}>volume_up</span>
            <h3 className="font-bold" style={{ color: 'var(--k-primary)' }}>Audio</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium" style={{ color: 'var(--k-on-surface)' }}>Auto-play Audio</span>
              <p className="text-xs mt-0.5" style={{ color: 'var(--k-secondary)' }}>
                Pronunciation for each exercise
              </p>
            </div>
            <Toggle checked={audio} onChange={() => setAudio(!audio)} label="Toggle audio" />
          </div>
        </section>

        {/* Study Section */}
        <section className="rounded-xl p-6 shadow-sm" style={{ background: 'var(--k-surface-container-lowest)' }}>
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined" style={{ color: 'var(--k-primary)' }}>menu_book</span>
            <h3 className="font-bold" style={{ color: 'var(--k-primary)' }}>Study</h3>
          </div>
          <div>
            <span className="text-sm font-medium" style={{ color: 'var(--k-on-surface)' }}>Daily Plan Size</span>
            <p className="text-xs mt-0.5 mb-4" style={{ color: 'var(--k-secondary)' }}>New items per day</p>
            <SegmentedControl
              options={planSizeOptions}
              selected={planSize}
              onChange={(value) => setPlanSize(value as 'small' | 'medium' | 'large')}
            />
          </div>
        </section>

        {/* Data & Privacy Section */}
        <section
          className="rounded-xl p-6 shadow-sm"
          style={{
            background: 'var(--k-surface-container-lowest)',
            border: '1px solid color-mix(in srgb, var(--k-outline-variant) 15%, transparent)',
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined" style={{ color: 'var(--k-primary)' }}>shield</span>
            <h3 className="font-bold" style={{ color: 'var(--k-primary)' }}>Data & Privacy</h3>
          </div>
          <div className="space-y-2">
            {isLoggedIn && (
              <button
                onClick={handleExportData}
                disabled={exporting}
                className="w-full text-left py-3 flex justify-between items-center disabled:opacity-50"
                style={{ borderBottom: '1px solid var(--k-surface-container-high)' }}
              >
                <span className="text-sm" style={{ color: 'var(--k-on-surface)' }}>
                  {exporting ? 'Exporting...' : 'Export Study Data'}
                </span>
                <span className="material-symbols-outlined" style={{ color: 'var(--k-secondary)' }}>download</span>
              </button>
            )}
            <button
              onClick={() => setShowResetModal(true)}
              className="w-full text-left py-3 flex justify-between items-center"
              style={{ borderBottom: isLoggedIn ? '1px solid var(--k-surface-container-high)' : undefined }}
            >
              <span className="text-sm" style={{ color: 'var(--k-on-surface)' }}>Reset All Progress</span>
              <span className="material-symbols-outlined" style={{ color: 'var(--k-secondary)' }}>restart_alt</span>
            </button>
            {isLoggedIn && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full text-left py-3 flex justify-between items-center"
                style={{ color: 'var(--k-error)' }}
              >
                <span className="text-sm font-medium">Delete Account</span>
                <span className="material-symbols-outlined">delete</span>
              </button>
            )}
          </div>
        </section>

        {/* About */}
        <section className="rounded-xl p-6 shadow-sm" style={{ background: 'var(--k-surface-container-lowest)' }}>
          <button
            onClick={() => navigate('/about')}
            className="w-full flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined" style={{ color: 'var(--k-primary)' }}>info</span>
              <span className="text-sm font-medium" style={{ color: 'var(--k-on-surface)' }}>About Keiro</span>
            </div>
            <span className="material-symbols-outlined" style={{ color: 'var(--k-secondary)' }}>chevron_right</span>
          </button>
        </section>

      </main>

      <BottomNav />

      <Modal
        isOpen={showResetModal}
        variant="danger"
        title="Reset all progress?"
        body="This will erase everything and start from the beginning. This cannot be undone."
        primaryLabel="Reset"
        secondaryLabel="Cancel"
        onPrimary={handleReset}
        onSecondary={() => setShowResetModal(false)}
      />

      <Modal
        isOpen={showDeleteModal}
        variant="danger"
        title="Delete your account?"
        body="This will permanently delete your account and all your data from our servers. This cannot be undone."
        primaryLabel="Delete Account"
        secondaryLabel="Cancel"
        onPrimary={handleDeleteAccount}
        onSecondary={() => setShowDeleteModal(false)}
      />
    </>
  );
}
