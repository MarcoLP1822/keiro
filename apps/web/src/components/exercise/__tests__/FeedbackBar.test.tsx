import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FeedbackBar } from '../FeedbackBar';

describe('FeedbackBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows "Correct!" when isCorrect is true', () => {
    render(<FeedbackBar isCorrect={true} correctAnswer="あ" onNext={vi.fn()} />);
    expect(screen.getByText('Correct!')).toBeInTheDocument();
  });

  it('shows correct answer text when isCorrect is false', () => {
    render(<FeedbackBar isCorrect={false} correctAnswer="あ" onNext={vi.fn()} />);
    expect(screen.getByText(/あ/)).toBeInTheDocument();
  });

  it('shows Next button only when incorrect', () => {
    const { rerender } = render(
      <FeedbackBar isCorrect={false} correctAnswer="あ" onNext={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();

    rerender(<FeedbackBar isCorrect={true} correctAnswer="あ" onNext={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });

  it('auto-advances after 1500ms when correct', () => {
    const onNext = vi.fn();
    render(<FeedbackBar isCorrect={true} correctAnswer="あ" onNext={onNext} />);

    expect(onNext).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1500);
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('calls onNext when Next button is clicked for incorrect answer', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(<FeedbackBar isCorrect={false} correctAnswer="あ" onNext={onNext} />);

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onNext).toHaveBeenCalledOnce();
  });
});
