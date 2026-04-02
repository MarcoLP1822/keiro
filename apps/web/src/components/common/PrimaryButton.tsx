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
      className="w-full min-h-[50px] rounded-[12px] px-6 py-3 text-[17px] font-semibold text-white
        transition-all duration-[350ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]
        active:brightness-90
        disabled:cursor-not-allowed disabled:opacity-50"
      style={{ background: 'var(--ios-blue)' }}
    >
      {loading ? (
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        children
      )}
    </button>
  );
}
