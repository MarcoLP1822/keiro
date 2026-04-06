import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageContainer } from '../components/layout/PageContainer';
import { TopBar } from '../components/layout/TopBar';
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

export function Settings() {
  const navigate = useNavigate();
  const {
    audio,
    planSize,
    theme,
    showFurigana,
    setAudio,
    setPlanSize,
    setTheme,
    setShowFurigana,
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
      // Call RPC function that deletes the calling user
      const { error } = await supabase.rpc('delete_own_account');
      if (error) throw error;

      // Clear local data
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
      <TopBar title="Settings" onBack={() => navigate('/')} />
      <PageContainer>
        {/* Ban message */}
        {isBanned && (
          <div
            className="mb-4 rounded-[10px] p-4"
            style={{ background: 'var(--ios-red)', color: 'white' }}
          >
            <p className="text-[17px] font-semibold">Account Suspended</p>
            <p className="text-[15px] mt-1 opacity-90">
              {banReason || 'Your account has been suspended. Contact support for more information.'}
            </p>
          </div>
        )}

        {/* Account section */}
        <p
          className="mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          Account
        </p>
        <div
          className="rounded-[10px] overflow-hidden"
          style={{ background: 'var(--ios-bg-grouped-secondary)' }}
        >
          {isLoggedIn ? (
            <>
              <div className="px-4 py-[11px]">
                <p className="text-[17px]" style={{ color: 'var(--ios-label)' }}>
                  {user?.email}
                </p>
                <p className="text-[13px] mt-0.5" style={{ color: 'var(--ios-secondary-label)' }}>
                  Last synced: {formatLastSynced()}
                </p>
                {syncService.lastError && (
                  <p className="text-[13px] mt-0.5" style={{ color: 'var(--ios-red)' }}>
                    {syncService.lastError}
                  </p>
                )}
              </div>
              <div style={{ borderTop: '0.5px solid var(--ios-separator)' }}>
                <button
                  onClick={handleSyncNow}
                  disabled={syncing}
                  className="w-full min-h-[44px] px-4 py-[11px] text-left text-[17px] active:opacity-60 disabled:opacity-50"
                  style={{ color: 'var(--ios-blue)' }}
                >
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>
              <div style={{ borderTop: '0.5px solid var(--ios-separator)' }}>
                <button
                  onClick={handleSignOut}
                  className="w-full min-h-[44px] px-4 py-[11px] text-left text-[17px] active:opacity-60"
                  style={{ color: 'var(--ios-red)' }}
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full min-h-[44px] px-4 py-[11px] text-left text-[17px] active:opacity-60"
              style={{ color: 'var(--ios-blue)' }}
            >
              Sign In
            </button>
          )}
        </div>

        {/* Appearance section */}
        <p
          className="mt-8 mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          Appearance
        </p>
        <div
          className="rounded-[10px]"
          style={{ background: 'var(--ios-bg-grouped-secondary)' }}
        >
          <div className="p-4">
            <SegmentedControl
              options={themeOptions}
              selected={theme}
              onChange={(value) => setTheme(value as 'system' | 'light' | 'dark')}
            />
          </div>
          <div
            className="flex items-center justify-between px-4 py-[11px]"
            style={{ borderTop: '0.5px solid var(--ios-separator)' }}
          >
            <div>
              <span className="text-[17px]" style={{ color: 'var(--ios-label)' }}>
                Show Furigana
              </span>
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--ios-secondary-label)' }}>
                Show reading above kanji in exercises
              </p>
            </div>
            <button
              role="switch"
              aria-checked={showFurigana}
              aria-label="Toggle furigana"
              onClick={() => setShowFurigana(!showFurigana)}
              className="relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors"
              style={{
                background: showFurigana ? 'var(--ios-green)' : 'var(--ios-fill)',
              }}
            >
              <span
                className="absolute top-[2px] left-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-sm transition-transform"
                style={{
                  transform: showFurigana ? 'translateX(20px)' : 'translateX(0)',
                }}
              />
            </button>
          </div>
        </div>

        {/* Audio section */}
        <p
          className="mt-8 mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          Audio
        </p>
        <div
          className="rounded-[10px] px-4"
          style={{ background: 'var(--ios-bg-grouped-secondary)' }}
        >
          <div className="flex items-center justify-between py-[11px]">
            <span
              className="text-[17px]"
              style={{ color: 'var(--ios-label)' }}
            >
              Sound Effects
            </span>
            <button
              role="switch"
              aria-checked={audio}
              aria-label="Toggle audio"
              onClick={() => setAudio(!audio)}
              className="relative h-[31px] w-[51px] rounded-full transition-colors"
              style={{
                background: audio ? 'var(--ios-green)' : 'var(--ios-fill)',
              }}
            >
              <span
                className="absolute top-[2px] left-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-sm transition-transform"
                style={{
                  transform: audio ? 'translateX(20px)' : 'translateX(0)',
                }}
              />
            </button>
          </div>
        </div>

        {/* Daily plan size section */}
        <p
          className="mt-8 mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          Daily Plan Size
        </p>
        <div
          className="rounded-[10px] p-4"
          style={{ background: 'var(--ios-bg-grouped-secondary)' }}
        >
          <SegmentedControl
            options={planSizeOptions}
            selected={planSize}
            onChange={(value) => setPlanSize(value as 'small' | 'medium' | 'large')}
          />
        </div>

        {/* Data & Privacy section */}
        <p
          className="mt-8 mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          Data & Privacy
        </p>
        {actionError && (
          <div className="mt-2 rounded-[10px] px-4 py-3" style={{ background: 'var(--ios-red)', color: 'white' }}>
            <p className="text-[15px]">{actionError}</p>
          </div>
        )}
        <div
          className="rounded-[10px] overflow-hidden"
          style={{ background: 'var(--ios-bg-grouped-secondary)' }}
        >
          {isLoggedIn && (
            <button
              onClick={handleExportData}
              disabled={exporting}
              className="w-full min-h-[44px] px-4 py-[11px] text-left text-[17px] active:opacity-60 disabled:opacity-50"
              style={{ color: 'var(--ios-blue)' }}
            >
              {exporting ? 'Exporting...' : 'Download My Data'}
            </button>
          )}
          <div style={isLoggedIn ? { borderTop: '0.5px solid var(--ios-separator)' } : undefined}>
            <button
              onClick={() => setShowResetModal(true)}
              className="w-full min-h-[44px] px-4 py-[11px] text-left text-[17px] active:opacity-60"
              style={{ color: 'var(--ios-red)' }}
            >
              Reset All Progress
            </button>
          </div>
          {isLoggedIn && (
            <div style={{ borderTop: '0.5px solid var(--ios-separator)' }}>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full min-h-[44px] px-4 py-[11px] text-left text-[17px] active:opacity-60"
                style={{ color: 'var(--ios-red)' }}
              >
                Delete My Account
              </button>
            </div>
          )}
        </div>

        {/* About section */}
        <p
          className="mt-8 mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          App
        </p>
        <div
          className="rounded-[10px] overflow-hidden"
          style={{ background: 'var(--ios-bg-grouped-secondary)' }}
        >
          <button
            onClick={() => navigate('/about')}
            className="w-full min-h-[44px] px-4 py-[11px] text-left flex items-center justify-between active:opacity-60"
          >
            <span className="text-[17px]" style={{ color: 'var(--ios-label)' }}>
              About Keiro
            </span>
            <span className="text-[17px]" style={{ color: 'var(--ios-tertiary-label)' }}>
              ›
            </span>
          </button>
        </div>

        <p
          className="mt-8 mb-6 text-center text-[13px]"
          style={{ color: 'var(--ios-tertiary-label)' }}
        >
          Keiro (経路) — Learn Japanese
        </p>
      </PageContainer>

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
