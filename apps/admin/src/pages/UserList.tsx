import { useState, useEffect, useMemo } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabaseAdmin } from '../services/supabase-admin';
import { UserRow } from '../components/UserRow';

interface UserWithBan extends User {
  isBanned?: boolean;
}

interface UserListProps {
  onSelectUser: (userId: string) => void;
}

export function UserList({ onSelectUser }: UserListProps) {
  const [users, setUsers] = useState<UserWithBan[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!supabaseAdmin) {
        setError('Supabase not configured');
        setLoading(false);
        return;
      }

      try {
        const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers({
          perPage: 1000,
        });
        const { data: bans } = await supabaseAdmin.from('user_bans').select('user_id');
        const banSet = new Set((bans ?? []).map((b) => b.user_id));

        setUsers(
          authUsers.map((u) => ({ ...u, isBanned: banSet.has(u.id) })),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load users');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter((u) => u.email?.toLowerCase().includes(q));
  }, [users, search]);

  if (loading) return <div className="p-8 text-gray-500">Loading users...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Users ({users.length})
        </h2>
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 border rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Joined</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Last Sign In</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                isBanned={user.isBanned ?? false}
                onClick={() => onSelectUser(user.id)}
              />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-4 text-center text-gray-400">No users found</p>
        )}
      </div>
    </div>
  );
}
