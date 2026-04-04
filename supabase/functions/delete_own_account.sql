-- Self-service account deletion (GDPR)
-- Run this in Supabase SQL editor to create the RPC function.
-- Users call it via supabase.rpc('delete_own_account') to delete their own account.

CREATE OR REPLACE FUNCTION delete_own_account()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Delete the calling user from auth.users (cascades all data via FK constraints)
  DELETE FROM auth.users WHERE id = auth.uid();
$$;

-- Allow any authenticated user to call this function
GRANT EXECUTE ON FUNCTION delete_own_account() TO authenticated;
