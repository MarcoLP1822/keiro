import { useNavigate } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { getAllModules } from '@keiro/content';
import { getCurrentModule, getModuleStatus } from '@keiro/engine';
import { PageContainer } from '../components/layout/PageContainer';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';
import { ProgressBar } from '../components/common/ProgressBar';
import { useProgress } from '../hooks/useProgress';
import { useDailyPlan } from '../hooks/useDailyPlan';
import { useStreak } from '../hooks/useStreak';
import { db } from '../services/db';

function KanaIcon() {
  return (
    <span className="text-[18px] font-bold leading-none" style={{ fontFamily: 'system-ui' }}>あ</span>
  );
}

function MapIcon() {
  return (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-11.307L12 2.25 8.497 5.693A3.75 3.75 0 006.75 8.25v9a3.75 3.75 0 003.75 3.75h3a3.75 3.75 0 003.75-3.75v-9a3.75 3.75 0 00-1.747-3.057z" />
    </svg>
  );
}

function StatsIcon() {
  return (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87a6.714 6.714 0 01.636.357c.31.212.692.294 1.058.196l1.25-.365a1.14 1.14 0 011.316.505l1.296 2.244a1.14 1.14 0 01-.205 1.435l-1.037.916c-.282.249-.429.625-.414 1.011.009.232.009.463 0 .695-.015.386.132.762.414 1.011l1.037.916c.424.374.53.998.205 1.435l-1.296 2.244a1.14 1.14 0 01-1.316.505l-1.25-.365c-.366-.098-.748-.016-1.058.196a6.714 6.714 0 01-.636.357c-.332.184-.582.496-.645.87l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.212-1.282c-.063-.373-.313-.685-.645-.869a6.72 6.72 0 01-.636-.357c-.31-.212-.692-.294-1.058-.196l-1.25.365a1.14 1.14 0 01-1.316-.505l-1.296-2.244a1.14 1.14 0 01.205-1.435l1.037-.916c.282-.249.429-.625.414-1.011a6.613 6.613 0 010-.695c.015-.386-.132-.762-.414-1.011l-1.037-.916a1.14 1.14 0 01-.205-1.435l1.296-2.244a1.14 1.14 0 011.316-.505l1.25.365c.366.098.748.016 1.058-.196.2-.13.424-.248.636-.357.332-.184.582-.496.645-.87l.213-1.28z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function getMilestoneMessage(streak: number): string | null {
  if (streak >= 100) return 'Incredible! 100 days of learning!';
  if (streak >= 30) return 'Amazing! A full month of study!';
  if (streak >= 7) return 'Great week of studying!';
  return null;
}

function StreakCard({ streak, freezesAvailable }: { streak: number; freezesAvailable: number }) {
  const milestone = getMilestoneMessage(streak);

  return (
    <div
      className="rounded-[10px] p-4 mb-4"
      style={{ background: 'var(--ios-bg-grouped-secondary)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {streak > 0 ? (
            <>
              <span className="text-[28px] leading-none" aria-hidden="true">🔥</span>
              <span
                className="text-[22px] font-bold"
                style={{ color: 'var(--ios-label)' }}
              >
                {streak}
              </span>
              <span
                className="text-[15px]"
                style={{ color: 'var(--ios-secondary-label)' }}
              >
                {'day streak'}
              </span>
            </>
          ) : (
            <span
              className="text-[15px] font-medium"
              style={{ color: 'var(--ios-secondary-label)' }}
            >
              Start your streak!
            </span>
          )}
        </div>
        {/* Freeze dots */}
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="text-[14px]"
              style={{ opacity: i < freezesAvailable ? 1 : 0.25 }}
              aria-label={i < freezesAvailable ? 'Freeze available' : 'Freeze slot empty'}
            >
              ❄️
            </span>
          ))}
        </div>
      </div>
      {milestone && (
        <p
          className="text-[13px] mt-2"
          style={{ color: 'var(--ios-orange)' }}
        >
          {milestone}
        </p>
      )}
    </div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const { allProgress } = useProgress();
  const { plan, isComplete } = useDailyPlan();
  const { streak, freezesAvailable } = useStreak();
  const leechCount = useLiveQuery(
    () => db.srsCards.where('isLeech').equals(1).count(),
    [],
  ) ?? 0;

  const allModules = getAllModules();
  const passedCount = allProgress.filter((p) => p.status === 'passed').length;
  const totalCount = allModules.length;

  const progressMap = new Map(allProgress.map((p) => [p.moduleId, p]));
  const currentModule = getCurrentModule(allModules, progressMap);

  // Current level: from the active module, or 'complete' if all done
  const currentLevel = currentModule?.level ?? (totalCount > 0 && passedCount === totalCount ? null : 'beginner');
  const levelLabel = currentLevel ? (currentLevel === 'beginner' ? 'BEGINNER' : currentLevel.toUpperCase()) : 'COMPLETE';

  // Count modules in the current level
  const levelModules = currentLevel ? allModules.filter((m) => m.level === currentLevel) : allModules;
  const levelPassedCount = levelModules.filter(
    (m) => getModuleStatus(m.id, allModules, progressMap) === 'passed'
  ).length;
  const levelTotalCount = levelModules.length;
  const levelPercent = levelTotalCount > 0 ? Math.round((levelPassedCount / levelTotalCount) * 100) : 0;

  // Find next section after the current module's type
  const TYPE_ORDER = ['kana', 'vocabulary', 'kanji', 'grammar', 'reading'];
  const currentType = currentModule?.type;
  const nextSectionName = (() => {
    if (!currentModule) return null;
    // Find next type with modules not yet fully passed in current level
    const idx = TYPE_ORDER.indexOf(currentType ?? '');
    for (let i = idx + 1; i < TYPE_ORDER.length; i++) {
      const t = TYPE_ORDER[i];
      const hasIncomplete = levelModules.some(
        (m) => m.type === t && getModuleStatus(m.id, allModules, progressMap) !== 'passed'
      );
      if (hasIncomplete) {
        const label: Record<string, string> = {
          kana: 'Kana', vocabulary: 'Vocabulary', kanji: 'Kanji', grammar: 'Grammar', reading: 'Reading',
        };
        return label[t] ?? t;
      }
    }
    return null;
  })();

  function handleStart() {
    if (!plan) return;
    // If there are SRS reviews, go to review session first
    if (plan.reviewCards.length > 0) {
      navigate('/review/srs', { state: { cardIds: plan.reviewCards } });
    } else if (plan.modules.length > 0) {
      navigate(`/study/${plan.modules[0]}/intro`);
    }
  }

  function handleKeepGoing() {
    if (currentModule) {
      navigate(`/study/${currentModule.id}/intro`);
    }
  }

  const allModulesComplete = passedCount === totalCount && totalCount > 0 && levelPassedCount === levelTotalCount;

  return (
    <>
      {/* iOS large-title navigation bar */}
      <header
        className="sticky top-0 z-10 flex h-[44px] items-center justify-between px-4"
        style={{
          background: 'var(--ios-bg-grouped)',
          borderBottom: '0.5px solid var(--ios-separator)',
        }}
      >
        <button
          onClick={() => navigate('/path')}
          className="flex h-[44px] w-[44px] items-center justify-center active:opacity-60"
          style={{ color: 'var(--ios-blue)' }}
          aria-label="Path Map"
        >
          <MapIcon />
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate('/kana-chart')}
            className="flex h-[44px] w-[44px] items-center justify-center active:opacity-60"
            style={{ color: 'var(--ios-blue)' }}
            aria-label="Kana Chart"
          >
            <KanaIcon />
          </button>
          <button
            onClick={() => navigate('/stats')}
            className="flex h-[44px] w-[44px] items-center justify-center active:opacity-60"
            style={{ color: 'var(--ios-blue)' }}
            aria-label="Statistics"
          >
            <StatsIcon />
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="flex h-[44px] w-[44px] items-center justify-center active:opacity-60"
            style={{ color: 'var(--ios-blue)' }}
            aria-label="Settings"
          >
            <SettingsIcon />
          </button>
        </div>
      </header>

      <PageContainer>
        {/* Large title */}
        <h1
          className="text-[34px] font-bold tracking-tight mb-6"
          style={{ color: 'var(--ios-label)' }}
        >
          Keiro
        </h1>

        {/* Streak card */}
        <StreakCard streak={streak} freezesAvailable={freezesAvailable} />

        {/* Leech warning */}
        {leechCount > 0 && (
          <button
            onClick={() => navigate('/review/leeches')}
            className="w-full rounded-[10px] p-4 mb-4 text-left active:opacity-60"
            style={{ background: 'var(--ios-bg-grouped-secondary)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] font-medium" style={{ color: 'var(--ios-orange)' }}>
                  {leechCount} difficult {leechCount === 1 ? 'item needs' : 'items need'} extra practice
                </p>
                <p className="text-[13px] mt-0.5" style={{ color: 'var(--ios-secondary-label)' }}>
                  Tap to review
                </p>
              </div>
              <span className="text-[17px]" style={{ color: 'var(--ios-tertiary-label)' }}>
                ›
              </span>
            </div>
          </button>
        )}

        {/* Level progress card */}
        <div
          className="rounded-[10px] p-4"
          style={{ background: 'var(--ios-bg-grouped-secondary)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <p
              className="text-[20px] font-semibold tracking-tight"
              style={{ color: 'var(--ios-label)' }}
            >
              {levelLabel}
            </p>
            <p
              className="text-[15px] font-medium tabular-nums"
              style={{ color: 'var(--ios-secondary-label)' }}
            >
              {levelPercent}%
            </p>
          </div>
          <ProgressBar value={levelPercent} />
          <div className="mt-3 flex items-center justify-between">
            <p
              className="text-[13px]"
              style={{ color: 'var(--ios-secondary-label)' }}
            >
              {levelPassedCount} of {levelTotalCount} modules complete
            </p>
            {nextSectionName && (
              <p
                className="text-[13px]"
                style={{ color: 'var(--ios-secondary-label)' }}
              >
                Next: {nextSectionName}
              </p>
            )}
          </div>
        </div>

        {allModulesComplete ? (
          /* All modules complete state */
          <div className="mt-6">
            <div
              className="rounded-[10px] p-5 text-center"
              style={{ background: 'var(--ios-bg-grouped-secondary)' }}
            >
              <p
                className="text-[17px] leading-relaxed"
                style={{ color: 'var(--ios-label)' }}
              >
                Congratulations! You've completed the entire path. You're ready to read manga. Keep reviewing to stay sharp.
              </p>
            </div>
            <div className="mt-6">
              <button
                onClick={() => navigate('/review')}
                className="w-full py-3 text-[17px] font-normal active:opacity-60"
                style={{ color: 'var(--ios-blue)' }}
              >
                Review
              </button>
            </div>
          </div>
        ) : isComplete ? (
          /* Daily plan complete state */
          <div className="mt-6">
            <div
              className="rounded-[10px] p-5 text-center"
              style={{ background: 'var(--ios-bg-grouped-secondary)' }}
            >
              <span
                className="text-[40px] leading-none block mb-2"
                style={{ color: 'var(--ios-green)' }}
                aria-hidden="true"
              >
                &#10003;
              </span>
              <p
                className="text-[17px] font-semibold"
                style={{ color: 'var(--ios-label)' }}
              >
                Day {streak} complete!
              </p>
              <p
                className="text-[15px] mt-1"
                style={{ color: 'var(--ios-secondary-label)' }}
              >
                +1 day added to your streak
              </p>
            </div>
            <div className="mt-6 space-y-3">
              {currentModule && (
                <SecondaryButton onClick={handleKeepGoing}>
                  Keep studying
                </SecondaryButton>
              )}
              <button
                onClick={() => navigate('/review')}
                className="w-full py-3 text-[17px] font-normal active:opacity-60"
                style={{ color: 'var(--ios-blue)' }}
              >
                Review
              </button>
            </div>
          </div>
        ) : (
          /* Active daily plan state */
          <>
            {/* Section header */}
            <p
              className="mt-8 mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
              style={{ color: 'var(--ios-secondary-label)' }}
            >
              Today's Plan
            </p>

            {/* Today's Plan card */}
            <div
              className="rounded-[10px] p-4"
              style={{ background: 'var(--ios-bg-grouped-secondary)' }}
            >
              {plan ? (
                <ul className="space-y-2">
                  {plan.reviewCount > 0 && (
                    <li
                      className="text-[17px]"
                      style={{ color: 'var(--ios-label)' }}
                    >
                      {plan.reviewCount} items to review
                    </li>
                  )}
                  {plan.newItemCount > 0 && (
                    <li
                      className="text-[17px]"
                      style={{ color: 'var(--ios-label)' }}
                    >
                      {plan.newItemCount} new items
                    </li>
                  )}
                  <li
                    className="text-[17px]"
                    style={{ color: 'var(--ios-label)' }}
                  >
                    ~{plan.estimatedMinutes} min session
                  </li>
                </ul>
              ) : (
                <p
                  className="text-[17px]"
                  style={{ color: 'var(--ios-secondary-label)' }}
                >
                  Loading plan...
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <PrimaryButton onClick={handleStart} disabled={!plan}>
                Start
              </PrimaryButton>
              <button
                onClick={() => navigate('/review')}
                className="w-full py-3 text-[17px] font-normal active:opacity-60"
                style={{ color: 'var(--ios-blue)' }}
              >
                Review
              </button>
            </div>
          </>
        )}
      </PageContainer>
    </>
  );
}
