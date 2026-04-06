import { useState, useCallback, useEffect } from 'react';
import type { Exercise, Answer } from '@keiro/types';
import { TopBar } from '../layout/TopBar';
import { PageContainer } from '../layout/PageContainer';
import { QuestionDisplay } from './QuestionDisplay';
import { AnswerOptions } from './AnswerOptions';
import { GapFill } from './GapFill';
import { TypingInput } from './TypingInput';
import { SentenceOrder } from './SentenceOrder';
import { ReadingPassage } from './ReadingPassage';
import { FeedbackBar } from './FeedbackBar';
import { ProgressCounter } from './ProgressCounter';
import { getExerciseMode } from './exerciseMode';
import { speak } from '../../services/audio';
import { playCorrectSound, playIncorrectSound } from '../../services/sounds';
import { vibrateSuccess, vibrateError } from '../../services/haptics';
import { useSettings } from '../../hooks/useSettings';

interface ExerciseRendererProps {
  exercises: Exercise[];
  onComplete: (answers: Answer[]) => void;
  onExit?: () => void;
}

export function ExerciseRenderer({ exercises, onComplete, onExit }: ExerciseRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const { audio, showFurigana } = useSettings();

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
    const isCorrect = index === exercise.correctIndex;
    if (audio) {
      if (isCorrect) playCorrectSound();
      else playIncorrectSound();
    }
    if (isCorrect) vibrateSuccess();
    else vibrateError();
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
  }, [currentIndex, selectedIndex, exercise, answers, exercises.length, onComplete]);

  // For typing/sentence-order: show feedback bar after submission
  const handleTypingSubmit = useCallback((isCorrect: boolean) => {
    if (audio) {
      if (isCorrect) playCorrectSound();
      else playIncorrectSound();
    }
    if (isCorrect) vibrateSuccess();
    else vibrateError();
    setShowFeedback(true);
    // Store result temporarily to use in handleNext
    setSelectedIndex(isCorrect ? 0 : -1);
  }, [audio]);

  const handleSentenceOrderSubmit = useCallback((isCorrect: boolean) => {
    if (audio) {
      if (isCorrect) playCorrectSound();
      else playIncorrectSound();
    }
    if (isCorrect) vibrateSuccess();
    else vibrateError();
    setShowFeedback(true);
    setSelectedIndex(isCorrect ? 0 : -1);
  }, [audio]);

  // For typing/sentence-order, handleNext uses the stored isCorrect
  const handleNonMCNext = useCallback(() => {
    const isCorrect = selectedIndex === 0;
    advanceToNext(isCorrect);
  }, [selectedIndex, advanceToNext]);

  const correctAnswer = mode === 'typing'
    ? exercise.correctAnswer ?? ''
    : mode === 'sentence-order'
      ? exercise.correctOrder?.join('') ?? ''
      : exercise.options[exercise.correctIndex];

  const isCorrectForFeedback = mode === 'multiple-choice' || mode === 'gap-fill' || mode === 'reading'
    ? selectedIndex === exercise.correctIndex
    : selectedIndex === 0;

  // Japanese text to pronounce in the feedback bar when the user gets a vocab/kanji wrong
  const vocabKanjiAudioTypes = new Set([
    'word-to-meaning', 'meaning-to-word', 'typing-meaning',
    'kanji-to-meaning', 'kanji-to-reading', 'typing-reading',
  ]);
  const feedbackAudio = vocabKanjiAudioTypes.has(exercise.type) ? exercise.question : undefined;

  return (
    <>
      <TopBar
        onBack={onExit}
        rightAction={
          <ProgressCounter current={currentIndex + 1} total={exercises.length} />
        }
      />
      <PageContainer>
        {/* Question display for all types except sentence-order and reading (which have their own layout) */}
        {mode !== 'sentence-order' && mode !== 'reading' && (
          <QuestionDisplay exercise={exercise} audioEnabled={audio} showFurigana={showFurigana} />
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
        ) : mode === 'reading' ? (
          <>
            <ReadingPassage exercise={exercise} />
            <AnswerOptions
              options={exercise.options}
              onSelect={handleSelect}
              correctIndex={exercise.correctIndex}
              selectedIndex={selectedIndex}
              showFeedback={showFeedback}
            />
          </>
        ) : mode === 'sentence-order' && exercise.scrambledWords && exercise.correctOrder ? (
          <>
            <QuestionDisplay exercise={exercise} audioEnabled={audio} showFurigana={showFurigana} />
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
            onNext={mode === 'multiple-choice' || mode === 'gap-fill' || mode === 'reading' ? handleNext : handleNonMCNext}
            correctAnswerAudio={feedbackAudio}
            audioEnabled={audio}
          />
        )}
      </PageContainer>
    </>
  );
}
