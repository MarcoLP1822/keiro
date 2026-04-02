import type { ReactNode } from 'react';

interface TopBarProps {
  title?: string;
  onBack?: () => void;
  rightAction?: ReactNode;
}

export function TopBar({ title, onBack, rightAction }: TopBarProps) {
  return (
    <header
      className="sticky top-0 z-10 flex h-[44px] items-center px-4"
      style={{
        background: 'var(--ios-bg)',
        borderBottom: '0.5px solid var(--ios-separator)',
      }}
    >
      <div className="w-20">
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-[44px] min-w-[44px] items-center gap-0.5 active:opacity-60"
            style={{ color: 'var(--ios-blue)' }}
            aria-label="Go back"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span className="text-[17px]">Back</span>
          </button>
        )}
      </div>

      {title && (
        <h1
          className="flex-1 text-center text-[17px] font-semibold truncate"
          style={{ color: 'var(--ios-label)' }}
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
