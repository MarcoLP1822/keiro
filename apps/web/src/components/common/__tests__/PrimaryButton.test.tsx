import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PrimaryButton } from '../PrimaryButton';

describe('PrimaryButton', () => {
  it('renders children text', () => {
    render(<PrimaryButton>Click me</PrimaryButton>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<PrimaryButton onClick={handleClick}>Click</PrimaryButton>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('shows loading spinner instead of children when loading', () => {
    render(<PrimaryButton loading>Click me</PrimaryButton>);
    expect(screen.queryByText('Click me')).not.toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<PrimaryButton disabled>Click</PrimaryButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<PrimaryButton onClick={handleClick} disabled>Click</PrimaryButton>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
