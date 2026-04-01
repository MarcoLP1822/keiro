interface ProgressCounterProps {
  current: number;
  total: number;
}

export function ProgressCounter({ current, total }: ProgressCounterProps) {
  return (
    <span
      className="text-sm font-medium text-gray-600"
      role="status"
      aria-live="polite"
      aria-label={`Question ${current} of ${total}`}
    >
      {current}/{total}
    </span>
  );
}
