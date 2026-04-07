import { useNavigate } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { getAllModules } from '@keiro/content';
import { getCurrentModule, getModuleStatus } from '@keiro/engine';
import { BottomNav } from '../components/layout/BottomNav';
import { ProgressBar } from '../components/common/ProgressBar';
import { useProgress } from '../hooks/useProgress';
import { useDailyPlan } from '../hooks/useDailyPlan';
import { useStreak } from '../hooks/useStreak';
import { db } from '../services/db';

const ZEN_QUOTES = [
  { jp: '善は急げ', en: 'Strike while the iron is hot.' },
  { jp: '継続は力なり', en: 'Persistence is power.' },
  { jp: '七転び八起き', en: 'Fall seven times, stand up eight.' },
  { jp: '一期一会', en: 'One chance in a lifetime.' },
  { jp: '石の上にも三年', en: 'Perseverance prevails.' },
];

function getQuoteOfDay() {
  const day = Math.floor(Date.now() / 86400000);
  return ZEN_QUOTES[day % ZEN_QUOTES.length];
}

function getMilestoneMessage(streak: number): string | null {
  if (streak >= 100) return 'Incredible! 100 days of learning!';
  if (streak >= 30) return 'Amazing! A full month of study!';
  if (streak >= 7) return 'Great week of studying!';
  return null;
}

