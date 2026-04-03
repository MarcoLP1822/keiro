import { useNavigate } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { TopBar } from '../components/layout/TopBar';
import { PageContainer } from '../components/layout/PageContainer';
import { ProgressBar } from '../components/common/ProgressBar';
import { useStats } from '../hooks/useStats';
import { useStreak } from '../hooks/useStreak';
import { db } from '../services/db';

function StatPill({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium"
      style={{ background: `${color}20`, color }}
    >
      <span className="font-semibold">{count}</span> {label}
    </span>
  );
}

function CalendarHeatmap({
  studiedDates,
  freezeDates,
}: {
  studiedDates: Set<string>;
  freezeDates: Set<string>;
}) {
  // Build the last 35 days (5 rows x 7 columns), ending today
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

  const colorMap = {
    studied: 'var(--ios-green)',
    freeze: 'var(--ios-blue)',
    missed: 'var(--ios-gray5)',
  };

  return (
    <div className="grid grid-cols-7 gap-[6px]">
      {days.map(({ date, status }) => (
        <div
          key={date}
          className="w-full aspect-square rounded-full"
          style={{ background: colorMap[status] }}
          title={date}
          aria-label={`${date}: ${status}`}
        />
      ))}
    </div>
  );
}

export function Stats() {
  const navigate = useNavigate();
  const stats = useStats();
  const { streak, longestStreak, freezesAvailable, freezesUsed } = useStreak();

  // Get all completed daily plans for the calendar heatmap
  const allPlans = useLiveQuery(() => db.dailyPlan.toArray(), []);

  if (!stats) return null;

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

  // Determine level label
  let levelLabel = 'Beginner';
  if (overallProgress >= 80) levelLabel = 'N4';
  else if (overallProgress >= 40) levelLabel = 'N5';

  const totalItemsLearned =
    itemsByType.kana + itemsByType.vocabulary + itemsByType.kanji + itemsByType.grammar;

  return (
    <>
      <TopBar title="Statistics" onBack={() => navigate('/')} />
      <PageContainer>
        {/* Section 1: Overall Progress */}
        <p
          className="mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          Overall Progress
        </p>
        <div
          className="rounded-[10px] p-4"
          style={{ background: 'var(--ios-bg-grouped-secondary)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[15px] font-medium"
              style={{ color: 'var(--ios-secondary-label)' }}
            >
              {levelLabel} — {overallProgress}%
            </span>
            <span
              className="text-[13px]"
              style={{ color: 'var(--ios-secondary-label)' }}
            >
              {modulesCompleted} of {totalModules} modules
            </span>
          </div>
          <ProgressBar value={overallProgress} />
        </div>

        {/* Section 2: Items Learned */}
        <p
          className="mt-8 mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          Items Learned
        </p>
        <div
          className="rounded-[10px] p-4"
          style={{ background: 'var(--ios-bg-grouped-secondary)' }}
        >
          <p
            className="text-[28px] font-bold mb-3"
            style={{ color: 'var(--ios-label)' }}
          >
            {totalItemsLearned}
          </p>
          <div className="flex flex-wrap gap-2">
            {itemsByType.kana > 0 && (
              <StatPill label="kana" count={itemsByType.kana} color="var(--ios-blue)" />
            )}
            {itemsByType.vocabulary > 0 && (
              <StatPill label="vocab" count={itemsByType.vocabulary} color="var(--ios-green)" />
            )}
            {itemsByType.kanji > 0 && (
              <StatPill label="kanji" count={itemsByType.kanji} color="var(--ios-orange)" />
            )}
            {itemsByType.grammar > 0 && (
              <StatPill label="grammar" count={itemsByType.grammar} color="var(--ios-red)" />
            )}
            {totalItemsLearned === 0 && (
              <p
                className="text-[15px]"
                style={{ color: 'var(--ios-secondary-label)' }}
              >
                Complete modules to start tracking
              </p>
            )}
          </div>
        </div>

        {/* Section 3: Study Streak */}
        <p
          className="mt-8 mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          Study Streak
        </p>
        <div
          className="rounded-[10px] p-4"
          style={{ background: 'var(--ios-bg-grouped-secondary)' }}
        >
          <div className="flex items-end justify-between mb-4">
            <div>
              <p
                className="text-[44px] font-bold leading-none"
                style={{ color: 'var(--ios-label)' }}
              >
                {streak}
              </p>
              <p
                className="text-[15px] mt-1"
                style={{ color: 'var(--ios-secondary-label)' }}
              >
                {streak === 1 ? 'day' : 'days'} current
              </p>
            </div>
            <div className="text-right">
              <p
                className="text-[22px] font-semibold leading-none"
                style={{ color: 'var(--ios-secondary-label)' }}
              >
                {longestStreak}
              </p>
              <p
                className="text-[13px] mt-1"
                style={{ color: 'var(--ios-secondary-label)' }}
              >
                best streak
              </p>
            </div>
          </div>

          {/* Freeze indicators */}
          <div className="flex items-center gap-1 mb-4">
            <span
              className="text-[13px] mr-1"
              style={{ color: 'var(--ios-secondary-label)' }}
            >
              Freezes
            </span>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="text-[14px]"
                style={{ opacity: i < freezesAvailable ? 1 : 0.25 }}
              >
                ❄️
              </span>
            ))}
          </div>

          {/* Calendar heatmap */}
          <div
            className="h-px mb-4"
            style={{ background: 'var(--ios-separator)' }}
          />
          <p
            className="text-[13px] mb-3"
            style={{ color: 'var(--ios-secondary-label)' }}
          >
            Last 35 days
          </p>
          <CalendarHeatmap studiedDates={studiedDates} freezeDates={freezeDates} />
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div
                className="w-[10px] h-[10px] rounded-full"
                style={{ background: 'var(--ios-green)' }}
              />
              <span className="text-[11px]" style={{ color: 'var(--ios-secondary-label)' }}>Studied</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-[10px] h-[10px] rounded-full"
                style={{ background: 'var(--ios-blue)' }}
              />
              <span className="text-[11px]" style={{ color: 'var(--ios-secondary-label)' }}>Freeze</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-[10px] h-[10px] rounded-full"
                style={{ background: 'var(--ios-gray5)' }}
              />
              <span className="text-[11px]" style={{ color: 'var(--ios-secondary-label)' }}>Missed</span>
            </div>
          </div>
        </div>

        {/* Section 4: SRS Status */}
        <p
          className="mt-8 mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          SRS Status
        </p>
        <div
          className="rounded-[10px] p-4"
          style={{ background: 'var(--ios-bg-grouped-secondary)' }}
        >
          {srsStats.total === 0 ? (
            <p
              className="text-[15px]"
              style={{ color: 'var(--ios-secondary-label)' }}
            >
              No SRS cards yet
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className="text-[17px]"
                  style={{ color: 'var(--ios-label)' }}
                >
                  Total cards
                </span>
                <span
                  className="text-[17px] font-semibold"
                  style={{ color: 'var(--ios-label)' }}
                >
                  {srsStats.total}
                </span>
              </div>
              <div
                className="h-px"
                style={{ background: 'var(--ios-separator)' }}
              />
              <div className="flex items-center justify-between">
                <span
                  className="text-[17px]"
                  style={{ color: 'var(--ios-label)' }}
                >
                  Due today
                </span>
                <span
                  className="text-[17px] font-semibold"
                  style={{ color: 'var(--ios-blue)' }}
                >
                  {srsStats.dueToday}
                </span>
              </div>
              <div
                className="h-px"
                style={{ background: 'var(--ios-separator)' }}
              />
              <div className="flex items-center justify-between">
                <span
                  className="text-[15px]"
                  style={{ color: 'var(--ios-secondary-label)' }}
                >
                  Learning (&lt;7d)
                </span>
                <span
                  className="text-[15px]"
                  style={{ color: 'var(--ios-orange)' }}
                >
                  {srsStats.learning}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-[15px]"
                  style={{ color: 'var(--ios-secondary-label)' }}
                >
                  Reviewing (7-30d)
                </span>
                <span
                  className="text-[15px]"
                  style={{ color: 'var(--ios-blue)' }}
                >
                  {srsStats.reviewing}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-[15px]"
                  style={{ color: 'var(--ios-secondary-label)' }}
                >
                  Mastered (&gt;30d)
                </span>
                <span
                  className="text-[15px]"
                  style={{ color: 'var(--ios-green)' }}
                >
                  {srsStats.mastered}
                </span>
              </div>
              {srsStats.leeches > 0 && (
                <>
                  <div
                    className="h-px"
                    style={{ background: 'var(--ios-separator)' }}
                  />
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[15px]"
                      style={{ color: 'var(--ios-secondary-label)' }}
                    >
                      Leeches
                    </span>
                    <span
                      className="text-[15px]"
                      style={{ color: 'var(--ios-red)' }}
                    >
                      {srsStats.leeches}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Bottom spacer */}
        <div className="h-8" />
      </PageContainer>
    </>
  );
}
