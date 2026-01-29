import { createClient } from '@/lib/supabase/client';
import { LeaderboardEntry } from '@/types/game';

export interface LeaderboardRankEntry extends LeaderboardEntry {
  rank: number;
}

export class LeaderboardService {
  private supabase = createClient();

  async getLeaderboard(limit: number = 50): Promise<LeaderboardRankEntry[]> {
    const { data, error } = await this.supabase.rpc('get_leaderboard', {
      p_limit: limit,
    });

    if (error) {
      console.warn('Failed to fetch leaderboard:', error.message);
      return [];
    }

    return (data || []).map((entry: {
      rank: number;
      user_id: string;
      display_name: string;
      high_score: number;
      games_played: number;
    }) => ({
      rank: Number(entry.rank),
      user_id: entry.user_id,
      display_name: entry.display_name,
      high_score: entry.high_score,
      games_played: entry.games_played,
    }));
  }

  async updateHighScore(
    userId: string,
    displayName: string,
    score: number
  ): Promise<{ highScore: number; gamesPlayed: number; isNewHighScore: boolean }> {
    const { data, error } = await this.supabase.rpc('update_high_score', {
      p_user_id: userId,
      p_display_name: displayName,
      p_score: score,
    });

    if (error) {
      console.error('Failed to update high score:', error.message);
      throw error;
    }

    const result = data[0];
    return {
      highScore: result.high_score,
      gamesPlayed: result.games_played,
      isNewHighScore: result.is_new_high_score,
    };
  }

  async getUserRank(userId: string): Promise<number | null> {
    const leaderboard = await this.getLeaderboard(1000);
    const entry = leaderboard.find((e) => e.user_id === userId);
    return entry?.rank ?? null;
  }
}
