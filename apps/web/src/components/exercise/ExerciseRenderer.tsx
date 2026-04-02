import { useState, useCallback, useEffect } from 'react';
import type { Exercise, Answer } from '@keiro/types';
import { TopBar } from '../layout/TopBar';
import { PageContainer } from '../layout/PageContainer';
import { QuestionDisplay } from './QuestionDisplay';
import { AnswerOptions } from './AnswerOptions';
import { GapFill } from './GapFill';
import { TypingInput } from './TypingInput';
import { SentenceOrder } from './SentenceOrder';
import { FeedbackBar } from './FeedbackBar';
import { ProgressCounter } from './ProgressCounter';
import { speak } from '../../services/audio';
import { useSettings } from '../../hooks/useSettings';

interface ExerciseRendererProps {
  exercises: Exercise[];
  onComplete: (answers: Answer[]) => void;
  onExit?: () => void;
}

type ExerciseMode = 'multiple-choice' | 'gap-fill' | 'typing' | 'sentence-order';

function getExerciseMode(type: string): ExerciseMode {
  switch (type) {
    case 'sentence-gap-fill':
      return 'gap-fill';
    case 'typing-meaning':
    case 'typing-reading':
      return 'typing';
    case 'grammar-sentence-order':
      return 'sentence-order';
    default:
      return 'multiple-choice';
  }
}

export function ExerciseRenderer({ exercises, onComplete, onExit }: ExerciseRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const { audio } = useSettings();

  const exercise = exercises[currentIndex];

  // Auto-play audio when an audio-to-char exercise appears
  useEffect(() => {
    if (exercise?.type === 'audio-to-char' && audio) {
      speak(exercise.question, true);
    }
  }, [exercise, audio]);

  if (!exercise) return null;

  const mode = getExerciseMode(exercise.type);

  const handleSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedIndex(index);
    setShowFeedback(true);
  };

  const advanceToNext = useCallback((isCorrect: boolean) => {
    const answer: Answer = {
      exerciseIndex: currentIndex,
      selectedIndex: isCorrect ? 0 : -1,
      isCorrect,
      exercise,
    };

    const updatedAnswers = [...answers, answer];

    if (currentIndex + 1 >= exercises.length) {
      onComplete(updatedAnswers);
    } else {
      setAnswers(updatedAnswers);
      setCurrentIndex((prev) => prev + 1);
      setSelectedIndex(null);
      setShowFeedback(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, exercise, answers, exercises.length, onComplete]);

  // useCallback to keep a stable reference for the setTimeout in FeedbackBar
  const handleNext = useCallback(() => {
    const answer: Answer = {
      exerciseIndex: currentIndex,
      selectedIndex: selectedIndex!,
      isCorrect: selectedIndex === exercise.correctIndex,
      exercise,
    };

    const updatedAnswers = [...answers, answer];

    if (currentIndex + 1 >= exercises.length) {
      onComplete(updatedAnswers);
    } else {
      setAnswers(updatedAnswers);
      setCurrentIndex((prev) => prev + 1);
      setSelectedIndex(null);
      setShowFeedback(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, selectedIndex, exercise, answers, exercises.length, onComplete]);

  // For typing/sentence-order: show feedback bar after submission
  const handleTypingSubmit = useCallback((isCorrect: boolean) => {
    setShowFeedback(true);
    // Store result temporarily to use in handleNext
    setSelectedIndex(isCorrect ? 0 : -1);
  }, []);

  const handleSentenceOrderSubmit = useCallback((isCorrect: boolean) => {
    setShowFeedback(true);
    setSelectedIndex(isCorrect ? 0 : -1);
  }, []);

  // For typing/sentence-order, handleNext uses the stored isCorrect
  const handleNonMCNext = useCallback(() => {
    const isCorrect = selectedIndex === 0;
    advanceToNext(isCorrect);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, advanceToNext]);

  const correctAnswer = mode === 'typing'
    ? exercise.correctAnswer ?? ''
    : mode === 'sentence-order'
      ? exercise.correctOrder?.join('') ?? ''
      : exercise.options[exercise.correctIndex];

  const isCorrectForFeedback = mode === 'multiple-choice' || mode === 'gap-fill'
    ? selectedIndex === exercise.correctIndex
    : selectedIndex === 0;

  return (
    <>
      <TopBar
        onBack={onExit}
        rightAction={
          <ProgressCounter current={currentIndex + 1} total={exercises.length} />
        }
      />
      <PageContainer>
        {/* Question display for all types except sentence-order (which has its own layout) */}
        {mode !== 'sentence-order' && (
          <QuestionDisplay exercise={exercise} audioEnabled={audio} />
        )}

        {/* Render the appropriate answer interface */}
        {mode === 'gap-fill' && exercise.sentenceWithGap ? (
          <GapFill
            sentence={exercise.sentenceWithGap}
            options={exercise.options}
            correctIndex={exercise.correctIndex}
            selectedIndex={selectedIndex}
            showFeedback={showFeedback}
            onSelect={handleSelect}
          />
        ) : mode === 'typing' && exercise.correctAnswer ? (
          <TypingInput
            correctAnswer={exercise.correctAnswer}
            onSubmit={handleTypingSubmit}
          />
        ) : mode === 'sentence-order' && exercise.scrambledWords && exercise.correctOrder ? (
          <>
            <QuestionDisplay exercise={exercise} audioEnabled={audio} />
            <SentenceOrder
              scrambledWords={exercise.scrambledWords}
              correctOrder={exercise.correctOrder}
              onSubmit={handleSentenceOrderSubmit}
            />
          </>
        ) : (
          <AnswerOptions
            options={exercise.options}
            onSelect={handleSelect}
            correctIndex={exercise.correctIndex}
            selectedIndex={selectedIndex}
            showFeedback={showFeedback}
          />
        )}

        {showFeedback && (
          <FeedbackBar
            isCorrect={isCorrectForFeedback}
            correctAnswer={correctAnswer}
            onNext={mode === 'multiple-choice' || mode === 'gap-fill' ? handleNext : handleNonMCNext}
          />
        )}
      </PageContainer>
    </>
  );
}
