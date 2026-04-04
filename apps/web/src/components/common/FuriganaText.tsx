interface FuriganaTextProps {
  text: string;
  reading?: string;
  className?: string;
  show?: boolean;
}

function hasKanji(text: string): boolean {
  return /[\u4E00-\u9FFF\u3400-\u4DBF]/.test(text);
}

export function FuriganaText({ text, reading, className, show = true }: FuriganaTextProps) {
  // No reading, no kanji, or furigana disabled → render plain text
  if (!show || !reading || !hasKanji(text)) {
    return <span className={className}>{text}</span>;
  }

  return (
    <ruby className={className}>
      {text}
      <rp>(</rp>
      <rt>{reading}</rt>
      <rp>)</rp>
    </ruby>
  );
}
