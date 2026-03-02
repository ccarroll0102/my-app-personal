import { LivesState } from '@/types/game';

interface LocalLivesData {
  count: number;
  lastResetAt: string; // ISO date string
}

const LIVES_KEY = 'wizardRunLives';
const MAX_LIVES = 3;
const RESET_HOURS = 24;

export class LocalLivesService {
  getLives(): LivesState {
    if (typeof window === 'undefined') {
      return this.getDefaultLives();
    }

    try {
      const stored = localStorage.getItem(LIVES_KEY);

      if (!stored) {
        return this.initializeLives();
      }

      const data: LocalLivesData = JSON.parse(stored);
      const lastReset = new Date(data.lastResetAt);
      const hoursSinceReset = (Date.now() - lastReset.getTime()) / (1000 * 60 * 60);

      // Reset lives if 24+ hours have passed
      if (hoursSinceReset >= RESET_HOURS) {
        return this.initializeLives();
      }

      const secondsUntilReset = Math.max(
        0,
        Math.ceil((RESET_HOURS * 60 * 60) - (hoursSinceReset * 60 * 60))
      );

      return {
        count: data.count,
        lastResetAt: lastReset,
        secondsUntilReset,
      };
    } catch {
      return this.initializeLives();
    }
  }

  useLife(): LivesState {
    const current = this.getLives();
    if (current.count <= 0) {
      throw new Error('No lives remaining');
    }

    const newCount = current.count - 1;
    const data: LocalLivesData = {
      count: newCount,
      lastResetAt: current.lastResetAt.toISOString(),
    };
    localStorage.setItem(LIVES_KEY, JSON.stringify(data));

    return {
      ...current,
      count: newCount,
    };
  }

  private initializeLives(): LivesState {
    const now = new Date();
    const data: LocalLivesData = {
      count: MAX_LIVES,
      lastResetAt: now.toISOString(),
    };
    localStorage.setItem(LIVES_KEY, JSON.stringify(data));

    return {
      count: MAX_LIVES,
      lastResetAt: now,
      secondsUntilReset: RESET_HOURS * 60 * 60,
    };
  }

  private getDefaultLives(): LivesState {
    return {
      count: MAX_LIVES,
      lastResetAt: new Date(),
      secondsUntilReset: RESET_HOURS * 60 * 60,
    };
  }
}
