import { LeaderboardService } from './LeaderboardService';
import { UserIdentityService } from './UserIdentityService';
import { LocalLivesService } from './LocalLivesService';

// Singleton instances - created once, reused everywhere
let leaderboardService: LeaderboardService | null = null;
let userIdentityService: UserIdentityService | null = null;
let localLivesService: LocalLivesService | null = null;

export function getLeaderboardService(): LeaderboardService {
  if (!leaderboardService) {
    leaderboardService = new LeaderboardService();
  }
  return leaderboardService;
}

export function getUserIdentityService(): UserIdentityService {
  if (!userIdentityService) {
    userIdentityService = new UserIdentityService();
  }
  return userIdentityService;
}

export function getLocalLivesService(): LocalLivesService {
  if (!localLivesService) {
    localLivesService = new LocalLivesService();
  }
  return localLivesService;
}

// Re-export types for convenience
export type { UserIdentity } from './UserIdentityService';
export type { LeaderboardRankEntry } from './LeaderboardService';
