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
      className="w-full h-14 rounded-full font-bold text-lg
        active:scale-95 transition-transform
        disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        background: 'var(--k-surface-container-highest)',
        color: 'var(--k-on-surface)',
      }}
    >
      {loading ? (
        <span
          className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--k-primary)', borderTopColor: 'transparent' }}
        />
      ) : (
        children
      )}
    </button>
  );
}
