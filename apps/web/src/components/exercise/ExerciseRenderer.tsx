import { useState, useCallback, useEffect } from 'react';
import type { Exercise, Answer } from '@keiro/types';
import { TopBar } from '../layout/TopBar';
import { PageContainer } from '../layout/PageContainer';
import { QuestionDisplay } from './QuestionDisplay';
import { AnswerOptions } from './AnswerOptions';
import { FeedbackBar } from './FeedbackBar';
import { ProgressCounter } from './ProgressCounter';
import { speak } from '../../services/audio';
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
  const { audio } = useSettings();

  const exercise = exercises[currentIndex];

  // Auto-play audio when an audio-to-char exercise appears
  useEffect(() => {
    if (exercise?.type === 'audio-to-char' && audio) {
      speak(exercise.question, true);
    }
  }, [exercise, audio]);

  if (!exercise) return null;

  const handleSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedIndex(index);
    setShowFeedback(true);
  };

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

  const correctAnswer = exercise.options[exercise.correctIndex];

  return (
    <>
      <TopBar
        onBack={onExit}
        rightAction={
          <ProgressCounter current={currentIndex + 1} total={exercises.length} />
        }
      />
      <PageContainer>
        <QuestionDisplay exercise={exercise} audioEnabled={audio} />
        <AnswerOptions
          options={exercise.options}
          onSelect={handleSelect}
          correctIndex={exercise.correctIndex}
          selectedIndex={selectedIndex}
          showFeedback={showFeedback}
        />
        {showFeedback && (
          <FeedbackBar
            isCorrect={selectedIndex === exercise.correctIndex}
            correctAnswer={correctAnswer}
            onNext={handleNext}
          />
        )}
      </PageContainer>
    </>
  );
}
