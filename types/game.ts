// Game type definitions

export interface Vector2 {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type GameStateType = 'idle' | 'playing' | 'paused' | 'gameover' | 'death_modal' | 'countdown';

export type PlayerState = 'running' | 'jumping' | 'ducking' | 'dead';

export type ObstacleType = 'ground' | 'air' | 'tall';

export interface Sprite {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnimationFrame {
  sprite: Sprite;
  duration: number;
}

export interface ParallaxLayer {
  elements: ParallaxElement[];
  speedMultiplier: number;
  offset: number;
}

export interface ParallaxElement {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  type: 'mountain' | 'cloud' | 'star' | 'crystal' | 'island';
}

export interface GameCallbacks {
  onScoreChange?: (score: number) => void;
  onHighScoreChange?: (highScore: number) => void;
  onGameOver?: (finalScore: number) => void;
  onGameStart?: () => void;
  onLifeUsed?: () => void;
  onLivesChange?: (lives: LivesState) => void;
}

// Lives system types
export interface LivesState {
  count: number;
  lastResetAt: Date;
  secondsUntilReset: number;
}

export type DeathModalChoice = 'continue' | 'restart';

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  high_score: number;
  games_played: number;
}
