import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <main className="mx-auto px-4 py-6 overflow-y-auto md:max-w-[600px] lg:max-w-[500px]">
      {children}
    </main>
  );
}
