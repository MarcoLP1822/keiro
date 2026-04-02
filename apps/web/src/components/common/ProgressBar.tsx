interface ProgressBarProps {
  value: number; // 0-100
}

export function ProgressBar({ value }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const isComplete = clamped >= 100;

  return (
    <div
      className="h-1 w-full rounded-full"
      style={{ background: 'var(--ios-gray5)' }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${clamped}% complete`}
    >
      <div
        className="h-full rounded-full transition-all duration-[350ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
        style={{
          width: `${clamped}%`,
          background: isComplete ? 'var(--ios-green)' : 'var(--ios-blue)',
        }}
      />
    </div>
  );
}