function getPlanIcon(type: string): string {
  switch (type) {
    case 'review': return 'history';
    case 'vocabulary': return 'translate';
    case 'kanji': return 'edit_note';
    case 'grammar': return 'menu_book';
    case 'reading': return 'auto_stories';
    case 'kana': return 'language_japanese_kana';
    default: return 'school';
  }
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

  const currentLevel = currentModule?.level ?? (totalCount > 0 && passedCount === totalCount ? null : 'beginner');
  const levelLabel = currentLevel ? (currentLevel === 'beginner' ? 'BEGINNER' : currentLevel.toUpperCase()) : 'COMPLETE';

  const levelModules = currentLevel ? allModules.filter((m) => m.level === currentLevel) : allModules;
  const levelPassedCount = levelModules.filter(
    (m) => getModuleStatus(m.id, allModules, progressMap) === 'passed'
  ).length;
  const levelTotalCount = levelModules.length;
  const levelPercent = levelTotalCount > 0 ? Math.round((levelPassedCount / levelTotalCount) * 100) : 0;

  const allModulesComplete = passedCount === totalCount && totalCount > 0;
  const milestone = getMilestoneMessage(streak);
  const quote = getQuoteOfDay();

  function handleStart() {
    if (!plan) return;
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

  // Build plan items for display
  const planItems: { icon: string; label: string; detail: string }[] = [];
  if (plan) {
    if (plan.reviewCount > 0) {
      planItems.push({ icon: 'history', label: 'Review', detail: `${plan.reviewCount} items` });
    }
    if (plan.modules.length > 0) {
      for (const modId of plan.modules) {
        const mod = allModules.find((m) => m.id === modId);
        if (mod) {
          planItems.push({
            icon: getPlanIcon(mod.type),
            label: mod.name,
            detail: `${mod.items?.length ?? 0} items`,
          });
        }
      }
    }
  }

  return (
    <>
      {/* TopAppBar */}
      <header
        className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16"
        style={{
          background: 'color-mix(in srgb, var(--k-surface) 90%, transparent)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <span className="font-headline text-lg font-bold tracking-tight" style={{ color: 'var(--k-primary)' }}>
          Keiro
        </span>
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center justify-center w-10 h-10 active:scale-90 transition-transform"
          style={{ color: 'var(--k-primary)' }}
          aria-label="Settings"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto space-y-8 pb-32">
        {/* Welcome Header */}
        <section className="space-y-1">
          <h1
            className="font-headline text-3xl font-black tracking-tighter"
            style={{ color: 'var(--k-primary)' }}
          >
            {quote.jp}
          </h1>
          <p className="text-sm" style={{ color: 'var(--k-secondary)' }}>
            {isComplete
              ? 'Well done today. Rest and return.'
              : allModulesComplete
                ? 'You have completed the path. Keep reviewing.'
                : 'Welcome back. Continue your mindful ascent.'}
          </p>
        </section>

        {/* Bento Grid: Streak & Level */}
        <div className="grid grid-cols-2 gap-4">
          {/* Streak Card */}
          <div
            className="p-6 rounded-xl flex flex-col justify-between aspect-square"
            style={{
              background: 'var(--k-surface-container-lowest)',
              border: '1px solid color-mix(in srgb, var(--k-outline-variant) 15%, transparent)',
            }}
          >
            <div className="flex justify-between items-start">
              <span
                className="material-symbols-outlined text-3xl"
                style={{ color: 'var(--k-primary)', fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: i < freezesAvailable
                        ? 'var(--k-primary)'
                        : 'color-mix(in srgb, var(--k-outline-variant) 30%, transparent)',
                    }}
                    aria-label={i < freezesAvailable ? 'Freeze available' : 'Freeze slot empty'}
                  />
                ))}
              </div>
            </div>
            <div>
              <div
                className="font-headline text-4xl font-bold"
                style={{ color: 'var(--k-primary)' }}
              >
                {streak} {streak === 1 ? 'day' : 'days'}
              </div>
              <div
                className="text-xs mt-1 uppercase tracking-widest font-bold"
                style={{ color: 'var(--k-secondary)' }}
              >
                Current Streak
              </div>
              {milestone && (
                <p className="text-xs mt-2 font-medium" style={{ color: 'var(--k-correct-secondary)' }}>
                  {milestone}
                </p>
              )}
            </div>
          </div>

          {/* Level Card */}
          <div
            className="p-6 rounded-xl flex flex-col justify-between"
            style={{ background: 'var(--k-surface-container-low)' }}
          >
            <div>
              <div
                className="text-xs uppercase tracking-widest font-bold mb-2"
                style={{ color: 'var(--k-secondary)' }}
              >
                Current Mastery
              </div>
              <div
                className="font-headline text-2xl font-bold"
                style={{ color: 'var(--k-primary)' }}
              >
                {levelLabel}
              </div>
            </div>
            <div className="space-y-2 mt-8">
              <div className="flex justify-between text-xs" style={{ color: 'var(--k-secondary)' }}>
                <span>Progress</span>
                <span>{levelPercent}%</span>
              </div>
              <ProgressBar value={levelPercent} />
            </div>
          </div>
        </div>

        {/* Leech Warning */}
        {leechCount > 0 && (
          <button
            onClick={() => navigate('/review/leeches')}
            className="w-full p-4 rounded-xl text-left active:scale-[0.98] transition-transform"
            style={{
              background: 'var(--k-surface-container-lowest)',
              border: '1px solid color-mix(in srgb, var(--k-outline-variant) 15%, transparent)',
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="material-symbols-outlined"
                style={{ color: 'var(--k-incorrect-bg)', fontVariationSettings: "'FILL' 1" }}
              >
                warning
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--k-primary)' }}>
                  {leechCount} difficult {leechCount === 1 ? 'item needs' : 'items need'} extra practice
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--k-secondary)' }}>
                  Tap to review
                </p>
              </div>
              <span className="material-symbols-outlined" style={{ color: 'var(--k-outline-variant)' }}>
                chevron_right
              </span>
            </div>
          </button>
        )}

        {allModulesComplete ? (
          /* All modules complete */
          <section
            className="p-6 rounded-xl text-center"
            style={{
              background: 'var(--k-surface-container-lowest)',
              border: '1px solid color-mix(in srgb, var(--k-outline-variant) 15%, transparent)',
            }}
          >
            <span
              className="material-symbols-outlined text-5xl mb-3 block"
              style={{ color: 'var(--k-correct-secondary)', fontVariationSettings: "'FILL' 1" }}
            >
              emoji_events
            </span>
            <p className="text-lg font-semibold" style={{ color: 'var(--k-primary)' }}>
              Path Complete
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--k-secondary)' }}>
              You've completed the entire path. Keep reviewing to stay sharp.
            </p>
            <button
              onClick={() => navigate('/review')}
              className="mt-6 w-full py-3 rounded-full font-bold text-sm active:scale-95 transition-transform"
              style={{ background: 'var(--k-surface-container-high)', color: 'var(--k-primary)' }}
            >
              Review
            </button>
          </section>
        ) : isComplete ? (
          /* Daily plan complete */
          <section
            className="p-6 rounded-xl text-center"
            style={{
              background: 'var(--k-surface-container-lowest)',
              border: '1px solid color-mix(in srgb, var(--k-outline-variant) 15%, transparent)',
            }}
          >
            <span
              className="material-symbols-outlined text-5xl mb-3 block"
              style={{ color: 'var(--k-correct-secondary)', fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <p className="font-headline text-xl font-bold" style={{ color: 'var(--k-primary)' }}>
              Day {streak} complete!
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--k-secondary)' }}>
              +1 day added to your streak
            </p>
            <div className="mt-6 space-y-3">
              {currentModule && (
                <button
                  onClick={handleKeepGoing}
                  className="w-full py-4 rounded-full font-bold text-sm active:scale-95 transition-transform"
                  style={{ background: 'var(--k-surface-container-highest)', color: 'var(--k-on-surface)' }}
                >
                  Keep studying
                </button>
              )}
              <button
                onClick={() => navigate('/review')}
                className="w-full py-3 text-sm font-semibold active:opacity-60"
                style={{ color: 'var(--k-primary)' }}
              >
                Review
              </button>
            </div>
          </section>
        ) : (
          /* Active daily plan */
          <>
            <section
              className="p-6 rounded-xl"
              style={{
                background: 'var(--k-surface-container-lowest)',
                border: '1px solid color-mix(in srgb, var(--k-outline-variant) 15%, transparent)',
              }}
            >
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="font-headline text-xl font-bold" style={{ color: 'var(--k-primary)' }}>
                    Your study plan for today
                  </h2>
                  <p className="text-xs mt-1" style={{ color: 'var(--k-secondary)' }}>
                    Consistency is the quiet path to mastery.
                  </p>
                </div>
                {plan && (
                  <div className="text-sm font-bold" style={{ color: 'var(--k-primary)' }}>
                    ~{plan.estimatedMinutes} min
                  </div>
                )}
              </div>

              {plan ? (
                <ul className="space-y-4">
                  {planItems.map((item, i) => (
                    <li key={i} className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--k-secondary-container)', color: 'var(--k-primary)' }}
                      >
                        <span className="material-symbols-outlined">{item.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold" style={{ color: 'var(--k-primary)' }}>
                          {item.label}
                        </div>
                        <div className="text-[11px]" style={{ color: 'var(--k-secondary)' }}>
                          {item.detail}
                        </div>
                      </div>
                      <span className="material-symbols-outlined" style={{ color: 'var(--k-outline-variant)' }}>
                        chevron_right
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm" style={{ color: 'var(--k-secondary)' }}>
                  Loading plan...
                </p>
              )}
            </section>

            {/* Primary CTA */}
            <button
              onClick={handleStart}
              disabled={!plan}
              className="w-full bg-silk-gradient text-white py-5 rounded-full font-bold text-lg active:scale-95 transition-transform shadow-lg disabled:opacity-50"
            >
              Start Daily Study
            </button>
          </>
        )}

        {/* Zen Quote */}
        <section className="pt-8 pb-4 flex justify-center">
          <div
            className="p-12 rounded-full aspect-square flex items-center justify-center"
            style={{ background: 'var(--k-surface-container)' }}
          >
            <p
              className="font-headline italic leading-relaxed max-w-[200px] text-center"
              style={{ color: 'var(--k-primary)' }}
            >
              "{quote.en}"
            </p>
          </div>
        </section>
      </main>

      <BottomNav />
    </>
  );
}
