interface ProgressBarProps {
  value: number; // 0-100
}

export function ProgressBar({ value }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const isComplete = clamped >= 100;

  return (
    <div className="h-3 w-full rounded-full bg-gray-200" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={`h-full rounded-full transition-all duration-300 ${isComplete ? 'bg-success' : 'bg-primary'}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
