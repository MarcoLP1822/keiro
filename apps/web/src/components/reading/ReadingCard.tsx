import { useState } from 'react';
import type { SentenceItem } from '@keiro/types';
import { FuriganaText } from './FuriganaText';

interface ReadingCardProps {
  sentence: SentenceItem;
  showFurigana: boolean;
  showTranslation?: boolean;
}

export function ReadingCard({ sentence, showFurigana, showTranslation = false }: ReadingCardProps) {
  const [translationVisible, setTranslationVisible] = useState(showTranslation);

  return (
    <div
      className="rounded-xl p-6"
      style={{ background: 'var(--k-surface-container-lowest)' }}
    >
      <FuriganaText
        tokens={sentence.furigana}
        showFurigana={showFurigana}
        className="font-headline text-xl"
      />

      <div className="mt-4">
        {translationVisible ? (
          <button
            onClick={() => setTranslationVisible(false)}
            className="text-left w-full"
          >
            <p className="text-sm" style={{ color: 'var(--k-on-surface-variant)' }}>
              {sentence.english}
            </p>
          </button>
        ) : (
          <button
            onClick={() => setTranslationVisible(true)}
            className="text-sm font-medium"
            style={{ color: 'var(--k-secondary)' }}
          >
            Tap to reveal translation
          </button>
        )}
      </div>
    </div>
  );
}
