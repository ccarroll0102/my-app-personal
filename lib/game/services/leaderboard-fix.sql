-- Fix for ambiguous column reference in update_high_score function
-- Run this in Supabase SQL Editor

-- Drop and recreate the function with fixed column aliases
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
  v_games INTEGER;
  v_is_new_high BOOLEAN := FALSE;
BEGIN
  -- Check if user already has an entry
  SELECT l.high_score, l.games_played INTO v_current_high, v_games
  FROM leaderboard l
  WHERE l.user_id = p_user_id;

  IF NOT FOUND THEN
    -- First game for this user - insert new entry
    INSERT INTO leaderboard (user_id, display_name, high_score, games_played)
    VALUES (p_user_id, p_display_name, p_score, 1);
    v_current_high := p_score;
    v_games := 1;
    v_is_new_high := TRUE;
  ELSE
    -- Existing user - check if new high score
    IF p_score > v_current_high THEN
      UPDATE leaderboard l
      SET high_score = p_score,
          display_name = p_display_name,
          games_played = l.games_played + 1,
          updated_at = NOW()
      WHERE l.user_id = p_user_id;
      v_current_high := p_score;
      v_games := v_games + 1;
      v_is_new_high := TRUE;
    ELSE
      -- Just increment games played
      UPDATE leaderboard l
      SET games_played = l.games_played + 1,
          updated_at = NOW()
      WHERE l.user_id = p_user_id;
      v_games := v_games + 1;
    END IF;
  END IF;

  -- Return using local variables instead of querying table again
  RETURN QUERY SELECT v_current_high, v_games, v_is_new_high;
END;
$$;
