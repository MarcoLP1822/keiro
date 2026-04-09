import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FuriganaText } from '../FuriganaText';
import type { FuriganaToken } from '@keiro/types';

const mixedTokens: FuriganaToken[] = [
  { text: '東京', reading: 'とうきょう' },
  { text: 'へ', reading: null },
];

describe('FuriganaText', () => {
  it('renders ruby tags when showFurigana=true and token has reading', () => {
    const { container } = render(
      <FuriganaText tokens={mixedTokens} showFurigana={true} />
    );

    const rubyElements = container.querySelectorAll('ruby');
    expect(rubyElements).toHaveLength(1);
    expect(rubyElements[0]).toHaveTextContent('東京');

    const rtElement = container.querySelector('rt');
    expect(rtElement).toBeInTheDocument();
    expect(rtElement).toHaveTextContent('とうきょう');
  });

  it('renders plain span for token with null reading even when showFurigana=true', () => {
    const { container } = render(
      <FuriganaText tokens={mixedTokens} showFurigana={true} />
    );

    const spans = container.querySelectorAll('span > span');
    const heSpan = Array.from(spans).find((el) => el.textContent === 'へ');
    expect(heSpan).toBeInTheDocument();
  });

  it('renders plain text for all tokens when showFurigana=false', () => {
    const { container } = render(
      <FuriganaText tokens={mixedTokens} showFurigana={false} />
    );

    expect(container.querySelector('ruby')).toBeNull();
    expect(container.querySelector('rt')).toBeNull();
    expect(screen.getByText('東京')).toBeInTheDocument();
    expect(screen.getByText('へ')).toBeInTheDocument();
  });

  it('handles empty tokens array without errors', () => {
    const { container } = render(
      <FuriganaText tokens={[]} showFurigana={true} />
    );

    // Wrapper span rendered, no ruby or inner spans
    expect(container.querySelector('ruby')).toBeNull();
    const wrapper = container.querySelector('span');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper!.textContent).toBe('');
  });

  it('applies className prop to wrapper span', () => {
    const { container } = render(
      <FuriganaText tokens={mixedTokens} showFurigana={false} className="custom-class" />
    );

    const wrapper = container.querySelector('span');
    expect(wrapper).toHaveClass('custom-class');
  });
});
