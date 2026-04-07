import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { ExerciseRenderer } from '../components/exercise/ExerciseRenderer';
import { Modal } from '../components/common/Modal';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { PageContainer } from '../components/layout/PageContainer';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useStudySession } from '../hooks/useStudySession';

export function StudyExercises() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showExitModal, setShowExitModal] = useState(false);
  const hasNavigated = useRef(false);

  const mode = searchParams.get('mode') === 'review' ? 'review' : 'study';
  const { exercises, isReady, score, handleComplete } = useStudySession(moduleId!, mode);

  // Navigate to complete screen when study mode exercises finish
  useEffect(() => {
    if (score !== null && mode === 'study' && !hasNavigated.current) {
      hasNavigated.current = true;
      navigate(`/study/${moduleId}/complete`, { state: { score }, replace: true });
    }
  }, [score, mode, moduleId, navigate]);

  function handleExit() {
    setShowExitModal(true);
  }

  function confirmExit() {
    setShowExitModal(false);
    navigate('/');
  }

  function cancelExit() {
    setShowExitModal(false);
  }

  // Study mode: waiting for useEffect to navigate
  if (score !== null && mode === 'study') {
    return null;
  }

  // Review mode: show completion message
  if (score !== null && mode === 'review') {
    return (
      <PageContainer>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <h1
            className="text-[22px] font-bold"
            style={{ color: 'var(--k-on-surface)' }}
          >
            Review complete!
          </h1>
          <p
            className="mt-2 text-[17px]"
            style={{ color: 'var(--k-secondary)' }}
          >
            Great job reviewing this module.
          </p>
          <div className="mt-8 w-full space-y-3">
            <PrimaryButton onClick={() => navigate('/review')}>
              Back to Review
            </PrimaryButton>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 text-[17px] font-normal active:opacity-60"
              style={{ color: 'var(--k-primary)' }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!isReady) return <LoadingSpinner className="min-h-screen" />;

  return (
    <>
      <ExerciseRenderer
        exercises={exercises}
        onComplete={handleComplete}
        onExit={handleExit}
      />
      <Modal
        isOpen={showExitModal}
        title="Exit session?"
        body="Progress for this exercise set will be lost."
        primaryLabel="Exit"
        secondaryLabel="Keep studying"
        onPrimary={confirmExit}
        onSecondary={cancelExit}
      />
    </>
  );
}
