import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SegmentedControl } from '../SegmentedControl';

const options = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];

describe('SegmentedControl', () => {
  it('renders all options', () => {
    render(<SegmentedControl options={options} selected="small" onChange={() => {}} />);
    expect(screen.getByRole('radio', { name: 'Small' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Medium' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Large' })).toBeInTheDocument();
  });

  it('marks the selected option as checked', () => {
    render(<SegmentedControl options={options} selected="medium" onChange={() => {}} />);
    expect(screen.getByRole('radio', { name: 'Medium' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Small' })).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange with the correct value when option is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<SegmentedControl options={options} selected="small" onChange={handleChange} />);

    await user.click(screen.getByRole('radio', { name: 'Large' }));
    expect(handleChange).toHaveBeenCalledWith('large');
  });
});
