interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className = '' }: LoadingSpinnerProps) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div
        className="h-8 w-8 rounded-full border-[3px] border-solid animate-spin"
        style={{
          borderColor: 'var(--k-outline-variant)',
          borderTopColor: 'var(--k-primary)',
        }}
      />
    </div>
  );
}

// Full-page centered variant
export function LoadingPage() {
  return (
    <LoadingSpinner className="min-h-screen" />
  );
}
