import type { Exercise, VocabItem, KanjiItem } from '@keiro/types';
import { speak } from '../../services/audio';
import { FuriganaText } from '../common/FuriganaText';

interface QuestionDisplayProps {
  exercise: Exercise;
  audioEnabled?: boolean;
  showFurigana?: boolean;
}

const questionText: Record<string, string> = {
  'char-to-romaji': 'What does this mean?',
  'romaji-to-char': 'Which character is this?',
  'audio-to-char': 'What character do you hear?',
  'word-to-meaning': 'What does this word mean?',
  'meaning-to-word': 'Which word means this?',
  'kanji-to-meaning': 'What does this kanji mean?',
  'kanji-to-reading': 'How do you read this kanji?',
  'grammar-pick-correct': 'Which sentence uses this grammar correctly?',
  'sentence-gap-fill': 'Fill in the blank',
  'grammar-sentence-order': 'Put the words in order',
  'typing-meaning': 'Type the meaning',
  'typing-reading': 'Type the reading',
};

// Exercise types that show large Japanese characters
const largeJapaneseTypes = new Set([
  'char-to-romaji',
  'word-to-meaning',
  'kanji-to-meaning',
  'kanji-to-reading',
  'typing-meaning',
  'typing-reading',
]);

// Exercise types where a small tap-to-hear speaker button should appear
const tapToHearTypes = new Set([
  'word-to-meaning',
  'meaning-to-word',
  'typing-meaning',
  'kanji-to-meaning',
  'kanji-to-reading',
  'typing-reading',
]);

function getFuriganaReading(exercise: Exercise): string | undefined {
  const item = exercise.targetItem;
  if ('reading' in item) {
    // VocabItem — use its reading field
    return (item as VocabItem).reading;
  }
  if ('onReading' in item) {
    // KanjiItem — use first kun reading, or first on reading as fallback
    const kanji = item as KanjiItem;
    return kanji.kunReading[0] ?? kanji.onReading[0];
  }
  return undefined;
}

/** Returns the Japanese text to pronounce for tap-to-hear exercises. */
function getJapaneseText(exercise: Exercise): string {
  const item = exercise.targetItem;
  if ('word' in item) return (item as VocabItem).word;
  if ('kanji' in item) return (item as KanjiItem).kanji;
  return exercise.question;
}

function SpeakerButton({ onPress }: { onPress: () => void }) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 active:scale-90 transition-transform duration-150"
      style={{ background: 'rgba(0,122,255,0.1)' }}
      aria-label="Play pronunciation"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4"
        style={{ color: 'var(--k-primary)' }}
      >
        <path d="M11.26 3.691A1.2 1.2 0 0 1 12 4.8v14.4a1.2 1.2 0 0 1-2.05.849L5.1 15.6H2.4A1.2 1.2 0 0 1 1.2 14.4V9.6a1.2 1.2 0 0 1 1.2-1.2h2.7l4.85-4.449a1.2 1.2 0 0 1 1.31-.26ZM15.53 7.47a.75.75 0 0 1 1.06 0 6.75 6.75 0 0 1 0 9.06.75.75 0 0 1-1.06-1.06 5.25 5.25 0 0 0 0-6.94.75.75 0 0 1 0-1.06ZM18.36 4.64a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.983 0 13.79a.75.75 0 1 1-1.06-1.06 8.25 8.25 0 0 0 0-11.67.75.75 0 0 1 0-1.06Z"/>
      </svg>
    </button>
  );
}

export function QuestionDisplay({ exercise, audioEnabled = true, showFurigana = true }: QuestionDisplayProps) {
  const prompt = questionText[exercise.type] ?? 'What is this?';
  const isAudio = exercise.type === 'audio-to-char';
  const isLargeJapanese = largeJapaneseTypes.has(exercise.type);
  const isGrammar = exercise.type === 'grammar-pick-correct';
  const showTapToHear = audioEnabled && tapToHearTypes.has(exercise.type);

  // Furigana only on vocab/kanji question types showing Japanese text
  // Exclude typing-reading: showing furigana would reveal the answer
  const furiganaTypes = new Set(['word-to-meaning', 'kanji-to-meaning', 'typing-meaning']);
  const furiganaReading = furiganaTypes.has(exercise.type) ? getFuriganaReading(exercise) : undefined;

  const handlePlayAudio = () => {
    speak(exercise.question, audioEnabled);
  };

  const handleTapToHear = () => {
    speak(getJapaneseText(exercise), true);
  };

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <p
        className="text-[15px]"
        style={{ color: 'var(--k-secondary)' }}
      >
        {prompt}
      </p>
      {isAudio ? (
        <button
          type="button"
          onClick={handlePlayAudio}
          className="flex items-center justify-center w-20 h-20 rounded-full transition-all duration-[350ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] active:scale-95"
          style={{ background: 'rgba(0,122,255,0.1)' }}
          aria-label="Play pronunciation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-10 h-10"
            style={{ color: 'var(--k-primary)' }}
          >
            <path d="M11.26 3.691A1.2 1.2 0 0 1 12 4.8v14.4a1.2 1.2 0 0 1-2.05.849L5.1 15.6H2.4A1.2 1.2 0 0 1 1.2 14.4V9.6a1.2 1.2 0 0 1 1.2-1.2h2.7l4.85-4.449a1.2 1.2 0 0 1 1.31-.26ZM15.53 7.47a.75.75 0 0 1 1.06 0 6.75 6.75 0 0 1 0 9.06.75.75 0 0 1-1.06-1.06 5.25 5.25 0 0 0 0-6.94.75.75 0 0 1 0-1.06ZM18.36 4.64a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.983 0 13.79a.75.75 0 1 1-1.06-1.06 8.25 8.25 0 0 0 0-11.67.75.75 0 0 1 0-1.06Z"/>
          </svg>
        </button>
      ) : isGrammar ? (
        <div className="flex flex-col items-center gap-1">
          <p
            className="text-2xl font-semibold"
            style={{ color: 'var(--k-on-surface)' }}
          >
            {exercise.question}
          </p>
          {exercise.questionDetail && (
            <p
              className="text-[15px]"
              style={{ color: 'var(--k-secondary)' }}
            >
              {exercise.questionDetail}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <p
              className={
                isLargeJapanese
                  ? 'text-[56px] leading-tight font-bold'
                  : 'text-2xl font-semibold'
              }
              style={{ color: 'var(--k-on-surface)' }}
            >
              <FuriganaText
                text={exercise.question}
                reading={furiganaReading}
                show={showFurigana}
              />
            </p>
            {showTapToHear && <SpeakerButton onPress={handleTapToHear} />}
          </div>
          {exercise.questionDetail && (
            <p
              className="text-[15px]"
              style={{ color: 'var(--k-secondary)' }}
            >
              {exercise.questionDetail}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
