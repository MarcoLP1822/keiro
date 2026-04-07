import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AnswerOptions } from '../AnswerOptions';

const defaultProps = {
  options: ['あ', 'い', 'う', 'え'],
  onSelect: vi.fn(),
  correctIndex: 0,
  selectedIndex: null,
  showFeedback: false,
};

describe('AnswerOptions', () => {
  it('renders all 4 option buttons', () => {
    render(<AnswerOptions {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });

  it('calls onSelect with correct index when option clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<AnswerOptions {...defaultProps} onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: 'う' }));
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it('shows gradient style on correct answer when showFeedback is true', () => {
    render(
      <AnswerOptions {...defaultProps} selectedIndex={0} showFeedback={true} />
    );
    const correctButton = screen.getByRole('button', { name: 'あ' });
    expect(correctButton.className).toContain('bg-silk-gradient');
  });

  it('shows error style on incorrect selected answer when showFeedback is true', () => {
    render(
      <AnswerOptions {...defaultProps} selectedIndex={2} showFeedback={true} />
    );
    const wrongButton = screen.getByRole('button', { name: 'う' });
    expect(wrongButton.style.background).toBe('var(--k-error-container)');
  });

  it('disables all options when showFeedback is true', () => {
    render(
      <AnswerOptions {...defaultProps} selectedIndex={0} showFeedback={true} />
    );
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});
