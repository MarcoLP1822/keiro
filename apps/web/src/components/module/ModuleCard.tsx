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
      type="button"
      onClick={onClick}
      className="flex w-full items-center min-h-[44px] px-4 py-3 text-left transition-all duration-[350ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] active:bg-black/5"
      style={{
        background: 'var(--k-surface-container-lowest)',
        borderBottom: '0.5px solid var(--k-outline-variant)',
      }}
      aria-label={`${module.name}, ${isPassed ? `completed, ${score ?? 0}%` : isAvailable ? 'available' : 'locked'}`}
    >
      {/* Status icon */}
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm"
        style={
          isPassed
            ? { background: 'color-mix(in srgb, var(--k-correct-secondary) 12%, transparent)', color: 'var(--k-correct-secondary)' }
            : isAvailable
              ? { background: 'color-mix(in srgb, var(--k-primary) 12%, transparent)', color: 'var(--k-primary)' }
              : { background: 'var(--k-surface-container-high)', color: 'var(--k-outline)' }
        }
      >
        {isPassed ? '\u2713' : isAvailable ? '\u25B6' : '\uD83D\uDD12'}
      </span>

      {/* Module name */}
      <span
        className="ml-3 flex-1 truncate font-medium text-[17px]"
        style={{ color: isLocked ? 'var(--k-outline)' : 'var(--k-on-surface)' }}
      >
        {module.name}
      </span>

      {/* Right side: score or chevron */}
      <span className="ml-2 shrink-0 flex items-center gap-1">
        {isPassed && score != null && (
          <span className="text-[15px]" style={{ color: 'var(--k-correct-secondary)' }}>
            {score}%
          </span>
        )}
        {isAvailable && (
          <span className="text-[15px] font-medium" style={{ color: 'var(--k-primary)' }}>
            Continue
          </span>
        )}
        {isLocked && (
          <span className="text-[15px]" style={{ color: 'var(--k-outline)' }}>
            &mdash;
          </span>
        )}
        <svg
          className="h-4 w-4 ml-1"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          style={{ color: 'var(--k-outline)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </span>
    </button>
  );
}
