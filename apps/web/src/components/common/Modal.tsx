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
      // Remember which element triggered the modal so we can return focus
      triggerRef.current = document.activeElement;
      dialog.showModal();
      // Move focus into the modal's primary action
      primaryRef.current?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
      // Return focus to the element that triggered the modal
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
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-white p-6 shadow-xl backdrop:bg-black/50"
      aria-labelledby="modal-title"
      aria-describedby="modal-body"
      onCancel={(e) => {
        e.preventDefault();
        onSecondary();
      }}
    >
      <h2 id="modal-title" className="text-lg font-bold">{title}</h2>
      <p id="modal-body" className="mt-2 text-gray-600">{body}</p>
      <div className="mt-6 flex flex-col gap-3">
        <button
          ref={primaryRef}
          onClick={onPrimary}
          className={`min-h-[44px] w-full rounded-xl px-4 py-3 font-semibold text-white active:scale-[0.98] ${variant === 'danger' ? 'bg-error' : 'bg-primary'}`}
        >
          {primaryLabel}
        </button>
        <button
          onClick={onSecondary}
          className="min-h-[44px] w-full rounded-xl border-2 border-gray-300 px-4 py-3 font-semibold text-gray-700 active:scale-[0.98]"
        >
          {secondaryLabel}
        </button>
      </div>
    </dialog>
  );
}
