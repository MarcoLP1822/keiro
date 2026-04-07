import type { ReactNode } from 'react';

interface TopBarProps {
  title?: string;
  onBack?: () => void;
  rightAction?: ReactNode;
}

export function TopBar({ title, onBack, rightAction }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between px-6 glass">
      <div className="w-20">
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-11 min-w-[44px] items-center active:scale-95 transition-transform duration-150"
            style={{ color: 'var(--k-primary)' }}
            aria-label="Go back"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
      </div>

      {title && (
        <h1
          className="flex-1 text-center text-lg font-bold tracking-tight truncate font-headline"
          style={{ color: 'var(--k-primary)' }}
        >
          {title}
        </h1>
      )}

      <div className="w-20 flex justify-end">
        {rightAction}
      </div>
    </header>
  );
}
