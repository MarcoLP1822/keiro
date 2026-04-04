import { useState, useEffect } from 'react';
import { supabaseAdmin } from '../services/supabase-admin';
import { StatCard } from '../components/StatCard';

interface Analytics {
  totalUsers: number;
  activeUsers7d: number;
  activeUsers30d: number;
  completionByLevel: { level: string; completed: number; total: number }[];
  srsDistribution: { learning: number; reviewing: number; mastered: number };
  averageStreak: number;
}

async function fetchAnalytics(): Promise<Analytics> {
  if (!supabaseAdmin) throw new Error('Supabase not configured');

  // Total users
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const totalUsers = users.length;

  // Active users by last sign-in
  const now = Date.now();
  const d7 = now - 7 * 86400000;
  const d30 = now - 30 * 86400000;
  const activeUsers7d = users.filter(
    (u) => u.last_sign_in_at && new Date(u.last_sign_in_at).getTime() > d7,
  ).length;
  const activeUsers30d = users.filter(
    (u) => u.last_sign_in_at && new Date(u.last_sign_in_at).getTime() > d30,
  ).length;

  // Completion rates by level
  const { data: progress } = await supabaseAdmin.from('module_progress').select('module_id, status');
  const levelMap = new Map<string, { completed: number; total: number }>();
  for (const row of progress ?? []) {
    const level = row.module_id.startsWith('n5') ? 'N5'
      : row.module_id.startsWith('n4') ? 'N4'
      : row.module_id.startsWith('n3') ? 'N3'
      : row.module_id.startsWith('kana') ? 'Kana'
      : 'Other';
    const entry = levelMap.get(level) ?? { completed: 0, total: 0 };
    entry.total++;
    if (row.status === 'completed') entry.completed++;
    levelMap.set(level, entry);
  }
  const completionByLevel = Array.from(levelMap.entries()).map(([level, data]) => ({
    level,
    ...data,
  }));

  // SRS distribution
  const { data: cards } = await supabaseAdmin.from('srs_cards').select('interval');
  let learning = 0, reviewing = 0, mastered = 0;
  for (const c of cards ?? []) {
    if (c.interval <= 1) learning++;
    else if (c.interval < 21) reviewing++;
    else mastered++;
  }

  // Average streak from settings
  const { data: settings } = await supabaseAdmin
    .from('user_settings')
    .select('value')
    .eq('key', 'streak');
  let totalStreak = 0;
  let streakCount = 0;
  for (const s of settings ?? []) {
    const val = s.value as { currentStreak?: number };
    if (val?.currentStreak != null) {
      totalStreak += val.currentStreak;
      streakCount++;
    }
  }

  return {
    totalUsers,
    activeUsers7d,
    activeUsers30d,
    completionByLevel,
    srsDistribution: { learning, reviewing, mastered },
    averageStreak: streakCount > 0 ? Math.round(totalStreak / streakCount) : 0,
  };
}

export function Dashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Loading analytics...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return null;

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Users" value={data.totalUsers} />
        <StatCard title="Active (7d)" value={data.activeUsers7d} />
        <StatCard title="Active (30d)" value={data.activeUsers30d} />
        <StatCard title="Avg Streak" value={`${data.averageStreak} days`} />
        <StatCard title="SRS Learning" value={data.srsDistribution.learning} />
        <StatCard title="SRS Reviewing" value={data.srsDistribution.reviewing} />
        <StatCard title="SRS Mastered" value={data.srsDistribution.mastered} />
      </div>

      {data.completionByLevel.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Completion by Level</h3>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Level</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-600">Completed</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-600">Total</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-600">Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.completionByLevel.map((row) => (
                  <tr key={row.level} className="border-t">
                    <td className="px-4 py-2 font-medium">{row.level}</td>
                    <td className="px-4 py-2 text-right">{row.completed}</td>
                    <td className="px-4 py-2 text-right">{row.total}</td>
                    <td className="px-4 py-2 text-right">
                      {row.total > 0 ? Math.round((row.completed / row.total) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
