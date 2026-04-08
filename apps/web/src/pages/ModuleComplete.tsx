import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import type { ModuleScore, SrsCard } from '@keiro/types';
import { getCurrentModule, createSrsCard } from '@keiro/engine';
import { getAllModules, getModuleById } from '@keiro/content';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';
import { TopBar } from '../components/layout/TopBar';
import { useProgress } from '../hooks/useProgress';
import { useDailyPlan } from '../hooks/useDailyPlan';
import { useStreak } from '../hooks/useStreak';
import { storage } from '../services/storage';
import { events } from '../services/analytics';

const SRS_CONTENT_TYPES = new Set(['vocabulary', 'grammar', 'kanji']);

function getItemId(item: unknown, moduleType: string): string {
  const obj = item as Record<string, unknown>;
  switch (moduleType) {
    case 'vocabulary': return String(obj.word ?? '');
    case 'kanji': return String(obj.kanji ?? '');
    case 'grammar': return String(obj.id ?? '');
    default: return String(obj.character ?? obj.word ?? obj.id ?? '');
  }
}

export function ModuleComplete() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { allProgress, updateProgress } = useProgress();
  const { plan, isComplete, markComplete } = useDailyPlan();
  const { streak } = useStreak();
  const [showMistakes, setShowMistakes] = useState(false);
  const hasRedirected = useRef(false);
  const srsCardsCreated = useRef(false);

  const score = location.state?.score as ModuleScore | undefined;
  const mod = getModuleById(moduleId!);

  useEffect(() => {
    if ((!score || !mod) && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate('/', { replace: true });
    }
  }, [score, mod, navigate]);

  useEffect(() => {
    if (score && mod) {
      events.moduleComplete(mod.id, score.score, score.passed);
    }
  }, [score, mod]);

  useEffect(() => {
    if (!score || !mod || !score.passed || srsCardsCreated.current) return;
    if (!SRS_CONTENT_TYPES.has(mod.type)) return;

    srsCardsCreated.current = true;

    async function createCards() {
      const contentType = mod!.type as SrsCard['contentType'];
      const cards: SrsCard[] = [];

      for (const item of mod!.items) {
        const itemId = getItemId(item, mod!.type);
        if (!itemId) continue;

        const cardId = `${mod!.id}-${itemId}`;
        const existing = await storage.getSrsCard(cardId);
        if (!existing) {
          cards.push(createSrsCard(itemId, mod!.id, contentType));
        }
      }

      if (cards.length > 0) {
        await storage.saveSrsCards(cards);
      }
    }

    createCards();
  }, [score, mod]);

  if (!score || !mod) return null;

  const passed = score.passed;

  async function handleMoveOn() {
    const allModules = getAllModules();
    const sorted = [...allModules].sort((a, b) => a.order - b.order);
    const completedIndex = sorted.findIndex((m) => m.id === moduleId);

    const progressMap = new Map(allProgress.map((p) => [p.moduleId, p]));
    const currentModule = getCurrentModule(allModules, progressMap);
    const currentIndex = currentModule
      ? sorted.findIndex((m) => m.id === currentModule.id)
      : sorted.length;

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

    await updateProgress({
      moduleId: moduleId!,
      status: 'passed',
      score: score!.score,
      completedAt: new Date().toISOString(),
      attempts: 1,
    });

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

    if (plan && !isComplete && plan.modules.includes(moduleId!)) {
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

  // Mistakes view
  if (showMistakes) {
    return (
      <>
        <TopBar title="Review Mistakes" onBack={() => setShowMistakes(false)} />
        <main className="pt-24 px-6 max-w-2xl mx-auto pb-32">
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: 'var(--k-surface-container-lowest)' }}
          >
            {score.mistakes.map((mistake, i) => (
              <div
                key={i}
                className="px-6 py-4"
                style={{
                  borderBottom: i < score.mistakes.length - 1
                    ? '1px solid var(--k-surface-container-high)'
                    : 'none',
                }}
              >
                <p className="font-semibold" style={{ color: 'var(--k-on-surface)' }}>
                  {mistake.exercise.question}
                </p>
                <p className="mt-1 text-sm" style={{ color: 'var(--k-error)' }}>
                  Your answer: {mistake.exercise.options[mistake.selectedIndex]}
                </p>
                <p className="mt-1 text-sm" style={{ color: 'var(--k-correct-secondary)' }}>
                  Correct: {mistake.exercise.options[mistake.exercise.correctIndex]}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 space-y-3">
            <PrimaryButton onClick={handleTryAgain}>Try again</PrimaryButton>
            <SecondaryButton onClick={() => setShowMistakes(false)}>Back</SecondaryButton>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="w-full max-w-2xl mx-auto px-6 pt-8 pb-32 flex flex-col items-center">
        {/* Hero */}
        <div
          className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-8 flex items-center justify-center"
          style={{ background: 'var(--k-surface-container-low)' }}
        >
          <div className="relative z-10 text-center px-4">
            <div
              className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full shadow-xl"
              style={{ background: 'var(--k-primary-container)', color: 'var(--k-on-primary-container)' }}
            >
              <span
                className="material-symbols-outlined text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {passed ? 'verified_user' : 'replay'}
              </span>
            </div>
            <h1
              className="font-headline text-4xl font-bold tracking-tight mb-2"
              style={{ color: 'var(--k-primary)' }}
            >
              {passed ? 'Module Complete!' : 'Keep Practicing'}
            </h1>
            <p className="font-medium tracking-wide" style={{ color: 'var(--k-secondary)' }}>
              {passed ? "You've reached a moment of clarity." : 'You need 80% to pass. Try again!'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 w-full mb-12">
          {[
            { label: 'Score', value: `${score.correctAnswers}/${score.totalQuestions}` },
            { label: 'Items', value: String(score.totalQuestions) },
            { label: 'Streak', value: `${streak} ${streak === 1 ? 'day' : 'days'}` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2"
              style={{
                background: 'var(--k-surface-container-lowest)',
                boxShadow: '0 4px 20px rgba(12, 46, 46, 0.04)',
              }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--k-secondary)' }}>
                {stat.label}
              </span>
              <span className="text-2xl font-bold" style={{ color: 'var(--k-primary)' }}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-4">
          {passed ? (
            <>
              <button
                onClick={handleMoveOn}
                className="w-full h-14 bg-silk-gradient text-white rounded-full font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <span>Continue to Path</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <SecondaryButton onClick={handleReview}>Review this module</SecondaryButton>
            </>
          ) : (
            <>
              <button
                onClick={handleTryAgain}
                className="w-full h-14 bg-silk-gradient text-white rounded-full font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <span>Try Again</span>
                <span className="material-symbols-outlined">replay</span>
              </button>
              <SecondaryButton onClick={() => setShowMistakes(true)}>Review Mistakes</SecondaryButton>
            </>
          )}
        </div>
      </main>
    </>
  );
}
