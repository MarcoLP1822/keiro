import { AnswerOptions } from './AnswerOptions';

interface GapFillProps {
  sentence: string;
  options: string[];
  correctIndex: number;
  selectedIndex: number | null;
  showFeedback: boolean;
  onSelect: (index: number) => void;
}

export function GapFill({
  sentence,
  options,
  correctIndex,
  selectedIndex,
  showFeedback,
  onSelect,
}: GapFillProps) {
  // Split sentence around ___ to highlight the gap
  const parts = sentence.split('___');

  return (
    <div className="flex flex-col gap-5">
      <p
        className="text-[20px] text-center leading-relaxed font-medium"
        style={{ color: 'var(--ios-label)' }}
      >
        {parts[0]}
        <span
          className="inline-block min-w-[3em] border-b-2 mx-1 text-center"
          style={{ borderColor: 'var(--ios-blue)', color: 'var(--ios-blue)' }}
        >
          {selectedIndex !== null ? options[selectedIndex] : '\u00A0'}
        </span>
        {parts[1]}
      </p>

      <AnswerOptions
        options={options}
        onSelect={onSelect}
        correctIndex={correctIndex}
        selectedIndex={selectedIndex}
        showFeedback={showFeedback}
      />
    </div>
  );
}
