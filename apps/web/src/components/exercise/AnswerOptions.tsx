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
  return (
    <div className="flex flex-col gap-3">
      {options.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isCorrect = index === correctIndex;

        let style =
          'w-full min-h-[48px] rounded-xl border-2 px-4 py-3 text-left text-base font-medium transition-colors flex items-center justify-between';

        if (showFeedback) {
          if (isCorrect) {
            style += ' border-success bg-success/10 text-success';
          } else if (isSelected) {
            style += ' border-error bg-error/10 text-error';
          } else {
            style += ' border-gray-200 text-gray-400';
          }
        } else if (isSelected) {
          style += ' border-primary bg-primary/10 text-primary';
        } else {
          style += ' border-gray-300 text-gray-700 active:bg-gray-50';
        }

        return (
          <button
            key={index}
            onClick={() => onSelect(index)}
            disabled={showFeedback}
            className={style}
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
