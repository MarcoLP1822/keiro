import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import type { ModuleScore } from '@keiro/types';
import { getCurrentModule } from '@keiro/engine';
import { getAllModules, getModuleById } from '@keiro/content';
import { PageContainer } from '../components/layout/PageContainer';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';
import { useProgress } from '../hooks/useProgress';
import { useDailyPlan } from '../hooks/useDailyPlan';

export function ModuleComplete() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { allProgress, updateProgress } = useProgress();
  const { plan, markComplete } = useDailyPlan();
  const [showMistakes, setShowMistakes] = useState(false);
  const hasRedirected = useRef(false);

  const score = location.state?.score as ModuleScore | undefined;
  const mod = getModuleById(moduleId!);

  // Redirect if no score/module - use useEffect instead of during render
  useEffect(() => {
    if ((!score || !mod) && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate('/', { replace: true });
    }
  }, [score, mod, navigate]);

  if (!score || !mod) {
    return null;
  }

  const passed = score.passed;
  const itemCount = score.totalQuestions;

  async function handleMoveOn() {
    const allModules = getAllModules();
    const sorted = [...allModules].sort((a, b) => a.order - b.order);
    const completedIndex = sorted.findIndex((m) => m.id === moduleId);

    // Determine the current position before this completion
    const progressMap = new Map(allProgress.map((p) => [p.moduleId, p]));
    const currentModule = getCurrentModule(allModules, progressMap);
    const currentIndex = currentModule
      ? sorted.findIndex((m) => m.id === currentModule.id)
      : sorted.length;

    // Skip-ahead: if the completed module is ahead of current position,
    // mark all intermediate modules as passed too (UX spec Flow 4, step 4a)
    if (completedIndex > currentIndex) {
      for (let i = currentIndex; i < completedIndex; i++) {
        await updateProgress({
          moduleId: sorted[i].id,
          status: 'passed',
          score: null,
          completedAt: new Date().toISOString(),
          attempts: 0,
        });
      }
    }

    // Mark the completed module as passed
    await updateProgress({
      moduleId: moduleId!,
      status: 'passed',
      score: score!.score,
      completedAt: new Date().toISOString(),
      attempts: 1,
    });

    // Unlock the next module after the completed one
    const nextModule = sorted[completedIndex + 1];
    if (nextModule) {
      await updateProgress({
        moduleId: nextModule.id,
        status: 'available',
        score: null,
        completedAt: null,
        attempts: 0,
      });
    }

    // Mark daily plan as complete if this module was in it
    if (plan && plan.modules.includes(moduleId!)) {
      await markComplete();
    }

    navigate('/');
  }

  function handleReview() {
    navigate(`/study/${moduleId}/exercises?mode=review`);
  }

  function handleTryAgain() {
    navigate(`/study/${moduleId}/exercises`);
  }

  function handleReviewMistakes() {
    setShowMistakes(true);
  }

  // Show mistakes read-only view
  if (showMistakes) {
    return (
      <PageContainer>
        <h1 className="text-xl font-bold">Review Mistakes</h1>
        <div className="mt-4 space-y-4">
          {score.mistakes.map((mistake, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 p-4"
            >
              <p className="text-lg font-semibold">{mistake.exercise.question}</p>
              <p className="mt-1 text-error">
                Your answer: {mistake.exercise.options[mistake.selectedIndex]}
              </p>
              <p className="mt-1 text-success">
                Correct: {mistake.exercise.options[mistake.exercise.correctIndex]}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <PrimaryButton onClick={handleTryAgain}>Try again</PrimaryButton>
        </div>
        <div className="mt-3">
          <SecondaryButton onClick={() => setShowMistakes(false)}>Back</SecondaryButton>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        {/* Large score */}
        <span
          className="text-6xl font-bold"
          aria-label={`Score: ${score.score} percent. ${passed ? 'You passed.' : 'You did not pass.'}`}
        >
          {score.score}%
        </span>

        {/* Score bar */}
        <div className="mt-6 w-full">
          <ScoreBar value={score.score} passed={passed} />
        </div>

        {/* Module name */}
        <h1 className="mt-6 text-xl font-semibold">{mod.name}</h1>
        <p className="mt-1 text-gray-500">{itemCount} items covered</p>

        {/* Action buttons */}
        <div className="mt-10 w-full space-y-3">
          {passed ? (
            <>
              <PrimaryButton onClick={handleMoveOn}>Move on</PrimaryButton>
              <SecondaryButton onClick={handleReview}>Review this module</SecondaryButton>
            </>
          ) : (
            <>
              <PrimaryButton onClick={handleTryAgain}>Try again</PrimaryButton>
              <SecondaryButton onClick={handleReviewMistakes}>Review mistakes</SecondaryButton>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

function ScoreBar({ value, passed }: { value: number; passed: boolean }) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className="h-3 w-full rounded-full bg-gray-200"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Score: ${clamped}%`}
    >
      <div
        className={`h-full rounded-full transition-all duration-300 ${passed ? 'bg-success' : 'bg-orange-500'}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
