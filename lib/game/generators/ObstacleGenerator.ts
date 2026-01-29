// Obstacle generation system

import { Obstacle, createRandomObstacle } from '../entities/Obstacle';
import { GameConfig } from '../engine/GameConfig';

export class ObstacleGenerator {
  private obstacles: Obstacle[] = [];
  private lastObstacleX: number = 0;
  private distanceToNext: number = 0;
  private timeSinceStart: number = 0;
  private minGap: number = GameConfig.MIN_OBSTACLE_GAP;
  private maxGap: number = GameConfig.MAX_OBSTACLE_GAP;

  constructor() {
    this.reset();
  }

  update(
    deltaTime: number,
    scrollSpeed: number,
    difficultyLevel: number,
    scaryChance: number = 0
  ): void {
    this.timeSinceStart += deltaTime;

    // Update existing obstacles
    this.obstacles.forEach((obstacle) => {
      obstacle.setScrollSpeed(scrollSpeed);
      obstacle.update(deltaTime);
    });

    // Remove off-screen obstacles
    this.obstacles = this.obstacles.filter((o) => !o.isOffScreen());

    // Track distance traveled
    this.distanceToNext -= scrollSpeed;

    // Don't spawn obstacles in the first second
    if (this.timeSinceStart < GameConfig.INITIAL_OBSTACLE_DELAY) {
      return;
    }

    // Spawn new obstacle if enough distance traveled
    if (this.distanceToNext <= 0) {
      this.spawnObstacle(scrollSpeed, difficultyLevel, scaryChance);
    }
  }

  private spawnObstacle(scrollSpeed: number, difficultyLevel: number, scaryChance: number): void {
    // Create obstacle at right edge of screen
    const obstacle = createRandomObstacle(
      GameConfig.GAME_WIDTH + 50,
      scrollSpeed,
      difficultyLevel,
      scaryChance
    );

    this.obstacles.push(obstacle);
    this.lastObstacleX = GameConfig.GAME_WIDTH + 50;

    // Calculate distance to next obstacle
    // Gap decreases as difficulty increases (but more gradually)
    const difficultyFactor = 1 - difficultyLevel * 0.03; // Reduce gap by 3% per level
    const adjustedMinGap = this.minGap * Math.max(0.7, difficultyFactor);
    const adjustedMaxGap = this.maxGap * Math.max(0.7, difficultyFactor);

    this.distanceToNext =
      adjustedMinGap + Math.random() * (adjustedMaxGap - adjustedMinGap);
  }

  getObstacles(): Obstacle[] {
    return this.obstacles;
  }

  setGapRange(min: number, max: number): void {
    this.minGap = min;
    this.maxGap = max;
  }

  reset(): void {
    this.obstacles = [];
    this.lastObstacleX = 0;
    this.distanceToNext = GameConfig.MIN_OBSTACLE_GAP;
    this.timeSinceStart = 0;
    this.minGap = GameConfig.MIN_OBSTACLE_GAP;
    this.maxGap = GameConfig.MAX_OBSTACLE_GAP;
  }

  // Check if player has passed an obstacle (for scoring)
  checkPassedObstacles(playerX: number): number {
    let pointsEarned = 0;

    this.obstacles.forEach((obstacle) => {
      if (!obstacle.isScored && obstacle.x + obstacle.getHitbox().width < playerX) {
        obstacle.markScored();
        pointsEarned += 10; // Bonus points for passing obstacle
      }
    });

    return pointsEarned;
  }

  // Clear obstacles near the player (used when resuming from death)
  clearNearby(maxX: number): void {
    this.obstacles = this.obstacles.filter((o) => o.x > maxX);
    this.distanceToNext = Math.max(this.distanceToNext, this.minGap);
  }
}
