import { useState } from 'react';

interface DeleteDialogProps {
  userEmail: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteDialog({ userEmail, onConfirm, onCancel }: DeleteDialogProps) {
  const [confirmEmail, setConfirmEmail] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold text-red-700 mb-2">Delete User</h3>
        <p className="text-sm text-gray-600 mb-2">
          This will <strong>permanently delete</strong> all data for <strong>{userEmail}</strong>.
          This action cannot be undone.
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Type the user's email to confirm:
        </p>
        <input
          type="text"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          placeholder={userEmail}
          className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmEmail !== userEmail}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
