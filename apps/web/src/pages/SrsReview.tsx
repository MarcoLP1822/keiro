import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import type { SrsGrade } from '@keiro/types';
import { TopBar } from '../components/layout/TopBar';
import { PageContainer } from '../components/layout/PageContainer';
import { QuestionDisplay } from '../components/exercise/QuestionDisplay';
import { AnswerOptions } from '../components/exercise/AnswerOptions';
import { GapFill } from '../components/exercise/GapFill';
import { TypingInput } from '../components/exercise/TypingInput';
import { SentenceOrder } from '../components/exercise/SentenceOrder';
import { ProgressCounter } from '../components/exercise/ProgressCounter';
import { SrsGradeButtons } from '../components/exercise/SrsGradeButtons';
import { getExerciseMode } from '../components/exercise';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { Modal } from '../components/common/Modal';
import { useReviewSession } from '../hooks/useReviewSession';
import { useSettings } from '../hooks/useSettings';
import { useDailyPlan } from '../hooks/useDailyPlan';
import { playCorrectSound, playIncorrectSound } from '../services/sounds';
import { vibrateSuccess, vibrateError } from '../services/haptics';
import { storage } from '../services/storage';
import { db } from '../services/db';

export function SrsReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { audio } = useSettings();
  const { plan } = useDailyPlan();

  const cardIds = (location.state?.cardIds as string[]) ?? [];
  const {
    currentExercise,
    currentIndex,
    totalCount,
    isReady,
    isComplete,
    handleGrade,
  } = useReviewSession(cardIds);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // useLiveQuery returns undefined while loading. We use null as sentinel for "key not found"
  const srsExplainerSeenRaw = useLiveQuery(
    () => db.settings.get('srsExplainerSeen').then((s) => (s ? (s.value as boolean) : null)),
  );
  const [explainerDismissed, setExplainerDismissed] = useState(false);

  // srsExplainerSeenRaw === undefined → still loading from Dexie
  // srsExplainerSeenRaw === null     → key never set (never seen)
  // srsExplainerSeenRaw === true     → already seen
  const showExplainer =
    !explainerDismissed &&
    srsExplainerSeenRaw !== undefined &&
    srsExplainerSeenRaw !== true;

  async function dismissExplainer() {
    setExplainerDismissed(true);
    await storage.setSetting('srsExplainerSeen', true);
  }

  const handleSelect = useCallback((index: number) => {
    if (showFeedback) return;
    if (!currentExercise) return;
    const isCorrect = index === currentExercise.correctIndex;
    if (audio) {
      if (isCorrect) playCorrectSound();
      else playIncorrectSound();
    }
    if (isCorrect) vibrateSuccess();
    else vibrateError();
    setSelectedIndex(index);
    setShowFeedback(true);
  }, [showFeedback, currentExercise, audio]);

  const handleTypingSubmit = useCallback((isCorrect: boolean) => {
    if (audio) {
      if (isCorrect) playCorrectSound();
      else playIncorrectSound();
    }
    if (isCorrect) vibrateSuccess();
    else vibrateError();
    setShowFeedback(true);
    setSelectedIndex(isCorrect ? 0 : -1);
  }, [audio]);

  const handleSentenceOrderSubmit = useCallback((isCorrect: boolean) => {
    if (audio) {
      if (isCorrect) playCorrectSound();
      else playIncorrectSound();
    }
    if (isCorrect) vibrateSuccess();
    else vibrateError();
    setShowFeedback(true);
    setSelectedIndex(isCorrect ? 0 : -1);
  }, [audio]);

  const handleGradeAndAdvance = useCallback(async (grade: SrsGrade) => {
    if (audio) {
      if (grade === 'wrong') playIncorrectSound();
      else playCorrectSound();
    }
    if (grade === 'wrong') vibrateError();
    else vibrateSuccess();
    await handleGrade(grade);
    setSelectedIndex(null);
    setShowFeedback(false);
  }, [handleGrade, audio]);

  // Review complete screen
  if (isComplete) {
    const hasNewModules = plan && plan.modules.length > 0;

    return (
      <PageContainer>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <h1
            className="text-[22px] font-bold"
            style={{ color: 'var(--k-on-surface)' }}
          >
            Reviews done!
          </h1>
          <p
            className="mt-2 text-[17px]"
            style={{ color: 'var(--k-secondary)' }}
          >
            You reviewed {totalCount} {totalCount === 1 ? 'item' : 'items'}.
          </p>
          <div className="mt-8 w-full space-y-3">
            {hasNewModules ? (
              <PrimaryButton onClick={() => navigate(`/study/${plan!.modules[0]}/intro`)}>
                Continue to new lesson
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={() => navigate('/')}>
                Back to Home
              </PrimaryButton>
            )}
            {hasNewModules && (
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 text-[17px] font-normal active:opacity-60"
                style={{ color: 'var(--k-primary)' }}
              >
                Back to Home
              </button>
            )}
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!isReady || !currentExercise) return <LoadingSpinner className="min-h-screen" />;

  const mode = getExerciseMode(currentExercise.type);

  const isCorrectForFeedback = mode === 'multiple-choice' || mode === 'gap-fill'
    ? selectedIndex === currentExercise.correctIndex
    : selectedIndex === 0;

  return (
    <>
      <TopBar
        onBack={() => setShowExitModal(true)}
        rightAction={
          <ProgressCounter current={currentIndex + 1} total={totalCount} />
        }
      />
      <PageContainer>
        {showExplainer && (
          <button
            onClick={dismissExplainer}
            className="w-full mb-4 text-left rounded-xl px-4 py-3 active:opacity-70"
            style={{ background: 'var(--k-surface-container-lowest)', border: '0.5px solid var(--k-outline-variant)' }}
          >
            <p className="text-[15px] font-semibold mb-0.5" style={{ color: 'var(--k-on-surface)' }}>
              How reviews work
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--k-secondary)' }}>
              Rate how well you remembered each item. Keiro uses your rating to schedule the next review at the right time — no cramming needed.
            </p>
            <p className="text-[13px] mt-1" style={{ color: 'var(--k-outline)' }}>
              Tap to dismiss
            </p>
          </button>
        )}

        {mode !== 'sentence-order' && (
          <QuestionDisplay exercise={currentExercise} audioEnabled={audio} />
        )}

        {mode === 'gap-fill' && currentExercise.sentenceWithGap ? (
          <GapFill
            sentence={currentExercise.sentenceWithGap}
            options={currentExercise.options}
            correctIndex={currentExercise.correctIndex}
            selectedIndex={selectedIndex}
            showFeedback={showFeedback}
            onSelect={handleSelect}
          />
        ) : mode === 'typing' && currentExercise.correctAnswer ? (
          <TypingInput
            correctAnswer={currentExercise.correctAnswer}
            onSubmit={handleTypingSubmit}
          />
        ) : mode === 'sentence-order' && currentExercise.scrambledWords && currentExercise.correctOrder ? (
          <>
            <QuestionDisplay exercise={currentExercise} audioEnabled={audio} />
            <SentenceOrder
              scrambledWords={currentExercise.scrambledWords}
              correctOrder={currentExercise.correctOrder}
              onSubmit={handleSentenceOrderSubmit}
            />
          </>
        ) : (
          <AnswerOptions
            options={currentExercise.options}
            onSelect={handleSelect}
            correctIndex={currentExercise.correctIndex}
            selectedIndex={selectedIndex}
            showFeedback={showFeedback}
          />
        )}

        {/* After answering, show feedback + SRS grade buttons instead of auto-advance */}
        {showFeedback && (
          <>
            <div
              role="status"
              aria-live="polite"
              className="flex items-center px-5 py-4 mt-6 rounded-xl"
              style={{
                background: isCorrectForFeedback ? 'var(--k-correct-secondary)' : 'var(--k-error)',
              }}
            >
              <p className="font-semibold text-[17px] text-white">
                {isCorrectForFeedback
                  ? 'Correct!'
                  : `Not quite \u2014 ${
                      mode === 'typing'
                        ? currentExercise.correctAnswer ?? ''
                        : mode === 'sentence-order'
                          ? currentExercise.correctOrder?.join('') ?? ''
                          : currentExercise.options[currentExercise.correctIndex]
                    }`}
              </p>
            </div>
            <SrsGradeButtons onGrade={handleGradeAndAdvance} />
          </>
        )}
      </PageContainer>

      <Modal
        isOpen={showExitModal}
        title="Exit review?"
        body="Your graded cards have already been saved."
        primaryLabel="Exit"
        secondaryLabel="Keep reviewing"
        onPrimary={() => navigate('/')}
        onSecondary={() => setShowExitModal(false)}
      />
    </>
  );
}
