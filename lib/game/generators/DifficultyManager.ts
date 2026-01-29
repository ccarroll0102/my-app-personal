// Difficulty scaling manager

import { GameConfig } from '../engine/GameConfig';

export type TimeOfDay = 'day' | 'sunset' | 'dusk' | 'night';

export class DifficultyManager {
  private currentLevel: number = 0;
  private maxLevel: number = GameConfig.MAX_LEVEL;
  private scrollSpeed: number = GameConfig.BASE_SCROLL_SPEED;

  get level(): number {
    return this.currentLevel;
  }

  get speed(): number {
    return this.scrollSpeed;
  }

  // Get normalized progress (0 to 1)
  get progress(): number {
    return this.currentLevel / this.maxLevel;
  }

  // Get current time of day based on progress
  get timeOfDay(): TimeOfDay {
    const progress = this.progress;
    if (progress < GameConfig.TIME_OF_DAY.DAY_END) {
      return 'day';
    } else if (progress < GameConfig.TIME_OF_DAY.SUNSET_END) {
      return 'sunset';
    } else if (progress < GameConfig.TIME_OF_DAY.DUSK_END) {
      return 'dusk';
    }
    return 'night';
  }

  // Get how "scary" obstacles should be (0 = friendly, 1 = very scary)
  get scaryFactor(): number {
    // Start getting scary after 40% progress
    return Math.max(0, (this.progress - 0.4) / 0.6);
  }

  update(score: number): void {
    // Check if we should level up
    const thresholds = GameConfig.SCORE_THRESHOLDS;
    let newLevel = 0;

    for (let i = 0; i < thresholds.length; i++) {
      if (score >= thresholds[i]) {
        newLevel = i + 1;
      } else {
        break;
      }
    }

    newLevel = Math.min(newLevel, this.maxLevel);

    if (newLevel !== this.currentLevel) {
      this.currentLevel = newLevel;
      this.updateScrollSpeed();
    }
  }

  private updateScrollSpeed(): void {
    // More gradual speed increase
    // Start slow, accelerate more in later levels
    const progressFactor = this.progress;
    const speedRange = GameConfig.MAX_SCROLL_SPEED - GameConfig.BASE_SCROLL_SPEED;

    // Ease-in curve for speed (slower early, faster later)
    const easeIn = progressFactor * progressFactor;

    this.scrollSpeed = GameConfig.BASE_SCROLL_SPEED + speedRange * easeIn;
  }

  // Get obstacle generation parameters based on difficulty
  getObstacleParams(): {
    minGap: number;
    maxGap: number;
    airChance: number;
    tallChance: number;
    scaryChance: number;
  } {
    const levelFactor = this.progress;

    return {
      // Gaps decrease more slowly
      minGap: GameConfig.MIN_OBSTACLE_GAP * (1 - levelFactor * 0.25),
      maxGap: GameConfig.MAX_OBSTACLE_GAP * (1 - levelFactor * 0.25),
      // Air obstacles appear gradually
      airChance: Math.min(0.35, levelFactor * 0.35),
      // Tall obstacles appear later
      tallChance: Math.min(0.15, Math.max(0, (levelFactor - 0.3) * 0.25)),
      // Scary obstacles increase with progress
      scaryChance: this.scaryFactor,
    };
  }

  reset(): void {
    this.currentLevel = 0;
    this.scrollSpeed = GameConfig.BASE_SCROLL_SPEED;
  }
}
