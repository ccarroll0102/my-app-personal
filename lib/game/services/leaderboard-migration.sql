-- Leaderboard System Migration for Supabase
-- Run this in the Supabase SQL Editor

-- Create the leaderboard table (one entry per user with their highest score)
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  high_score INTEGER NOT NULL DEFAULT 0,
  games_played INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view the leaderboard
CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard FOR SELECT
  USING (true);

-- Policy: Users can insert their own entry
CREATE POLICY "Users can insert own entry"
  ON leaderboard FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own entry
CREATE POLICY "Users can update own entry"
  ON leaderboard FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for faster sorting by high score
CREATE INDEX IF NOT EXISTS idx_leaderboard_high_score ON leaderboard(high_score DESC);

-- Function to update or insert a user's score (only if higher)
CREATE OR REPLACE FUNCTION update_high_score(
  p_user_id UUID,
  p_display_name TEXT,
  p_score INTEGER
)
RETURNS TABLE(
  high_score INTEGER,
  games_played INTEGER,
  is_new_high_score BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_high INTEGER;
  v_is_new_high BOOLEAN := FALSE;
BEGIN
  -- Get current high score if exists
  SELECT l.high_score INTO v_current_high
  FROM leaderboard l
  WHERE l.user_id = p_user_id;

  IF NOT FOUND THEN
    -- Insert new entry
    INSERT INTO leaderboard (user_id, display_name, high_score, games_played)
    VALUES (p_user_id, p_display_name, p_score, 1);
    v_is_new_high := TRUE;
  ELSE
    -- Update existing entry
    IF p_score > v_current_high THEN
      UPDATE leaderboard
      SET high_score = p_score,
          display_name = p_display_name,
          games_played = games_played + 1,
          updated_at = NOW()
      WHERE user_id = p_user_id;
      v_is_new_high := TRUE;
    ELSE
      -- Just increment games played
      UPDATE leaderboard
      SET games_played = games_played + 1,
          updated_at = NOW()
      WHERE user_id = p_user_id;
    END IF;
  END IF;

  RETURN QUERY
  SELECT l.high_score, l.games_played, v_is_new_high
  FROM leaderboard l
  WHERE l.user_id = p_user_id;
END;
$$;

-- Function to get top scores (leaderboard)
CREATE OR REPLACE FUNCTION get_leaderboard(p_limit INTEGER DEFAULT 50)
RETURNS TABLE(
  rank BIGINT,
  user_id UUID,
  display_name TEXT,
  high_score INTEGER,
  games_played INTEGER
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    ROW_NUMBER() OVER (ORDER BY l.high_score DESC) as rank,
    l.user_id,
    l.display_name,
    l.high_score,
    l.games_played
  FROM leaderboard l
  ORDER BY l.high_score DESC
  LIMIT p_limit;
$$;
