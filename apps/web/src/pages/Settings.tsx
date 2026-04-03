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
import { isSupported, getPermissionStatus } from '../services/notifications';

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
    reminderEnabled,
    reminderTime,
    theme,
    setAudio,
    setPlanSize,
    setReminderEnabled,
    setReminderTime,
    setTheme,
  } = useSettings();
  const { user, isLoggedIn, signOut } = useAuth();
  const [showResetModal, setShowResetModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

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

  async function handleReset() {
    await storage.resetAll();
    navigate('/welcome');
  }

  return (
    <>
      <TopBar title="Settings" onBack={() => navigate('/')} />
      <PageContainer>
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
          className="rounded-[10px] p-4"
          style={{ background: 'var(--ios-bg-grouped-secondary)' }}
        >
          <SegmentedControl
            options={themeOptions}
            selected={theme}
            onChange={(value) => setTheme(value as 'system' | 'light' | 'dark')}
          />
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

        {/* Reminders section — only show if Notification API is supported */}
        {isSupported() && (
          <>
            <p
              className="mt-8 mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
              style={{ color: 'var(--ios-secondary-label)' }}
            >
              Reminders
            </p>
            <div
              className="rounded-[10px]"
              style={{ background: 'var(--ios-bg-grouped-secondary)' }}
            >
              <div className="flex items-center justify-between px-4 py-[11px]">
                <span
                  className="text-[17px]"
                  style={{ color: 'var(--ios-label)' }}
                >
                  Daily Reminder
                </span>
                <button
                  role="switch"
                  aria-checked={reminderEnabled}
                  aria-label="Toggle daily reminder"
                  onClick={() => setReminderEnabled(!reminderEnabled)}
                  className="relative h-[31px] w-[51px] rounded-full transition-colors"
                  style={{
                    background: reminderEnabled
                      ? 'var(--ios-green)'
                      : 'var(--ios-fill)',
                  }}
                >
                  <span
                    className="absolute top-[2px] left-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-sm transition-transform"
                    style={{
                      transform: reminderEnabled
                        ? 'translateX(20px)'
                        : 'translateX(0)',
                    }}
                  />
                </button>
              </div>
              {reminderEnabled && (
                <div
                  className="flex items-center justify-between px-4 py-[11px]"
                  style={{
                    borderTop: '0.5px solid var(--ios-separator)',
                  }}
                >
                  <span
                    className="text-[17px]"
                    style={{ color: 'var(--ios-label)' }}
                  >
                    Reminder Time
                  </span>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="text-[17px] bg-transparent border-none outline-none text-right"
                    style={{ color: 'var(--ios-blue)' }}
                  />
                </div>
              )}
              {getPermissionStatus() === 'denied' && (
                <div
                  className="px-4 py-[11px]"
                  style={{
                    borderTop: '0.5px solid var(--ios-separator)',
                  }}
                >
                  <p
                    className="text-[13px]"
                    style={{ color: 'var(--ios-secondary-label)' }}
                  >
                    Notifications are blocked. Enable them in your browser or
                    device settings.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

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

        {/* Reset section */}
        <p
          className="mt-8 mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          Data
        </p>
        <div
          className="rounded-[10px] overflow-hidden"
          style={{ background: 'var(--ios-bg-grouped-secondary)' }}
        >
          <button
            onClick={() => setShowResetModal(true)}
            className="w-full min-h-[44px] px-4 py-[11px] text-left text-[17px] active:opacity-60"
            style={{ color: 'var(--ios-red)' }}
          >
            Reset All Progress
          </button>
        </div>

        {/* Content Sources section */}
        <p
          className="mt-8 mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          Content Sources
        </p>
        <div
          className="rounded-[10px] overflow-hidden"
          style={{ background: 'var(--ios-bg-grouped-secondary)' }}
        >
          {[
            {
              name: 'Vocabulary data',
              source: 'open-anki-jlpt-decks',
              license: 'MIT License',
              url: 'https://github.com/jamsinclair/open-anki-jlpt-decks',
            },
            {
              name: 'Kanji data',
              source: 'kanji-data by David Gouveia',
              license: 'MIT License',
              url: 'https://github.com/davidluzgouveia/kanji-data',
            },
            {
              name: 'Grammar data',
              source: 'hanabira.org',
              license: 'CC Attribution',
              url: 'https://github.com/tristcoil/hanabira.org-japanese-content',
            },
            {
              name: 'Kanji details',
              source: 'KANJIDIC2 (EDRDG)',
              license: 'CC BY-SA 4.0',
              url: 'https://www.edrdg.org/wiki/index.php/KANJIDIC_Project',
            },
            {
              name: 'Kana data',
              source: 'Japanese-JSON by merwan7',
              license: 'MIT License',
              url: 'https://github.com/merwan7/Japanese-JSON',
            },
          ].map((item, i, arr) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-[11px] min-h-[44px] active:opacity-60"
              style={{
                borderBottom: i < arr.length - 1 ? '0.5px solid var(--ios-separator)' : 'none',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[17px]" style={{ color: 'var(--ios-label)' }}>
                    {item.name}
                  </p>
                  <p className="text-[13px] mt-0.5" style={{ color: 'var(--ios-secondary-label)' }}>
                    {item.source} · {item.license}
                  </p>
                </div>
                <span className="text-[17px]" style={{ color: 'var(--ios-tertiary-label)' }}>
                  ›
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* App info */}
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
    </>
  );
}
