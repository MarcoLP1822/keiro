import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  body: string;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
  variant?: 'default' | 'danger';
}

export function Modal({ isOpen, title, body, primaryLabel, secondaryLabel, onPrimary, onSecondary, variant = 'default' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      triggerRef.current = document.activeElement;
      dialog.showModal();
      primaryRef.current?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
      triggerRef.current = null;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-[270px] rounded-xl p-0 shadow-xl backdrop:bg-black/40"
      style={{ background: 'var(--k-surface-container-lowest)' }}
      aria-labelledby="modal-title"
      aria-describedby="modal-body"
      onCancel={(e) => {
        e.preventDefault();
        onSecondary();
      }}
    >
      <div className="px-4 pt-5 pb-4 text-center">
        <h2
          id="modal-title"
          className="text-[17px] font-semibold"
          style={{ color: 'var(--k-on-surface)' }}
        >
          {title}
        </h2>
        <p
          id="modal-body"
          className="mt-1 text-[13px]"
          style={{ color: 'var(--k-secondary)' }}
        >
          {body}
        </p>
      </div>
      <div
        className="flex flex-col"
        style={{ borderTop: '0.5px solid var(--k-outline-variant)' }}
      >
        <button
          type="button"
          ref={primaryRef}
          onClick={onPrimary}
          className="min-h-[44px] w-full text-[17px] font-semibold active:bg-black/5"
          style={{
            color: variant === 'danger' ? 'var(--k-error)' : 'var(--k-primary)',
          }}
        >
          {primaryLabel}
        </button>
        <button
          type="button"
          onClick={onSecondary}
          className="min-h-[44px] w-full text-[17px] active:bg-black/5"
          style={{
            color: 'var(--k-primary)',
            borderTop: '0.5px solid var(--k-outline-variant)',
          }}
        >
          {secondaryLabel}
        </button>
      </div>
    </dialog>
  );
}
