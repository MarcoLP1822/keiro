import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isBanned: boolean;
  banReason: string | null;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

async function checkBanStatus(userId: string): Promise<{ banned: boolean; reason: string | null }> {
  if (!supabase) return { banned: false, reason: null };
  const { data } = await supabase
    .from('user_bans')
    .select('reason')
    .eq('user_id', userId)
    .maybeSingle();
  return data ? { banned: true, reason: data.reason } : { banned: false, reason: null };
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const ban = await checkBanStatus(session.user.id);
        setIsBanned(ban.banned);
        setBanReason(ban.reason);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const ban = await checkBanStatus(session.user.id);
        setIsBanned(ban.banned);
        setBanReason(ban.reason);
      } else {
        setIsBanned(false);
        setBanReason(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  return {
    user,
    isLoggedIn: !!user,
    isBanned,
    banReason,
    signUp,
    signIn,
    signOut,
  };
}
