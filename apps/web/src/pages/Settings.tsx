import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageContainer } from '../components/layout/PageContainer';
import { TopBar } from '../components/layout/TopBar';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { Modal } from '../components/common/Modal';
import { useSettings } from '../hooks/useSettings';
import { storage } from '../services/storage';

const planSizeOptions = [
  { label: 'Small (~10 min)', value: 'small' },
  { label: 'Medium (~20 min)', value: 'medium' },
  { label: 'Large (~30 min)', value: 'large' },
];

export function Settings() {
  const navigate = useNavigate();
  const { audio, planSize, setAudio, setPlanSize } = useSettings();
  const [showResetModal, setShowResetModal] = useState(false);

  async function handleReset() {
    await storage.resetAll();
    navigate('/welcome');
  }

  return (
    <>
      <TopBar title="Settings" onBack={() => navigate('/')} />
      <PageContainer>
        {/* Audio section */}
        <p
          className="mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
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
