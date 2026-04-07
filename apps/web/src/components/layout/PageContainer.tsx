import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <main
      className="mx-auto max-w-2xl px-6 py-8 pb-32 animate-fadeIn"
      style={{ background: 'var(--k-surface)' }}
    >
      {children}
    </main>
  );
}
