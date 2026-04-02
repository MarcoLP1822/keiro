interface SegmentedControlOption {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  selected: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({ options, selected, onChange }: SegmentedControlProps) {
  return (
    <div
      className="flex w-full rounded-[8px] p-0.5"
      style={{ background: 'var(--ios-fill)' }}
      role="radiogroup"
      aria-label="Daily plan size"
    >
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={`min-h-[44px] flex-1 rounded-[7px] px-3 py-2 text-[13px] transition-all duration-[350ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
              isSelected
                ? 'font-semibold shadow-sm'
                : 'active:opacity-60'
            }`}
            style={
              isSelected
                ? {
                    background: 'var(--ios-bg-grouped-secondary)',
                    color: 'var(--ios-label)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                  }
                : { color: 'var(--ios-secondary-label)' }
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
