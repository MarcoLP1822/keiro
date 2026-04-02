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
  // Keyboard shortcuts: press 1-4 to select answer options
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

  const getOptionStyle = (index: number): React.CSSProperties => {
    const isSelected = selectedIndex === index;
    const isCorrect = index === correctIndex;

    if (showFeedback) {
      if (isCorrect) {
        return {
          background: 'rgba(52,199,89,0.12)',
          borderColor: 'var(--ios-green)',
          color: 'var(--ios-green)',
        };
      }
      if (isSelected) {
        return {
          background: 'rgba(255,59,48,0.12)',
          borderColor: 'var(--ios-red)',
          color: 'var(--ios-red)',
        };
      }
      return {
        background: 'var(--ios-bg-grouped-secondary)',
        borderColor: 'var(--ios-separator)',
        color: 'var(--ios-tertiary-label)',
      };
    }

    if (isSelected) {
      return {
        background: 'rgba(0,122,255,0.08)',
        borderColor: 'var(--ios-blue)',
        color: 'var(--ios-blue)',
      };
    }

    return {
      background: 'var(--ios-bg-grouped-secondary)',
      borderColor: 'transparent',
      color: 'var(--ios-label)',
    };
  };

  return (
    <div className="flex flex-col gap-3">
      {options.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isCorrect = index === correctIndex;

        return (
          <button
            key={index}
            onClick={() => onSelect(index)}
            disabled={showFeedback}
            className="w-full min-h-[52px] rounded-[12px] border px-4 py-3 text-left text-[17px] font-medium
              flex items-center justify-between
              transition-all duration-[350ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]
              active:scale-[0.98]
              disabled:cursor-default"
            style={{
              ...getOptionStyle(index),
              boxShadow: showFeedback ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
            }}
            aria-label={option}
          >
            <span>{option}</span>
            {showFeedback && isCorrect && (
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
            {showFeedback && isSelected && !isCorrect && (
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
