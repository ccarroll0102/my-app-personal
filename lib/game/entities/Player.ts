// Player (Wizard) entity

import { Entity } from './Entity';
import { GameConfig } from '../engine/GameConfig';
import { PlayerState } from '@/types/game';

export class Player extends Entity {
  private state: PlayerState = 'running';
  private isGrounded: boolean = true;
  private animationFrame: number = 0;
  private animationTimer: number = 0;
  private readonly animationSpeed: number = 100; // ms per frame

  constructor() {
    super(
      GameConfig.PLAYER_X,
      GameConfig.GROUND_Y - GameConfig.PLAYER_HEIGHT,
      GameConfig.PLAYER_WIDTH,
      GameConfig.PLAYER_HEIGHT
    );
  }

  get currentState(): PlayerState {
    return this.state;
  }

  jump(): void {
    if (this.isGrounded && this.state !== 'ducking') {
      this.velocity.y = GameConfig.JUMP_VELOCITY;
      this.isGrounded = false;
      this.state = 'jumping';
    }
  }

  duck(): void {
    if (this.isGrounded && this.state !== 'jumping') {
      this.state = 'ducking';
      this.height = GameConfig.PLAYER_DUCK_HEIGHT;
      this.position.y = GameConfig.GROUND_Y - GameConfig.PLAYER_DUCK_HEIGHT;
    }
  }

  standUp(): void {
    if (this.state === 'ducking') {
      this.state = 'running';
      this.height = GameConfig.PLAYER_HEIGHT;
      this.position.y = GameConfig.GROUND_Y - GameConfig.PLAYER_HEIGHT;
    }
  }

  die(): void {
    this.state = 'dead';
  }

  update(deltaTime: number): void {
    if (this.state === 'dead') return;

    // Apply variable gravity for better jump feel
    if (!this.isGrounded) {
      // Determine which gravity to use based on velocity
      let gravity: number;

      if (Math.abs(this.velocity.y) < GameConfig.JUMP_APEX_THRESHOLD) {
        // At the apex of the jump - use floaty gravity for hang time
        gravity = GameConfig.JUMP_APEX_GRAVITY;
      } else if (this.velocity.y > 0) {
        // Falling - use faster gravity for snappy landing
        gravity = GameConfig.GRAVITY_FALLING;
      } else {
        // Rising - use base gravity
        gravity = GameConfig.GRAVITY;
      }

      this.velocity.y += gravity;
      this.velocity.y = Math.min(this.velocity.y, GameConfig.TERMINAL_VELOCITY);
    }

    // Update position
    this.position.y += this.velocity.y;

    // Ground check
    const groundY = GameConfig.GROUND_Y - this.height;
    if (this.position.y >= groundY) {
      this.position.y = groundY;
      this.velocity.y = 0;
      this.isGrounded = true;
      if (this.state === 'jumping') {
        this.state = 'running';
      }
    }

    // Update animation
    this.animationTimer += deltaTime;
    if (this.animationTimer >= this.animationSpeed) {
      this.animationTimer = 0;
      this.animationFrame = (this.animationFrame + 1) % 4;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Draw wizard body (pixel art style)
    const x = Math.floor(this.position.x);
    const y = Math.floor(this.position.y);

    if (this.state === 'ducking') {
      this.renderDucking(ctx, x, y);
    } else {
      this.renderNormal(ctx, x, y);
    }

    ctx.restore();
  }

  private renderNormal(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Robe body
    ctx.fillStyle = '#4a00b4'; // Purple robe
    ctx.fillRect(x + 8, y + 20, 16, 28);

    // Robe bottom flare
    ctx.fillRect(x + 4, y + 40, 24, 8);

    // Head
    ctx.fillStyle = '#ffe4c4'; // Skin tone
    ctx.fillRect(x + 10, y + 8, 12, 12);

    // Wizard hat
    ctx.fillStyle = '#4a00b4';
    ctx.fillRect(x + 8, y + 2, 16, 8);
    ctx.fillRect(x + 12, y - 6, 8, 8);
    ctx.fillRect(x + 14, y - 10, 4, 4);

    // Hat star
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(x + 15, y - 8, 2, 2);

    // Hat brim
    ctx.fillStyle = '#3a0094';
    ctx.fillRect(x + 6, y + 8, 20, 2);

    // Eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 12, y + 12, 2, 2);
    ctx.fillRect(x + 18, y + 12, 2, 2);

    // Beard
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(x + 12, y + 18, 8, 4);
    ctx.fillRect(x + 14, y + 22, 4, 4);

    // Staff
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + 26, y + 10, 4, 36);

    // Staff orb
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(x + 25, y + 4, 6, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 27, y + 5, 2, 2);

    // Running animation - move legs
    if (this.state === 'running') {
      const legOffset = this.animationFrame % 2 === 0 ? 0 : 4;
      ctx.fillStyle = '#3a0094';
      ctx.fillRect(x + 8 + legOffset, y + 44, 4, 4);
      ctx.fillRect(x + 20 - legOffset, y + 44, 4, 4);
    }
  }

  private renderDucking(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Ducking wizard - compressed pose

    // Robe body (shorter)
    ctx.fillStyle = '#4a00b4';
    ctx.fillRect(x + 4, y + 8, 24, 16);

    // Head (tilted forward)
    ctx.fillStyle = '#ffe4c4';
    ctx.fillRect(x + 20, y + 2, 10, 10);

    // Wizard hat (tilted)
    ctx.fillStyle = '#4a00b4';
    ctx.fillRect(x + 22, y - 4, 12, 6);
    ctx.fillRect(x + 28, y - 8, 6, 4);

    // Hat brim
    ctx.fillStyle = '#3a0094';
    ctx.fillRect(x + 20, y + 2, 14, 2);

    // Eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 24, y + 6, 2, 2);

    // Staff (horizontal)
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x, y + 14, 32, 4);

    // Staff orb
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(x - 4, y + 12, 6, 6);
  }

  reset(): void {
    this.position.set(
      GameConfig.PLAYER_X,
      GameConfig.GROUND_Y - GameConfig.PLAYER_HEIGHT
    );
    this.velocity.set(0, 0);
    this.width = GameConfig.PLAYER_WIDTH;
    this.height = GameConfig.PLAYER_HEIGHT;
    this.state = 'running';
    this.isGrounded = true;
    this.animationFrame = 0;
    this.animationTimer = 0;
  }

  getHitbox() {
    // Return a slightly smaller hitbox for forgiving collisions
    const baseHitbox = super.getHitbox();
    return baseHitbox.shrink(4);
  }
}
