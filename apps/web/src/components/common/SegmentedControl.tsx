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
    <div className="flex w-full rounded-xl bg-gray-100 p-1" role="radiogroup">
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={`min-h-[44px] flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all
              ${isSelected
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 active:bg-gray-200'
              }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
