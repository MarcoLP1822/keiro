import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <main
      className="mx-auto max-w-lg px-4 py-6 overflow-y-auto"
      style={{ background: 'var(--ios-bg-grouped)' }}
    >
      {children}
    </main>
  );
}
