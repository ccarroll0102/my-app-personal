// Game configuration constants

export const GameConfig = {
  // Canvas dimensions (virtual resolution)
  GAME_WIDTH: 600,
  GAME_HEIGHT: 200,

  // Physics - Variable gravity for better jump feel
  GRAVITY: 0.6,              // Base gravity (rising)
  GRAVITY_FALLING: 1.2,      // Faster gravity when falling
  JUMP_VELOCITY: -13,        // Initial jump velocity
  JUMP_APEX_THRESHOLD: 2,    // Velocity range considered "at apex"
  JUMP_APEX_GRAVITY: 0.3,    // Floaty gravity at jump peak
  TERMINAL_VELOCITY: 18,     // Max fall speed

  // Player
  PLAYER_X: 50,
  PLAYER_WIDTH: 32,
  PLAYER_HEIGHT: 48,
  PLAYER_DUCK_HEIGHT: 28,
  GROUND_Y: 160, // Ground level Y position

  // Obstacles
  OBSTACLE_MIN_WIDTH: 24,
  OBSTACLE_MAX_WIDTH: 48,
  OBSTACLE_MIN_HEIGHT: 32,
  OBSTACLE_MAX_HEIGHT: 48,
  AIR_OBSTACLE_HEIGHT: 24,
  AIR_OBSTACLE_Y: 100,

  // Scrolling - start SLOW and gradually increase
  BASE_SCROLL_SPEED: 2.5,  // Much slower start
  MAX_SCROLL_SPEED: 10,

  // Difficulty - more gradual progression (15 levels)
  MAX_LEVEL: 15,
  SCORE_THRESHOLDS: [
    50, 150, 300, 500, 750,      // Early game (day time, friendly obstacles)
    1000, 1400, 1900, 2500,      // Mid game (sunset, mixed obstacles)
    3200, 4000, 5000, 6200,      // Late game (night, scary obstacles)
    7500, 9000                    // End game (deep night, very scary)
  ],

  // Obstacle generation - more generous gaps at start
  MIN_OBSTACLE_GAP: 350,
  MAX_OBSTACLE_GAP: 700,
  INITIAL_OBSTACLE_DELAY: 2000, // More time before first obstacle

  // Time of day thresholds (as percentage of max level)
  TIME_OF_DAY: {
    DAY_END: 0.3,      // 0-30% = day
    SUNSET_END: 0.5,   // 30-50% = sunset
    DUSK_END: 0.7,     // 50-70% = dusk
    // 70-100% = night
  },

  // Colors (magical theme) - Day time colors
  COLORS: {
    // Day sky
    SKY_DAY_TOP: '#87CEEB',
    SKY_DAY_BOTTOM: '#E0F6FF',
    // Sunset sky
    SKY_SUNSET_TOP: '#FF6B35',
    SKY_SUNSET_BOTTOM: '#FFB347',
    // Dusk sky
    SKY_DUSK_TOP: '#4A1259',
    SKY_DUSK_BOTTOM: '#8B4789',
    // Night sky
    SKY_NIGHT_TOP: '#0a0015',
    SKY_NIGHT_BOTTOM: '#1a0a2e',
    // Legacy (keep for compatibility)
    SKY_TOP: '#1a0a2e',
    SKY_BOTTOM: '#4a1259',
    // Ground colors that shift
    GROUND_DAY: '#4CAF50',
    GROUND_DAY_DARK: '#388E3C',
    GROUND_NIGHT: '#1b5e20',
    GROUND_NIGHT_DARK: '#145214',
    GROUND: '#1b5e20',
    GROUND_DARK: '#145214',
    PLAYER: '#ffffff',
    PLAYER_ACCENT: '#ffd700',
    // Friendly obstacle colors
    OBSTACLE_CRYSTAL: '#00ffff',
    OBSTACLE_SPELL: '#ff69b4',
    OBSTACLE_ISLAND: '#8b4513',
    OBSTACLE_SPARKLE: '#FFD700',
    // Scary obstacle colors
    OBSTACLE_SNAKE: '#00AA00',
    OBSTACLE_CURSE: '#8B0000',
    OBSTACLE_GHOST: '#9966CC',
    OBSTACLE_SKULL: '#CCCCCC',
    STAR: '#ffffff',
    CLOUD: '#e8e8ff',
    MOUNTAIN_FAR: '#2d1b4e',
    MOUNTAIN_NEAR: '#1a0f2e',
  },

  // Scoring
  POINTS_PER_FRAME: 0.15,  // Slightly faster scoring for satisfaction
  MILESTONE_INTERVAL: 100,
} as const;

export type GameConfigType = typeof GameConfig;
