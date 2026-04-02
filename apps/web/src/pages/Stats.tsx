import { useNavigate } from 'react-router';
import { TopBar } from '../components/layout/TopBar';
import { PageContainer } from '../components/layout/PageContainer';
import { ProgressBar } from '../components/common/ProgressBar';
import { useStats } from '../hooks/useStats';

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

export function Stats() {
  const navigate = useNavigate();
  const stats = useStats();

  if (!stats) return null;

  const {
    overallProgress,
    modulesCompleted,
    totalModules,
    itemsByType,
    currentStreak,
    srsStats,
  } = stats;

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
          <p
            className="text-[44px] font-bold leading-none"
            style={{ color: 'var(--ios-label)' }}
          >
            {currentStreak}
          </p>
          <p
            className="text-[15px] mt-1"
            style={{ color: 'var(--ios-secondary-label)' }}
          >
            {currentStreak === 1 ? 'day' : 'days'}
          </p>
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
            </div>
          )}
        </div>

        {/* Bottom spacer */}
        <div className="h-8" />
      </PageContainer>
    </>
  );
}
