import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import type { SentenceItem } from '@keiro/types';
import { ExerciseRenderer } from '../components/exercise/ExerciseRenderer';
import { ReadingMoment } from '../components/reading/ReadingMoment';
import { Modal } from '../components/common/Modal';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { PageContainer } from '../components/layout/PageContainer';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useStudySession } from '../hooks/useStudySession';
import { useDailyPlan } from '../hooks/useDailyPlan';
import { getModuleById } from '@keiro/content';
import { useSettings } from '../hooks/useSettings';

const STEP_TRANSITION_MESSAGES: Record<string, string> = {
  read: 'Now let\'s read!',
  comprehend: 'Let\'s check your understanding',
  learn: 'Time to learn!',
  review: 'Let\'s warm up with a review',
};

export function StudyExercises() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showExitModal, setShowExitModal] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const hasNavigated = useRef(false);
  const { showFurigana } = useSettings();

  const mode = searchParams.get('mode') === 'review' ? 'review' : 'study';

  // Determine if the current module is thematic so we can pass sessionPlan
  const module = moduleId ? getModuleById(moduleId) : undefined;
  const isThematic = module?.type === 'thematic';

  // Get session plan from daily plan hook (only used for thematic modules)
  const { sessionPlan } = useDailyPlan();
  const planForSession = isThematic ? (sessionPlan ?? undefined) : undefined;

  const { exercises, isReady, score, handleComplete, currentStep, currentStepIndex } =
    useStudySession(moduleId!, mode, planForSession);

  // Show transition screen when step index advances (but not for the very first step)
  const prevStepIndexRef = useRef<number>(0);
  useEffect(() => {
    if (currentStepIndex > 0 && currentStepIndex !== prevStepIndexRef.current) {
      prevStepIndexRef.current = currentStepIndex;
      setShowTransition(true);
    }
  }, [currentStepIndex]);

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

  // Exit confirmation modal — rendered once, shared across all view states
  const exitModal = (
    <Modal
      isOpen={showExitModal}
      title="Exit session?"
      body="Progress for this exercise set will be lost."
      primaryLabel="Exit"
      secondaryLabel="Keep studying"
      onPrimary={confirmExit}
      onSecondary={cancelExit}
    />
  );

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
        {exitModal}
      </PageContainer>
    );
  }

  if (!isReady) return <LoadingSpinner className="min-h-screen" />;

  // Cooldown step: render ReadingMoment instead of exercises
  if (currentStep?.type === 'cooldown' && exercises.length > 0) {
    const cooldownExercise = exercises[0];
    // The targetItem on a sentence-reading exercise is the SentenceItem
    const sentence = cooldownExercise.targetItem as SentenceItem;
    return (
      <PageContainer>
        <ReadingMoment
          sentence={sentence}
          showFurigana={showFurigana}
          onContinue={() => handleComplete([])}
        />
        {exitModal}
      </PageContainer>
    );
  }

  // Step transition interstitial
  if (showTransition && currentStep) {
    const message = STEP_TRANSITION_MESSAGES[currentStep.type] ?? `${currentStep.label}`;
    return (
      <PageContainer>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center gap-8 px-6">
          <h2
            className="font-headline text-2xl font-bold"
            style={{ color: 'var(--k-primary)' }}
          >
            {message}
          </h2>
          <p
            className="text-sm"
            style={{ color: 'var(--k-secondary)' }}
          >
            {currentStep.label}
          </p>
          <button
            onClick={() => setShowTransition(false)}
            className="bg-silk-gradient text-white rounded-full h-14 px-10 font-semibold text-base w-full max-w-xs"
          >
            Continue
          </button>
        </div>
        {exitModal}
      </PageContainer>
    );
  }

  const stepLabel = currentStep ? currentStep.label : undefined;

  return (
    <>
      <ExerciseRenderer
        exercises={exercises}
        onComplete={handleComplete}
        onExit={handleExit}
        stepLabel={stepLabel}
      />
      {exitModal}
    </>
  );
}
