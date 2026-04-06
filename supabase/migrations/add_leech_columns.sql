-- Run this if your srs_cards table already exists (adds missing columns)
ALTER TABLE srs_cards ADD COLUMN IF NOT EXISTS lapse_count INTEGER DEFAULT 0;
ALTER TABLE srs_cards ADD COLUMN IF NOT EXISTS is_leech BOOLEAN DEFAULT FALSE;
