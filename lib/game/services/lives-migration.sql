-- Lives System Migration for Supabase
-- Run this in the Supabase SQL Editor

-- Create the user_lives table
CREATE TABLE IF NOT EXISTS user_lives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lives_count INTEGER NOT NULL DEFAULT 3 CHECK (lives_count >= 0 AND lives_count <= 3),
  last_reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_lives ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own lives
CREATE POLICY "Users can view own lives"
  ON user_lives FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own lives
CREATE POLICY "Users can update own lives"
  ON user_lives FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own lives
CREATE POLICY "Users can insert own lives"
  ON user_lives FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_lives_user_id ON user_lives(user_id);

-- Function to get user lives with automatic reset after 24 hours
CREATE OR REPLACE FUNCTION get_user_lives(p_user_id UUID)
RETURNS TABLE(
  lives_count INTEGER,
  last_reset_at TIMESTAMPTZ,
  seconds_until_reset INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_lives user_lives%ROWTYPE;
  v_hours_since_reset NUMERIC;
BEGIN
  -- Get or create user lives record
  SELECT * INTO v_user_lives FROM user_lives WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO user_lives (user_id, lives_count, last_reset_at)
    VALUES (p_user_id, 3, NOW())
    RETURNING * INTO v_user_lives;
  END IF;

  -- Calculate hours since last reset
  v_hours_since_reset := EXTRACT(EPOCH FROM (NOW() - v_user_lives.last_reset_at)) / 3600;

  -- Reset lives if 24+ hours have passed
  IF v_hours_since_reset >= 24 THEN
    UPDATE user_lives
    SET lives_count = 3, last_reset_at = NOW(), updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING * INTO v_user_lives;
  END IF;

  -- Return lives with seconds until reset
  RETURN QUERY SELECT
    v_user_lives.lives_count,
    v_user_lives.last_reset_at,
    GREATEST(0, CEIL(EXTRACT(EPOCH FROM (v_user_lives.last_reset_at + INTERVAL '24 hours' - NOW()))))::INTEGER;
END;
$$;
