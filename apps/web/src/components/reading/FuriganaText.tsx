import type { FuriganaToken } from '@keiro/types';

interface FuriganaTextProps {
  tokens: FuriganaToken[];
  showFurigana: boolean;
  className?: string;
}

export function FuriganaText({ tokens, showFurigana, className }: FuriganaTextProps) {
  return (
    <span className={className} style={{ color: 'var(--k-on-surface)' }}>
      {tokens.map((token, index) =>
        showFurigana && token.reading !== null ? (
          <ruby key={index}>
            {token.text}
            <rt>{token.reading}</rt>
          </ruby>
        ) : (
          <span key={index}>{token.text}</span>
        )
      )}
    </span>
  );
}
