-- Keiro Cloud Sync Schema
-- Run this in your Supabase SQL editor to set up the cloud sync tables.

-- Module progress
CREATE TABLE module_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'locked',
  score INTEGER,
  completed_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- SRS Cards
CREATE TABLE srs_cards (
  id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  content_type TEXT NOT NULL,
  interval INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  ease_factor REAL DEFAULT 2.5,
  next_review DATE,
  last_review DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, id)
);

-- Daily plans
CREATE TABLE daily_plans (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  modules JSONB DEFAULT '[]',
  completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);

-- Settings
CREATE TABLE user_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, key)
);

-- Row Level Security (each user can only access their own data)
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE srs_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own data" ON module_progress
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own data" ON srs_cards
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own data" ON daily_plans
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own data" ON user_settings
  FOR ALL USING (auth.uid() = user_id);
