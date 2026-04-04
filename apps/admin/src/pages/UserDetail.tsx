import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabaseAdmin } from '../services/supabase-admin';
import { BanDialog } from '../components/BanDialog';
import { DeleteDialog } from '../components/DeleteDialog';

interface UserData {
  user: User;
  isBanned: boolean;
  banReason?: string;
  modulesCompleted: number;
  modulesTotal: number;
  srsCards: { learning: number; reviewing: number; mastered: number };
  currentStreak: number;
}

interface UserDetailProps {
  userId: string;
  adminUser: User;
  onBack: () => void;
}

export function UserDetail({ userId, adminUser, onBack }: UserDetailProps) {
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBan, setShowBan] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  async function loadUser() {
    if (!supabaseAdmin) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (!user) throw new Error('User not found');

      const [
        { data: ban },
        { data: progress },
        { data: cards },
        { data: streak },
      ] = await Promise.all([
        supabaseAdmin.from('user_bans').select('reason').eq('user_id', userId).maybeSingle(),
        supabaseAdmin.from('module_progress').select('status').eq('user_id', userId),
        supabaseAdmin.from('srs_cards').select('interval').eq('user_id', userId),
        supabaseAdmin.from('user_settings').select('value').eq('user_id', userId).eq('key', 'streak').maybeSingle(),
      ]);

      const completed = (progress ?? []).filter((p) => p.status === 'completed').length;
      let learning = 0, reviewing = 0, mastered = 0;
      for (const c of cards ?? []) {
        if (c.interval <= 1) learning++;
        else if (c.interval < 21) reviewing++;
        else mastered++;
      }

      const streakVal = (streak?.value as { currentStreak?: number })?.currentStreak ?? 0;

      setData({
        user,
        isBanned: !!ban,
        banReason: ban?.reason,
        modulesCompleted: completed,
        modulesTotal: (progress ?? []).length,
        srsCards: { learning, reviewing, mastered },
        currentStreak: streakVal,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUser(); }, [userId]);

  async function handleBan(reason: string) {
    if (!supabaseAdmin || !data) return;
    await supabaseAdmin.from('user_bans').insert({
      user_id: userId,
      reason,
      banned_by: adminUser.id,
    });
    await supabaseAdmin.from('admin_audit_log').insert({
      admin_id: adminUser.id,
      admin_email: adminUser.email!,
      action: 'ban',
      target_user_id: userId,
      target_user_email: data.user.email,
      reason,
    });
    setShowBan(false);
    loadUser();
  }

  async function handleUnban() {
    if (!supabaseAdmin || !data) return;
    await supabaseAdmin.from('user_bans').delete().eq('user_id', userId);
    await supabaseAdmin.from('admin_audit_log').insert({
      admin_id: adminUser.id,
      admin_email: adminUser.email!,
      action: 'unban',
      target_user_id: userId,
      target_user_email: data.user.email,
    });
    loadUser();
  }

  async function handleDelete() {
    if (!supabaseAdmin || !data) return;
    await supabaseAdmin.from('admin_audit_log').insert({
      admin_id: adminUser.id,
      admin_email: adminUser.email!,
      action: 'delete_user',
      target_user_id: userId,
      target_user_email: data.user.email,
    });
    await supabaseAdmin.auth.admin.deleteUser(userId);
    setShowDelete(false);
    onBack();
  }

  if (loading) return <div className="p-8 text-gray-500">Loading user...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return null;

  return (
    <div className="p-6 max-w-2xl">
      <button
        onClick={onBack}
        className="text-sm text-blue-600 hover:underline mb-4"
      >
        &larr; Back to user list
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{data.user.email}</h2>
          <p className="text-sm text-gray-500">
            Joined {new Date(data.user.created_at).toLocaleDateString()}
            {data.user.last_sign_in_at && (
              <> &middot; Last seen {new Date(data.user.last_sign_in_at).toLocaleDateString()}</>
            )}
          </p>
        </div>
        {data.isBanned && (
          <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
            Banned
          </span>
        )}
      </div>

      {data.isBanned && data.banReason && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          <strong>Ban reason:</strong> {data.banReason}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">Modules</p>
          <p className="text-xl font-bold">{data.modulesCompleted} / {data.modulesTotal}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">Streak</p>
          <p className="text-xl font-bold">{data.currentStreak} days</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">SRS Learning</p>
          <p className="text-xl font-bold">{data.srsCards.learning}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">SRS Reviewing</p>
          <p className="text-xl font-bold">{data.srsCards.reviewing}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">SRS Mastered</p>
          <p className="text-xl font-bold">{data.srsCards.mastered}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 border-t pt-4">
        {data.isBanned ? (
          <button
            onClick={handleUnban}
            className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
          >
            Unban User
          </button>
        ) : (
          <button
            onClick={() => setShowBan(true)}
            className="px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100"
          >
            Ban User
          </button>
        )}
        <button
          onClick={() => setShowDelete(true)}
          className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
        >
          Delete User
        </button>
      </div>

      {showBan && (
        <BanDialog
          userEmail={data.user.email ?? ''}
          onConfirm={handleBan}
          onCancel={() => setShowBan(false)}
        />
      )}

      {showDelete && (
        <DeleteDialog
          userEmail={data.user.email ?? ''}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
