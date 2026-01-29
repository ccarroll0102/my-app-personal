// Obstacle entities

import { Entity } from './Entity';
import { GameConfig } from '../engine/GameConfig';
import { ObstacleType } from '@/types/game';

// Obstacle variants for visual variety
export type ObstacleVariant = 'friendly' | 'scary';

export class Obstacle extends Entity {
  readonly type: ObstacleType;
  readonly variant: ObstacleVariant;
  private scored: boolean = false;
  private color: string;
  private scrollSpeed: number;

  constructor(
    x: number,
    type: ObstacleType,
    scrollSpeed: number,
    variant: ObstacleVariant = 'friendly',
    width?: number,
    height?: number
  ) {
    const obstacleConfig = Obstacle.getConfigForType(type, variant, width, height);
    super(x, obstacleConfig.y, obstacleConfig.width, obstacleConfig.height);

    this.type = type;
    this.variant = variant;
    this.scrollSpeed = scrollSpeed;
    this.color = obstacleConfig.color;
  }

  private static getConfigForType(
    type: ObstacleType,
    variant: ObstacleVariant,
    customWidth?: number,
    customHeight?: number
  ): { y: number; width: number; height: number; color: string } {
    switch (type) {
      case 'ground':
        return {
          y: GameConfig.GROUND_Y - (customHeight ?? 32),
          width: customWidth ?? 24 + Math.random() * 24,
          height: customHeight ?? 32 + Math.random() * 16,
          color: variant === 'scary' ? GameConfig.COLORS.OBSTACLE_SNAKE : GameConfig.COLORS.OBSTACLE_CRYSTAL,
        };
      case 'air':
        return {
          y: GameConfig.AIR_OBSTACLE_Y,
          width: customWidth ?? 32,
          height: customHeight ?? GameConfig.AIR_OBSTACLE_HEIGHT,
          color: variant === 'scary' ? GameConfig.COLORS.OBSTACLE_CURSE : GameConfig.COLORS.OBSTACLE_SPELL,
        };
      case 'tall':
        return {
          y: GameConfig.GROUND_Y - 64,
          width: customWidth ?? 32,
          height: customHeight ?? 64,
          color: variant === 'scary' ? GameConfig.COLORS.OBSTACLE_GHOST : GameConfig.COLORS.OBSTACLE_ISLAND,
        };
    }
  }

  get isScored(): boolean {
    return this.scored;
  }

  markScored(): void {
    this.scored = true;
  }

  isOffScreen(): boolean {
    return this.position.x + this.width < 0;
  }

  update(deltaTime: number): void {
    this.position.x -= this.scrollSpeed;
  }

  setScrollSpeed(speed: number): void {
    this.scrollSpeed = speed;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const x = Math.floor(this.position.x);
    const y = Math.floor(this.position.y);

    if (this.variant === 'scary') {
      switch (this.type) {
        case 'ground':
          this.renderSnake(ctx, x, y);
          break;
        case 'air':
          this.renderCurse(ctx, x, y);
          break;
        case 'tall':
          this.renderGhost(ctx, x, y);
          break;
      }
    } else {
      switch (this.type) {
        case 'ground':
          this.renderCrystal(ctx, x, y);
          break;
        case 'air':
          this.renderSparkle(ctx, x, y);
          break;
        case 'tall':
          this.renderFloatingIsland(ctx, x, y);
          break;
      }
    }
  }

  // ===== FRIENDLY OBSTACLES =====

  private renderCrystal(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Magical crystal cluster
    const w = Math.floor(this.width);
    const h = Math.floor(this.height);

    // Main crystal
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(x + w/3, y, w/3, h);

    // Crystal highlight
    ctx.fillStyle = '#88ffff';
    ctx.fillRect(x + w/3 + 2, y + 2, w/6, h/2);

    // Side crystals
    ctx.fillStyle = '#00cccc';
    ctx.fillRect(x, y + h/3, w/4, h * 2/3);
    ctx.fillRect(x + w * 3/4, y + h/4, w/4, h * 3/4);

    // Base glow
    ctx.fillStyle = '#004444';
    ctx.fillRect(x - 2, y + h - 4, w + 4, 4);
  }

  private renderSparkle(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Floating sparkle/star
    const w = Math.floor(this.width);
    const h = Math.floor(this.height);

    // Outer glow
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x, y, w, h);

    // Inner bright
    ctx.fillStyle = '#FFEC8B';
    ctx.fillRect(x + 4, y + 4, w - 8, h - 8);

