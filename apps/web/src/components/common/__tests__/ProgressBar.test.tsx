import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressBar } from '../ProgressBar';

describe('ProgressBar', () => {
  it('renders with correct width for given value', () => {
    render(<ProgressBar value={42} />);
    const progressbar = screen.getByRole('progressbar');
    const fill = progressbar.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe('42%');
  });

  it('has correct aria-valuenow attribute', () => {
    render(<ProgressBar value={75} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '75');
  });

  it('clamps value to 0-100 range', () => {
    render(<ProgressBar value={150} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '100');
  });
});
