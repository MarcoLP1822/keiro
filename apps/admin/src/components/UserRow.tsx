import type { User } from '@supabase/supabase-js';

interface UserRowProps {
  user: User;
  isBanned: boolean;
  onClick: () => void;
}

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function UserRow({ user, isBanned, onClick }: UserRowProps) {
  return (
    <tr
      onClick={onClick}
      className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <td className="px-4 py-2.5 font-medium text-gray-900">{user.email ?? '—'}</td>
      <td className="px-4 py-2.5 text-gray-600">{formatDate(user.created_at)}</td>
      <td className="px-4 py-2.5 text-gray-600">{formatDate(user.last_sign_in_at)}</td>
      <td className="px-4 py-2.5">
        {isBanned ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
            Banned
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        )}
      </td>
    </tr>
  );
}
