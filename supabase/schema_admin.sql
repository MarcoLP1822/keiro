-- Keiro Admin Schema
-- Run this in your Supabase SQL editor AFTER schema.sql

-- Admin users (who can access admin features)
CREATE TABLE admin_users (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit trail (INSERT only — never update or delete)
CREATE TABLE admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_user_id UUID,
  target_user_email TEXT,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User bans
CREATE TABLE user_bans (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  reason TEXT NOT NULL,
  banned_by UUID NOT NULL,
  banned_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;

-- Admin-only policies (service-role bypasses these anyway, but defense in depth)
CREATE POLICY "admin_only" ON admin_users FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "admin_read_audit" ON admin_audit_log FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "admin_insert_audit" ON admin_audit_log FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "admin_manage_bans" ON user_bans FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Users can check their own ban status (anon-key client)
CREATE POLICY "users_check_own_ban" ON user_bans FOR SELECT
  USING (auth.uid() = user_id);

-- After running this, insert yourself as admin:
-- INSERT INTO admin_users (user_id, email)
-- SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL_HERE';
