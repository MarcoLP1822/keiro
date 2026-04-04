import { useState } from 'react';

interface BanDialogProps {
  userEmail: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function BanDialog({ userEmail, onConfirm, onCancel }: BanDialogProps) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Ban User</h3>
        <p className="text-sm text-gray-600 mb-4">
          Ban <strong>{userEmail}</strong>. They will see an "Account suspended" message and cannot sync.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for ban (required)"
          rows={3}
          className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            Ban User
          </button>
        </div>
      </div>
    </div>
  );
}
