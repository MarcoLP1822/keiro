interface ProgressBarProps {
  value: number; // 0-100
}

export function ProgressBar({ value }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className="h-1.5 w-full rounded-full overflow-hidden"
      style={{ background: 'var(--k-surface-container-high)' }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${clamped}% complete`}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${clamped}%`,
          background: 'var(--k-primary)',
        }}
      />
    </div>
  );
}
