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
        {/* Audio toggle */}
        <div className="flex items-center justify-between py-4">
          <span className="text-base font-medium">Audio</span>
          <button
            role="switch"
            aria-checked={audio}
            aria-label="Toggle audio"
            onClick={() => setAudio(!audio)}
            className={`relative h-8 w-14 rounded-full transition-colors ${
              audio ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                audio ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Daily plan size */}
        <div className="py-4">
          <p className="mb-3 text-base font-medium">Daily plan size</p>
          <SegmentedControl
            options={planSizeOptions}
            selected={planSize}
            onChange={(value) => setPlanSize(value as 'small' | 'medium' | 'large')}
          />
        </div>

        {/* Divider */}
        <hr className="my-4 border-gray-200" />

        {/* Reset all progress */}
        <button
          onClick={() => setShowResetModal(true)}
          className="min-h-[44px] w-full rounded-xl border-2 border-error px-4 py-3 font-semibold text-error active:scale-[0.98]"
        >
          Reset all progress
        </button>
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
