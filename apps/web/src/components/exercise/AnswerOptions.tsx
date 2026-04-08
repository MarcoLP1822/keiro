import { useEffect } from 'react';

interface AnswerOptionsProps {
  options: string[];
  onSelect: (index: number) => void;
  correctIndex: number;
  selectedIndex: number | null;
  showFeedback: boolean;
}

export function AnswerOptions({
  options,
  onSelect,
  correctIndex,
  selectedIndex,
  showFeedback,
}: AnswerOptionsProps) {
  useEffect(() => {
    if (showFeedback) return;

    function handleKeyDown(e: KeyboardEvent) {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= options.length) {
        onSelect(num - 1);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFeedback, options.length, onSelect]);

  return (
    <div className="flex flex-col gap-3">
      {options.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isCorrect = index === correctIndex;

        // Determine visual state
        let bgClass = 'hover:opacity-90';
        let bgStyle: React.CSSProperties = { background: 'var(--k-surface-container-high)' };
        let textStyle: React.CSSProperties = { color: 'var(--k-on-surface)' };
        let rightIcon: React.ReactNode = null;

        if (showFeedback && isCorrect) {
          bgClass = 'bg-silk-gradient shadow-lg';
          bgStyle = {};
          textStyle = { color: 'white' };
          rightIcon = (
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          );
        } else if (showFeedback && isSelected && !isCorrect) {
          bgStyle = { background: 'var(--k-error-container)' };
          textStyle = { color: 'var(--k-error)' };
          rightIcon = (
            <span className="material-symbols-outlined" style={{ color: 'var(--k-error)' }}>close</span>
          );
        } else if (showFeedback) {
          bgStyle = { background: 'var(--k-surface-container-high)', opacity: 0.5 };
        }

        return (
          <button
            key={index}
            onClick={() => onSelect(index)}
            disabled={showFeedback}
            className={`group relative flex items-center justify-between w-full p-5 rounded-full
              transition-all duration-200 active:scale-[0.98]
              disabled:cursor-default ${bgClass}`}
            style={bgStyle}
            aria-label={option}
          >
            <div className="flex items-center gap-4">
              <span
                className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm"
                style={{ background: 'color-mix(in srgb, var(--k-on-surface) 5%, transparent)', color: 'inherit' }}
              >
                {index + 1}
              </span>
              <span className="font-semibold text-lg tracking-tight" style={textStyle}>
                {option}
              </span>
            </div>
            {rightIcon}
          </button>
        );
      })}
    </div>
  );
}
