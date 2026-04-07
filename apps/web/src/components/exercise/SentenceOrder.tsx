import { useState, useEffect } from 'react';

interface SentenceOrderProps {
  scrambledWords: string[];
  correctOrder: string[];
  onSubmit: (isCorrect: boolean) => void;
}

export function SentenceOrder({ scrambledWords, correctOrder, onSubmit }: SentenceOrderProps) {
  const [available, setAvailable] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Reset when exercise changes
  useEffect(() => {
    setAvailable([...scrambledWords]);
    setSelected([]);
    setSubmitted(false);
    setIsCorrect(false);
  }, [scrambledWords]);

  const handleSelectWord = (index: number) => {
    if (submitted) return;
    const word = available[index];
    setSelected((prev) => [...prev, word]);
    setAvailable((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveWord = (index: number) => {
    if (submitted) return;
    const word = selected[index];
    setAvailable((prev) => [...prev, word]);
    setSelected((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheck = () => {
    if (submitted) return;
    const correct =
      selected.length === correctOrder.length &&
      selected.every((word, i) => word === correctOrder[i]);
    setIsCorrect(correct);
    setSubmitted(true);
    onSubmit(correct);
  };

  const sentenceBorderColor = submitted
    ? isCorrect
      ? 'var(--k-correct-secondary)'
      : 'var(--k-error)'
    : 'var(--k-outline-variant)';

  return (
    <div className="flex flex-col gap-5">
      {/* Built sentence area */}
      <div
        className="min-h-[60px] rounded-[12px] border-2 border-dashed p-3 flex flex-wrap gap-2 items-center
          transition-all duration-[350ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
        style={{ borderColor: sentenceBorderColor }}
      >
        {selected.length === 0 && (
          <p className="text-[15px]" style={{ color: 'var(--k-outline)' }}>
            Tap words to build the sentence
          </p>
        )}
        {selected.map((word, index) => (
          <button
            key={`selected-${index}`}
            onClick={() => handleRemoveWord(index)}
            disabled={submitted}
            className="min-h-[44px] rounded-xl border px-4 py-2 text-[17px] font-medium
              transition-all duration-[350ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]
              active:scale-[0.98] disabled:cursor-default"
            style={{
              background: 'var(--k-surface-container-lowest)',
              borderColor: 'var(--k-primary)',
              color: 'var(--k-on-surface)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            {word}
          </button>
        ))}
      </div>

      {/* Available words */}
      <div className="flex flex-wrap gap-2 justify-center">
        {available.map((word, index) => (
          <button
            key={`available-${index}`}
            onClick={() => handleSelectWord(index)}
            disabled={submitted}
            className="min-h-[44px] rounded-xl border px-4 py-2 text-[17px] font-medium
              transition-all duration-[350ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]
              active:scale-[0.98] disabled:cursor-default"
            style={{
              background: 'var(--k-surface-container-lowest)',
              borderColor: 'transparent',
              color: 'var(--k-on-surface)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            {word}
          </button>
        ))}
      </div>

      {/* Show correct order on wrong answer */}
      {submitted && !isCorrect && (
        <p className="text-[15px] text-center" style={{ color: 'var(--k-secondary)' }}>
          Correct order: <span className="font-semibold" style={{ color: 'var(--k-on-surface)' }}>{correctOrder.join('')}</span>
        </p>
      )}

      {/* Check button */}
      {!submitted && (
        <button
          onClick={handleCheck}
          disabled={selected.length === 0}
          className="w-full min-h-[44px] rounded-xl px-5 py-3 text-[17px] font-semibold text-white
            transition-all duration-[350ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]
            active:scale-[0.98] disabled:opacity-40"
          style={{ background: 'var(--k-primary)' }}
        >
          Check
        </button>
      )}
    </div>
  );
}
