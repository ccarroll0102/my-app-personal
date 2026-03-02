-- Leaderboard Migration V2: Complete leaderboard setup without auth
-- Run this in Supabase SQL Editor

-- 1. Create leaderboard table if it doesn't exist
CREATE TABLE IF NOT EXISTS leaderboard (
  user_id UUID PRIMARY KEY,
  display_name TEXT NOT NULL,
  high_score INTEGER NOT NULL DEFAULT 0,
  games_played INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- 3. Drop the foreign key constraint on user_id (if exists from previous setup)
ALTER TABLE leaderboard
  DROP CONSTRAINT IF EXISTS leaderboard_user_id_fkey;

-- 2. Drop the user_lives table (no longer needed with localStorage)
DROP TABLE IF EXISTS user_lives;

-- 3. Drop the get_user_lives function
DROP FUNCTION IF EXISTS get_user_lives(UUID);

-- 4. Update RLS policies to allow any user_id (not just auth.uid())
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert own entry" ON leaderboard;
DROP POLICY IF EXISTS "Users can update own entry" ON leaderboard;

-- Create new open policies (the client manages user_id via localStorage)
CREATE POLICY "Anyone can insert entry"
  ON leaderboard FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update own entry"
  ON leaderboard FOR UPDATE
  USING (true);

-- Create SELECT policy for viewing leaderboard
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON leaderboard;
CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard FOR SELECT
  USING (true);

-- 5. Update the update_high_score function to work without auth
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
  -- Check if user already has an entry
  SELECT l.high_score INTO v_current_high
  FROM leaderboard l
  WHERE l.user_id = p_user_id;

  IF NOT FOUND THEN
    -- First game for this user - insert new entry
    INSERT INTO leaderboard (user_id, display_name, high_score, games_played)
    VALUES (p_user_id, p_display_name, p_score, 1);
    v_is_new_high := TRUE;
  ELSE
    -- Existing user - check if new high score
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

  -- Return the current stats
  RETURN QUERY
  SELECT l.high_score, l.games_played, v_is_new_high
  FROM leaderboard l
  WHERE l.user_id = p_user_id;
END;
$$;

-- 6. Create or replace the get_leaderboard function to fetch ranked scores
CREATE OR REPLACE FUNCTION get_leaderboard(p_limit INTEGER DEFAULT 50)
RETURNS TABLE(
  rank BIGINT,
  user_id UUID,
  display_name TEXT,
  high_score INTEGER,
  games_played INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY l.high_score DESC) as rank,
    l.user_id,
    l.display_name,
    l.high_score,
    l.games_played
  FROM leaderboard l
  ORDER BY l.high_score DESC
  LIMIT p_limit;
END;
$$;