    // Core
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + w/3, y + h/3, w/3, h/3);

    // Sparkle points
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 4, y + h/2 - 2, 4, 4);
    ctx.fillRect(x + w, y + h/2 - 2, 4, 4);
    ctx.fillRect(x + w/2 - 2, y - 4, 4, 4);
    ctx.fillRect(x + w/2 - 2, y + h, 4, 4);
  }

  private renderFloatingIsland(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Floating island obstacle (must jump over)
    const w = Math.floor(this.width);
    const h = Math.floor(this.height);

    // Island base (rock)
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + 4, y + h/2, w - 8, h/2);
    ctx.fillRect(x, y + h * 2/3, w, h/3);

    // Grass top
    ctx.fillStyle = '#228b22';
    ctx.fillRect(x + 2, y + h/2 - 4, w - 4, 8);

    // Tree/crystal on top
    ctx.fillStyle = '#006400';
    ctx.fillRect(x + w/2 - 4, y + 4, 8, h/2 - 8);
    ctx.fillRect(x + w/2 - 8, y + 8, 16, 8);
    ctx.fillRect(x + w/2 - 6, y, 12, 12);

    // Bottom rocks
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 4, y + h - 8, 8, 8);
    ctx.fillRect(x + w - 12, y + h - 6, 6, 6);
  }

  // ===== SCARY OBSTACLES =====

  private renderSnake(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Menacing magical cobra
    const w = Math.floor(this.width);
    const h = Math.floor(this.height);
    const centerX = x + w / 2;

    // Coiled body base - multiple rings
    ctx.fillStyle = '#1a6b1a';
    ctx.fillRect(x + 2, y + h - 12, w - 4, 12);

    // Body coil details
    ctx.fillStyle = '#228b22';
    ctx.fillRect(x + 4, y + h - 10, w - 8, 8);

    // Scale pattern on coils
    ctx.fillStyle = '#0d4d0d';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(x + 6 + i * 10, y + h - 8, 4, 4);
    }

    // Neck rising from coils
    ctx.fillStyle = '#228b22';
    ctx.fillRect(centerX - 5, y + h - 24, 10, 14);

    // Hood (expanded cobra hood)
    ctx.fillStyle = '#2d8b2d';
    ctx.fillRect(centerX - 10, y + 8, 20, 16);
    ctx.fillRect(centerX - 12, y + 12, 24, 8);

    // Hood inner pattern
    ctx.fillStyle = '#c4a000';
    ctx.fillRect(centerX - 6, y + 14, 12, 6);
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(centerX - 3, y + 15, 6, 4);

    // Head
    ctx.fillStyle = '#1a6b1a';
    ctx.fillRect(centerX - 6, y + 4, 12, 10);
    ctx.fillRect(centerX - 4, y + 2, 8, 4);

    // Glowing evil eyes
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(centerX - 4, y + 6, 3, 3);
    ctx.fillRect(centerX + 1, y + 6, 3, 3);
    // Eye glow
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(centerX - 3, y + 7, 1, 1);
    ctx.fillRect(centerX + 2, y + 7, 1, 1);

    // Forked tongue (flickering)
    ctx.fillStyle = '#ff3333';
    ctx.fillRect(centerX - 1, y - 2, 2, 4);
    ctx.fillRect(centerX - 3, y - 4, 2, 3);
    ctx.fillRect(centerX + 1, y - 4, 2, 3);

    // Fangs
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(centerX - 3, y + 12, 2, 4);
    ctx.fillRect(centerX + 1, y + 12, 2, 4);

    // Magical aura around snake
    ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  }

  private renderCurse(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Evil curse/dark magic
    const w = Math.floor(this.width);
    const h = Math.floor(this.height);

    // Dark aura
    ctx.fillStyle = '#330000';
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);

    // Main curse orb
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(x, y, w, h);

    // Inner darkness
    ctx.fillStyle = '#4a0000';
    ctx.fillRect(x + 4, y + 4, w - 8, h - 8);

    // Evil eye
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + w/3, y + h/3, w/3, h/3);
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(x + w/2 - 2, y + h/2 - 2, 4, 4);

    // Dark tendrils
    ctx.fillStyle = '#330000';
    ctx.fillRect(x - 6, y + h/2 - 2, 6, 4);
    ctx.fillRect(x + w, y + h/2 - 2, 6, 4);
    ctx.fillRect(x + w/2 - 2, y - 6, 4, 6);
    ctx.fillRect(x + w/2 - 2, y + h, 4, 6);
  }

  private renderGhost(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Scary ghost
    const w = Math.floor(this.width);
    const h = Math.floor(this.height);

    // Ghost body (wispy)
    ctx.fillStyle = '#9966CC';
    ctx.fillRect(x + 4, y, w - 8, h - 16);
    ctx.fillRect(x, y + 8, w, h - 24);

    // Ghost bottom (wavy)
    ctx.fillStyle = '#8855BB';
    ctx.fillRect(x, y + h - 16, 8, 12);
    ctx.fillRect(x + 12, y + h - 20, 8, 16);
    ctx.fillRect(x + w - 8, y + h - 16, 8, 12);

    // Ghost face
    // Hollow eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 6, y + 12, 6, 8);
    ctx.fillRect(x + w - 12, y + 12, 6, 8);

    // Glowing pupils
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + 8, y + 14, 2, 4);
    ctx.fillRect(x + w - 10, y + 14, 2, 4);

    // Scary mouth
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 8, y + 26, w - 16, 6);
    ctx.fillRect(x + 10, y + 24, 4, 2);
    ctx.fillRect(x + w - 14, y + 24, 4, 2);

    // Ghostly glow
    ctx.fillStyle = 'rgba(153, 102, 204, 0.3)';
    ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  }
}

// Factory function to create random obstacles
export function createRandomObstacle(
  x: number,
  scrollSpeed: number,
  difficultyLevel: number,
  scaryChance: number = 0
): Obstacle {
  // At low difficulty, only ground obstacles
  // As difficulty increases, add air obstacles to duck under
  const airChance = Math.min(0.35, difficultyLevel * 0.035);

  const rand = Math.random();

  let type: ObstacleType;
  if (rand < airChance) {
    type = 'air';
  } else {
    type = 'ground';
  }

  // Determine variant based on scary chance
  const variant: ObstacleVariant = Math.random() < scaryChance ? 'scary' : 'friendly';

  return new Obstacle(x, type, scrollSpeed, variant);
}
