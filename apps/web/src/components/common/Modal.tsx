import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  body: string;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
}

export function Modal({ isOpen, title, body, primaryLabel, secondaryLabel, onPrimary, onSecondary }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-white p-6 shadow-xl backdrop:bg-black/50"
      onCancel={(e) => {
        e.preventDefault();
        onSecondary();
      }}
    >
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-2 text-gray-600">{body}</p>
      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={onPrimary}
          className="min-h-[44px] w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white active:scale-[0.98]"
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
