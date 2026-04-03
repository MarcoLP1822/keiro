import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ModuleCard } from '../ModuleCard';
import type { Module } from '@keiro/types';

const mockModule: Module = {
  id: 'hiragana-1',
  name: 'Hiragana Basics',
  type: 'kana',
  level: 'beginner',
  order: 1,
  intro: { title: 'Hiragana', explanation: 'Learn hiragana', cultureNote: null },
  items: [{ character: 'あ', romaji: 'a' }],
};

describe('ModuleCard', () => {
  it('shows checkmark for passed state', () => {
    render(<ModuleCard module={mockModule} status="passed" score={90} onClick={() => {}} />);
    expect(screen.getByText('\u2713')).toBeInTheDocument();
  });

  it('shows play icon for available state', () => {
    render(<ModuleCard module={mockModule} status="available" onClick={() => {}} />);
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  it('shows lock icon for locked state', () => {
    render(<ModuleCard module={mockModule} status="locked" onClick={() => {}} />);
    expect(screen.getByText('\uD83D\uDD12')).toBeInTheDocument();
  });

  it('calls onClick when tapped', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<ModuleCard module={mockModule} status="available" onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('shows score for passed state', () => {
    render(<ModuleCard module={mockModule} status="passed" score={85} onClick={() => {}} />);
    expect(screen.getByText('85%')).toBeInTheDocument();
  });
});
