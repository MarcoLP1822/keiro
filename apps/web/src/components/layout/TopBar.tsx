import type { ReactNode } from 'react';

interface TopBarProps {
  title?: string;
  onBack?: () => void;
  rightAction?: ReactNode;
}

export function TopBar({ title, onBack, rightAction }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-12 items-center bg-white px-4 shadow-sm">
      <div className="w-12">
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-11 w-11 items-center justify-center rounded-full active:bg-gray-100"
            aria-label="Go back"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}
      </div>

      {title && (
        <h1 className="flex-1 text-center text-lg font-semibold truncate">{title}</h1>
      )}

      <div className="w-12 flex justify-end">
        {rightAction}
      </div>
    </header>
  );
}
