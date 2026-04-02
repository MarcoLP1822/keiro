interface ProgressCounterProps {
  current: number;
  total: number;
}

export function ProgressCounter({ current, total }: ProgressCounterProps) {
  return (
    <span
      className="text-[13px] font-medium"
      style={{ color: 'var(--ios-secondary-label)' }}
      role="status"
      aria-live="polite"
      aria-label={`Question ${current} of ${total}`}
    >
      {current}/{total}
    </span>
  );
}
