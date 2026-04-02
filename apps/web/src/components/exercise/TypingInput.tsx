import { useState, useRef, useEffect } from 'react';

interface TypingInputProps {
  correctAnswer: string;
  onSubmit: (isCorrect: boolean) => void;
}

/**
 * Fuzzy match: case-insensitive, trimmed. Accepts if typed answer contains
 * the correct answer or vice versa (e.g., "eat" matches "to eat").
 */
function isAnswerCorrect(typed: string, correct: string): boolean {
  const t = typed.trim().toLowerCase();
  const c = correct.trim().toLowerCase();
  if (t === c) return true;
  if (t.includes(c) || c.includes(t)) return true;
  return false;
}

export function TypingInput({ correctAnswer, onSubmit }: TypingInputProps) {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Reset when correctAnswer changes (new exercise)
  useEffect(() => {
    setValue('');
    setSubmitted(false);
    setIsCorrect(false);
    inputRef.current?.focus();
  }, [correctAnswer]);

  const handleSubmit = () => {
    if (submitted || value.trim() === '') return;
    const correct = isAnswerCorrect(value, correctAnswer);
    setIsCorrect(correct);
    setSubmitted(true);
    onSubmit(correct);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const borderColor = submitted
    ? isCorrect
      ? 'var(--ios-green)'
      : 'var(--ios-red)'
    : 'var(--ios-separator)';

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={submitted}
          placeholder="Type your answer..."
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full h-[50px] rounded-[10px] border px-4 text-[17px] outline-none
            transition-all duration-[350ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]
            disabled:opacity-70"
          style={{
            borderColor,
            background: 'var(--ios-bg-grouped-secondary)',
            color: 'var(--ios-label)',
          }}
        />
        {submitted && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2">
            {isCorrect ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="var(--ios-green)">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="var(--ios-red)">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </span>
        )}
      </div>

      {submitted && !isCorrect && (
        <p className="text-[15px]" style={{ color: 'var(--ios-secondary-label)' }}>
          Correct answer: <span className="font-semibold" style={{ color: 'var(--ios-label)' }}>{correctAnswer}</span>
        </p>
      )}

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={value.trim() === ''}
          className="w-full min-h-[44px] rounded-[10px] px-5 py-3 text-[17px] font-semibold text-white
            transition-all duration-[350ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]
            active:scale-[0.98] disabled:opacity-40"
          style={{ background: 'var(--ios-blue)' }}
        >
          Check
        </button>
      )}
    </div>
  );
}
