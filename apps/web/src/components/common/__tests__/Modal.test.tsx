import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from '../Modal';

const defaultProps = {
  isOpen: true,
  title: 'Test Title',
  body: 'Test body text',
  primaryLabel: 'Confirm',
  secondaryLabel: 'Cancel',
  onPrimary: vi.fn(),
  onSecondary: vi.fn(),
};

describe('Modal', () => {
  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('renders title and body when isOpen is true', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test body text')).toBeInTheDocument();
  });

  it('calls onPrimary when primary button is clicked', async () => {
    const user = userEvent.setup();
    const onPrimary = vi.fn();
    render(<Modal {...defaultProps} onPrimary={onPrimary} />);

    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onPrimary).toHaveBeenCalledOnce();
  });

  it('calls onSecondary when secondary button is clicked', async () => {
    const user = userEvent.setup();
    const onSecondary = vi.fn();
    render(<Modal {...defaultProps} onSecondary={onSecondary} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onSecondary).toHaveBeenCalledOnce();
  });

  it('applies danger color to primary button in danger variant', () => {
    render(<Modal {...defaultProps} variant="danger" />);
    const primaryButton = screen.getByRole('button', { name: 'Confirm' });
    expect(primaryButton.style.color).toBe('var(--ios-red)');
  });
});
