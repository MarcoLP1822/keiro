import { useNavigate } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { TopBar } from '../components/layout/TopBar';
import { BottomNav } from '../components/layout/BottomNav';
import { ProgressBar } from '../components/common/ProgressBar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useStats } from '../hooks/useStats';
import { useStreak } from '../hooks/useStreak';
import { db } from '../services/db';

function CalendarHeatmap({
  studiedDates,
  freezeDates,
}: {
  studiedDates: Set<string>;
  freezeDates: Set<string>;
}) {
  const days: { date: string; status: 'studied' | 'freeze' | 'missed' }[] = [];
  const today = new Date();
  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const status = studiedDates.has(dateStr)
      ? 'studied'
      : freezeDates.has(dateStr)
        ? 'freeze'
        : 'missed';
    days.push({ date: dateStr, status });
  }

  return (
    <div className="grid grid-cols-7 gap-[6px]">
      {days.map(({ date, status }) => (
        <div
          key={date}
          className="w-full aspect-square rounded-full"
          style={{
            background: status === 'studied'
              ? 'var(--k-correct-secondary)'
              : status === 'freeze'
                ? 'var(--k-primary)'
                : 'var(--k-surface-container-high)',
          }}
          title={date}
          aria-label={`${date}: ${status}`}
        />
      ))}
    </div>
  );
}

const TYPE_JP: Record<string, string> = {
  kana: '仮名',
  vocabulary: '語彙',
  kanji: '漢字',
  grammar: '文法',
};

