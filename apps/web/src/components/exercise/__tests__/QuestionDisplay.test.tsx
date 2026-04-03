import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QuestionDisplay } from '../QuestionDisplay';
import type { Exercise } from '@keiro/types';

// Mock the audio service to avoid side effects
vi.mock('../../../services/audio', () => ({
  speak: vi.fn(),
}));

function makeExercise(overrides: Partial<Exercise>): Exercise {
  return {
    type: 'char-to-romaji',
    question: 'あ',
    options: ['a', 'i', 'u', 'e'],
    correctIndex: 0,
    targetItem: { character: 'あ', romaji: 'a' },
    ...overrides,
  } as Exercise;
}

describe('QuestionDisplay', () => {
  it('shows question text for char-to-romaji type', () => {
    render(<QuestionDisplay exercise={makeExercise({ type: 'char-to-romaji' })} />);
    expect(screen.getByText('What does this mean?')).toBeInTheDocument();
  });

  it('shows large character for kana exercises', () => {
    render(<QuestionDisplay exercise={makeExercise({ type: 'char-to-romaji', question: 'あ' })} />);
    expect(screen.getByText('あ')).toBeInTheDocument();
  });

  it('shows audio button for audio-to-char type', () => {
    render(<QuestionDisplay exercise={makeExercise({ type: 'audio-to-char' })} />);
    expect(screen.getByRole('button', { name: 'Play pronunciation' })).toBeInTheDocument();
  });

  it('does not show character text for audio exercises', () => {
    render(
      <QuestionDisplay exercise={makeExercise({ type: 'audio-to-char', question: 'あ' })} />
    );
    // The question text 'あ' should NOT be displayed directly for audio exercises
    // It should only be accessible via the audio button
    const questionTexts = screen.queryAllByText('あ');
    expect(questionTexts).toHaveLength(0);
  });
});
