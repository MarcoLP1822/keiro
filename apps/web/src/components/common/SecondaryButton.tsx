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
      className="w-full min-h-[50px] rounded-[12px] px-6 py-3 text-[17px] font-semibold
        transition-all duration-[350ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]
        active:brightness-90
        disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        background: 'rgba(0, 122, 255, 0.15)',
        color: 'var(--ios-blue)',
      }}
    >
      {loading ? (
        <span
          className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--ios-blue)', borderTopColor: 'transparent' }}
        />
      ) : (
        children
      )}
    </button>
  );
}
