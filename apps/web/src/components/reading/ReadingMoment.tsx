import { useState } from 'react';
import type { SentenceItem } from '@keiro/types';
import { FuriganaText } from './FuriganaText';

interface ReadingMomentProps {
  sentence: SentenceItem;
  showFurigana: boolean;
  onContinue: () => void;
}

export function ReadingMoment({ sentence, showFurigana, onContinue }: ReadingMomentProps) {
  const [translationVisible, setTranslationVisible] = useState(false);

  return (
    <div className="flex flex-col items-center gap-8 py-8 px-4 text-center">
      <h2
        className="font-headline text-2xl font-bold"
        style={{ color: 'var(--k-primary)' }}
      >
        You can read this!
      </h2>

      <FuriganaText
        tokens={sentence.furigana}
        showFurigana={showFurigana}
        className="font-headline text-3xl"
      />

      <div className="min-h-[2rem]">
        {translationVisible ? (
          <p className="text-base" style={{ color: 'var(--k-on-surface-variant)' }}>
            {sentence.english}
          </p>
        ) : (
          <button
            onClick={() => setTranslationVisible(true)}
            className="text-sm font-medium"
            style={{ color: 'var(--k-secondary)' }}
          >
            Tap to reveal
          </button>
        )}
      </div>

      <button
        onClick={onContinue}
        className="bg-silk-gradient text-white rounded-full h-14 px-10 font-semibold text-base w-full max-w-xs"
      >
        Continue
      </button>
    </div>
  );
}
