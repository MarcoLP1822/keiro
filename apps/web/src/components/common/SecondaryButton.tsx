import type { ReactNode } from 'react';

interface SecondaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
}

export function SecondaryButton({ children, onClick, disabled, loading, type = 'button' }: SecondaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full min-h-[44px] rounded-xl border-2 border-primary bg-transparent px-6 py-3
        text-base font-semibold text-primary transition-all
        active:scale-[0.98] active:bg-primary/5
        disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      ) : (
        children
      )}
    </button>
  );
}
