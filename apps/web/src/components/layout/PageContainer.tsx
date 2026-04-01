import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="max-w-md mx-auto px-4 py-6 overflow-y-auto">
      {children}
    </div>
  );
}
