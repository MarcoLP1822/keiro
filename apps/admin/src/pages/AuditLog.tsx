import { useState, useEffect } from 'react';
import { supabaseAdmin } from '../services/supabase-admin';

interface AuditEntry {
  id: string;
  admin_email: string;
  action: string;
  target_user_email: string | null;
  reason: string | null;
  created_at: string;
}

export function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
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
        const { data, error: err } = await supabaseAdmin
          .from('admin_audit_log')
          .select('id, admin_email, action, target_user_email, reason, created_at')
          .order('created_at', { ascending: false })
          .limit(100);

        if (err) throw err;
        setEntries(data ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load audit log');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Loading audit log...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit Log</h2>

      {entries.length === 0 ? (
        <p className="text-gray-400">No actions logged yet.</p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Time</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Admin</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Action</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Target</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Reason</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-t">
                  <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-gray-900">{entry.admin_email}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      entry.action === 'delete_user' ? 'bg-red-100 text-red-800'
                      : entry.action === 'ban' ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800'
                    }`}>
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{entry.target_user_email ?? '—'}</td>
                  <td className="px-4 py-2 text-gray-600">{entry.reason ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
