import { createClient } from '@/lib/supabase/client';
import { LivesState } from '@/types/game';

export class LivesService {
  private supabase = createClient();

  async getUserLives(userId: string): Promise<LivesState> {
    const { data, error } = await this.supabase.rpc('get_user_lives', {
      p_user_id: userId,
    });

    if (error) {
      // Log detailed error info
      console.warn(
        'Lives system not available (run SQL migration in Supabase):',
        error.message || error.code || 'Unknown error'
      );
      // Return default state on error
      return {
        count: 3,
        lastResetAt: new Date(),
        secondsUntilReset: 86400,
      };
    }

    if (!data || data.length === 0) {
      console.warn('No lives data returned, using defaults');
      return {
        count: 3,
        lastResetAt: new Date(),
        secondsUntilReset: 86400,
      };
    }

    const result = data[0];
    return {
      count: result.lives_count,
      lastResetAt: new Date(result.last_reset_at),
      secondsUntilReset: result.seconds_until_reset,
    };
  }

  async useLife(userId: string): Promise<LivesState> {
    // First get current lives
    const current = await this.getUserLives(userId);

    if (current.count <= 0) {
      throw new Error('No lives remaining');
    }

    // Decrement lives
    const { error } = await this.supabase
      .from('user_lives')
      .update({
        lives_count: current.count - 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to use life:', error);
      throw error;
    }

    // Return updated state
    return {
      count: current.count - 1,
      lastResetAt: current.lastResetAt,
      secondsUntilReset: current.secondsUntilReset,
    };
  }
}
