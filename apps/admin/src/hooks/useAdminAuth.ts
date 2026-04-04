import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabaseAdmin } from '../services/supabase-admin';

interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string) => Promise<{ error: string | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

export function useAdminAuth(): AdminAuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAdminRole = useCallback(async (u: User) => {
    if (!supabaseAdmin) return false;
    const { data } = await supabaseAdmin
      .from('admin_users')
      .select('user_id')
      .eq('user_id', u.id)
      .maybeSingle();
    return !!data;
  }, []);

  useEffect(() => {
    if (!supabaseAdmin) {
      setIsLoading(false);
      setError('Supabase not configured. Check .env file.');
      return;
    }

    supabaseAdmin.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        const admin = await checkAdminRole(session.user);
        setIsAdmin(admin);
        if (!admin) setError('Access denied. You are not an admin.');
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabaseAdmin.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          const admin = await checkAdminRole(u);
          setIsAdmin(admin);
          if (!admin) setError('Access denied. You are not an admin.');
          else setError(null);
        } else {
          setIsAdmin(false);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [checkAdminRole]);

  const login = useCallback(async (email: string) => {
    if (!supabaseAdmin) return { error: 'Supabase not configured' };
    setError(null);
    const { error: err } = await supabaseAdmin.auth.signInWithOtp({ email });
    return { error: err?.message ?? null };
  }, []);

  const verifyOtp = useCallback(async (email: string, token: string) => {
    if (!supabaseAdmin) return { error: 'Supabase not configured' };
    const { error: err } = await supabaseAdmin.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    return { error: err?.message ?? null };
  }, []);

  const logout = useCallback(async () => {
    if (!supabaseAdmin) return;
    await supabaseAdmin.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setError(null);
  }, []);

  return { user, isAdmin, isLoading, error, login, verifyOtp, logout };
}