export function Stats() {
  const navigate = useNavigate();
  const stats = useStats();
  const { streak, longestStreak, freezesAvailable, freezesUsed } = useStreak();
  const allPlans = useLiveQuery(() => db.dailyPlan.toArray(), []);

  if (!stats) {
    return (
      <>
        <TopBar title="Statistics" onBack={() => navigate('/')} />
        <LoadingSpinner className="mt-20" />
      </>
    );
  }

  const {
    overallProgress,
    modulesCompleted,
    totalModules,
    itemsByType,
    srsStats,
  } = stats;

  const studiedDates = new Set(
    (allPlans ?? []).filter((p) => p.completed).map((p) => p.date),
  );
  const freezeDates = new Set(freezesUsed);

  let levelLabel = 'Beginner';
  if (overallProgress >= 80) levelLabel = 'N4';
  else if (overallProgress >= 40) levelLabel = 'N5';

  const totalItemsLearned =
    itemsByType.kana + itemsByType.vocabulary + itemsByType.kanji + itemsByType.grammar;

  // SRS bar chart data
  const srsMax = Math.max(srsStats.learning, srsStats.reviewing, srsStats.mastered, 1);
  const srsBars = [
    { label: 'LEARNING', count: srsStats.learning, opacity: 0.3 },
    { label: 'REVIEWING', count: srsStats.reviewing, opacity: 0.6 },
    { label: 'MASTERED', count: srsStats.mastered, opacity: 1 },
  ];

  return (
    <>
      <TopBar title="Keiro" onBack={() => navigate('/')} rightAction={
        <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--k-primary)' }}>
          {modulesCompleted}/{totalModules}
        </span>
      } />

      <main className="pt-24 px-6 max-w-2xl mx-auto space-y-6 pb-32">
        {/* Header */}
        <header>
          <h1 className="font-headline text-4xl font-bold tracking-tight" style={{ color: 'var(--k-primary)' }}>
            分析 <span className="text-lg font-normal ml-2" style={{ color: 'var(--k-secondary)' }}>— Statistics</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--k-on-surface-variant)' }}>
            A reflection of your linguistic journey and mindful growth.
          </p>
        </header>

        {/* Overall Progress */}
        <section
          className="p-8 rounded-xl space-y-6"
          style={{ background: 'var(--k-surface-container-lowest)' }}
        >
          <div className="flex justify-between items-end">
            <div>
              <h2 className="font-headline text-2xl" style={{ color: 'var(--k-primary)' }}>全体的な進捗</h2>
              <p className="text-sm" style={{ color: 'var(--k-secondary)' }}>Overall Progress</p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-extrabold" style={{ color: 'var(--k-primary)' }}>
                {overallProgress}<span className="text-lg font-medium">%</span>
              </span>
            </div>
          </div>
          <ProgressBar value={overallProgress} />
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--k-secondary)' }}>
            <span>{levelLabel}</span>
            <span>{modulesCompleted} of {totalModules} modules</span>
          </div>
        </section>

        {/* Items by Type + SRS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Items by Type */}
          <section
            className="p-8 rounded-xl space-y-6"
            style={{ background: 'var(--k-surface-container-low)' }}
          >
            <div>
              <h2 className="font-headline text-xl" style={{ color: 'var(--k-primary)' }}>タイプ別</h2>
              <p className="text-sm" style={{ color: 'var(--k-secondary)' }}>Items by Type</p>
            </div>
            {totalItemsLearned === 0 ? (
              <p className="text-sm" style={{ color: 'var(--k-secondary)' }}>
                Complete modules to start tracking
              </p>
            ) : (
              <div className="space-y-5">
                {Object.entries(itemsByType).map(([type, count]) => {
                  if (count === 0) return null;
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold" style={{ color: 'var(--k-on-surface)' }}>
                          {TYPE_JP[type] ?? type}{' '}
                          <span className="font-normal ml-1" style={{ color: 'var(--k-secondary)' }}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </span>
                        </span>
                        <span style={{ color: 'var(--k-on-surface)' }}>{count}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--k-surface-container-high)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ background: 'var(--k-primary)', width: `${Math.min(100, (count / 50) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* SRS */}
          <section
            className="p-8 rounded-xl flex flex-col justify-between"
            style={{ background: 'var(--k-surface-container-lowest)' }}
          >
            <div>
              <h2 className="font-headline text-xl" style={{ color: 'var(--k-primary)' }}>記憶の段階</h2>
              <p className="text-sm" style={{ color: 'var(--k-secondary)' }}>SRS Progression</p>
            </div>
            {srsStats.total === 0 ? (
              <p className="text-sm mt-4" style={{ color: 'var(--k-secondary)' }}>No SRS cards yet</p>
            ) : (
              <>
                <div className="flex items-end justify-between h-48 gap-3 mt-8">
                  {srsBars.map((bar) => (
                    <div key={bar.label} className="flex flex-col items-center flex-1 gap-2">
                      <div
                        className="w-full rounded-t-lg relative"
                        style={{
                          height: `${Math.max(10, (bar.count / srsMax) * 100)}%`,
                          background: `color-mix(in srgb, var(--k-primary) ${bar.opacity * 100}%, transparent)`,
                        }}
                      >
                        <div
                          className="absolute -top-6 left-0 right-0 text-center text-xs font-bold"
                          style={{ color: 'var(--k-primary)' }}
                        >
                          {bar.count}
                        </div>
                      </div>
                      <span
                        className="text-[10px] font-bold text-center leading-tight"
                        style={{ color: 'var(--k-secondary)' }}
                      >
                        {bar.label}
                      </span>
                    </div>
                  ))}
                </div>
                {srsStats.leeches > 0 && (
                  <p className="text-xs mt-4" style={{ color: 'var(--k-error)' }}>
                    {srsStats.leeches} leech{srsStats.leeches > 1 ? 'es' : ''} — items needing extra attention
                  </p>
                )}
                <p className="text-xs mt-2" style={{ color: 'var(--k-secondary)' }}>
                  {srsStats.dueToday} due today · {srsStats.total} total cards
                </p>
              </>
            )}
          </section>
        </div>

        {/* Study Streak */}
        <section
          className="p-8 rounded-xl space-y-6"
          style={{ background: 'var(--k-surface-container-lowest)' }}
        >
          <div className="flex justify-between items-end">
            <div>
              <h2 className="font-headline text-2xl" style={{ color: 'var(--k-primary)' }}>連続記録</h2>
              <p className="text-sm" style={{ color: 'var(--k-secondary)' }}>Study Streak</p>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-5xl font-bold leading-none" style={{ color: 'var(--k-primary)' }}>{streak}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--k-secondary)' }}>
                {streak === 1 ? 'day' : 'days'} current
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold leading-none" style={{ color: 'var(--k-secondary)' }}>{longestStreak}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--k-secondary)' }}>best streak</p>
            </div>
          </div>

          {/* Freeze indicators */}
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--k-secondary)' }}>Freezes</span>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full"
                style={{
                  background: i < freezesAvailable ? 'var(--k-primary)' : 'var(--k-surface-container-high)',
                }}
              />
            ))}
          </div>

          {/* Calendar */}
          <div className="pt-4" style={{ borderTop: '1px solid var(--k-surface-container-high)' }}>
            <p className="text-xs mb-3" style={{ color: 'var(--k-secondary)' }}>Last 35 days</p>
            <CalendarHeatmap studiedDates={studiedDates} freezeDates={freezeDates} />
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-[10px] h-[10px] rounded-full" style={{ background: 'var(--k-correct-secondary)' }} />
                <span className="text-[11px]" style={{ color: 'var(--k-secondary)' }}>Studied</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-[10px] h-[10px] rounded-full" style={{ background: 'var(--k-primary)' }} />
                <span className="text-[11px]" style={{ color: 'var(--k-secondary)' }}>Freeze</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-[10px] h-[10px] rounded-full" style={{ background: 'var(--k-surface-container-high)' }} />
                <span className="text-[11px]" style={{ color: 'var(--k-secondary)' }}>Missed</span>
              </div>
            </div>
          </div>
        </section>

        {/* Zen Quote */}
        <section
          className="relative h-48 rounded-xl overflow-hidden p-8 flex items-center"
          style={{ background: 'var(--k-primary)' }}
        >
          <div className="relative z-10 space-y-2">
            <p className="font-headline text-2xl" style={{ color: 'var(--k-on-primary)' }}>千里の道も一歩から</p>
            <p className="text-sm italic" style={{ color: 'var(--k-on-primary-container)' }}>
              "A journey of a thousand miles begins with a single step."
            </p>
          </div>
        </section>
      </main>

      <BottomNav />
    </>
  );
}
