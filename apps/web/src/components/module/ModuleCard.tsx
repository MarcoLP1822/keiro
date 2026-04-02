import type { Module, ModuleStatus } from '@keiro/types';

interface ModuleCardProps {
  module: Module;
  status: ModuleStatus;
  score?: number | null;
  onClick: () => void;
}

export function ModuleCard({ module, status, score, onClick }: ModuleCardProps) {
  const isPassed = status === 'passed';
  const isAvailable = status === 'available' || status === 'in_progress';
  const isLocked = status === 'locked';

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center min-h-[44px] px-4 py-3 text-left transition-all duration-[350ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] active:bg-black/5"
      style={{
        background: 'var(--ios-bg-grouped-secondary)',
        borderBottom: '0.5px solid var(--ios-separator)',
      }}
      aria-label={`${module.name}, ${isPassed ? `completed, ${score ?? 0}%` : isAvailable ? 'available' : 'locked'}`}
    >
      {/* Status icon */}
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
        style={
          isPassed
            ? { background: 'rgba(52,199,89,0.12)', color: 'var(--ios-green)' }
            : isAvailable
              ? { background: 'rgba(0,122,255,0.12)', color: 'var(--ios-blue)' }
              : { background: 'var(--ios-gray5)', color: 'var(--ios-gray2)' }
        }
      >
        {isPassed ? '\u2713' : isAvailable ? '\u25B6' : '\uD83D\uDD12'}
      </span>

      {/* Module name */}
      <span
        className="ml-3 flex-1 truncate font-medium text-[17px]"
        style={{ color: isLocked ? 'var(--ios-tertiary-label)' : 'var(--ios-label)' }}
      >
        {module.name}
      </span>

      {/* Right side: score or chevron */}
      <span className="ml-2 shrink-0 flex items-center gap-1">
        {isPassed && score != null && (
          <span className="text-[15px]" style={{ color: 'var(--ios-green)' }}>
            {score}%
          </span>
        )}
        {isAvailable && (
          <span className="text-[15px] font-medium" style={{ color: 'var(--ios-blue)' }}>
            Continue
          </span>
        )}
        {isLocked && (
          <span className="text-[15px]" style={{ color: 'var(--ios-gray3)' }}>
            &mdash;
          </span>
        )}
        <svg
          className="h-4 w-4 ml-1"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          style={{ color: 'var(--ios-gray3)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </span>
    </button>
  );
}
