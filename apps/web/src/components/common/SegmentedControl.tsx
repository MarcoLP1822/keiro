interface SegmentedControlOption {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  selected: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
}

export function SegmentedControl({ options, selected, onChange, ariaLabel }: SegmentedControlProps) {
  return (
    <div
      className="flex w-full rounded-full p-1.5 gap-1 shadow-sm"
      style={{ background: 'var(--k-surface-container-low)' }}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={`min-h-[44px] flex-1 rounded-full px-3 py-2.5 text-sm transition-all ${
              isSelected
                ? 'bg-silk-gradient text-white font-semibold'
                : 'font-medium hover:opacity-80'
            }`}
            style={
              isSelected ? undefined : { color: 'var(--k-secondary)' }
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
