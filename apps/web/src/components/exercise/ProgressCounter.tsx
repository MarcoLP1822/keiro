interface ProgressCounterProps {
  current: number;
  total: number;
  stepLabel?: string;
}

export function ProgressCounter({ current, total, stepLabel }: ProgressCounterProps) {
  if (stepLabel) {
    return (
      <span
        className="text-[13px] font-medium"
        style={{ color: 'var(--k-secondary)' }}
        role="status"
        aria-live="polite"
        aria-label={`Step: ${stepLabel}`}
      >
        {stepLabel}
      </span>
    );
  }

  return (
    <span
      className="text-[13px] font-medium"
      style={{ color: 'var(--k-secondary)' }}
      role="status"
      aria-live="polite"
      aria-label={`Question ${current} of ${total}`}
    >
      {current}/{total}
    </span>
  );
}
