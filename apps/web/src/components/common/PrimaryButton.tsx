import type { ReactNode } from 'react';

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
}

export function PrimaryButton({ children, onClick, disabled, loading, type = 'button' }: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full h-14 bg-silk-gradient text-white rounded-full font-bold text-lg
        flex items-center justify-center gap-2
        active:scale-95 transition-transform shadow-lg
        disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        children
      )}
    </button>
  );
}
