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
      className={`flex w-full items-center min-h-[48px] rounded-xl px-4 py-3 text-left transition-all active:scale-[0.98] ${
        isPassed
          ? 'bg-white border border-gray-200'
          : isAvailable
            ? 'bg-primary/5 border-2 border-primary'
            : 'bg-gray-50 border border-gray-100'
      }`}
      aria-label={`${module.name}, ${isPassed ? `completed, ${score ?? 0}%` : isAvailable ? 'available' : 'locked'}`}
    >
      {/* Status icon */}
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
        isPassed
          ? 'bg-success/10 text-success'
          : isAvailable
            ? 'bg-primary/10 text-primary'
            : 'bg-gray-200 text-gray-400'
      }`}>
        {isPassed ? '\u2713' : isAvailable ? '\u25B6' : '\uD83D\uDD12'}
      </span>

      {/* Module name */}
      <span className={`ml-3 flex-1 truncate font-medium ${
        isLocked ? 'text-gray-400' : 'text-gray-900'
      }`}>
        {module.name}
      </span>

      {/* Right side: score or indicator */}
      <span className={`ml-2 shrink-0 text-sm ${
        isPassed
          ? 'text-gray-500'
          : isAvailable
            ? 'font-medium text-primary'
            : 'text-gray-300'
      }`}>
        {isPassed && score != null ? `${score}%` : isAvailable ? 'Continue' : '\u2014'}
      </span>
    </button>
  );
}
