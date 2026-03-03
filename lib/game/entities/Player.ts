// Player entity with multiple character types

import { Entity } from './Entity';
import { GameConfig } from '../engine/GameConfig';
import { PlayerState, CharacterType } from '@/types/game';

export class Player extends Entity {
  private state: PlayerState = 'running';
  private isGrounded: boolean = true;
  private animationFrame: number = 0;
  private animationTimer: number = 0;
  private readonly animationSpeed: number = 100; // ms per frame
  private characterType: CharacterType = 'wizard';

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

  get character(): CharacterType {
    return this.characterType;
  }

  setCharacter(type: CharacterType): void {
    this.characterType = type;
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

    const x = Math.floor(this.position.x);
    const y = Math.floor(this.position.y);
    const isDucking = this.state === 'ducking';

    switch (this.characterType) {
      case 'wizard':
        isDucking ? this.renderWizardDucking(ctx, x, y) : this.renderWizardNormal(ctx, x, y);
        break;
      case 'witch':
        isDucking ? this.renderWitchDucking(ctx, x, y) : this.renderWitchNormal(ctx, x, y);
        break;
      case 'unicorn':
        isDucking ? this.renderUnicornDucking(ctx, x, y) : this.renderUnicornNormal(ctx, x, y);
        break;
      case 'dragon':
        isDucking ? this.renderDragonDucking(ctx, x, y) : this.renderDragonNormal(ctx, x, y);
        break;
    }

    ctx.restore();
  }

  // ===== WIZARD RENDERING =====
  private renderWizardNormal(ctx: CanvasRenderingContext2D, x: number, y: number): void {
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

  private renderWizardDucking(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Ducking wizard - compressed pose
    ctx.fillStyle = '#4a00b4';
    ctx.fillRect(x + 4, y + 8, 24, 16);

    ctx.fillStyle = '#ffe4c4';
    ctx.fillRect(x + 20, y + 2, 10, 10);

    ctx.fillStyle = '#4a00b4';
    ctx.fillRect(x + 22, y - 4, 12, 6);
    ctx.fillRect(x + 28, y - 8, 6, 4);

    ctx.fillStyle = '#3a0094';
    ctx.fillRect(x + 20, y + 2, 14, 2);

    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 24, y + 6, 2, 2);

    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x, y + 14, 32, 4);

    ctx.fillStyle = '#00ffff';
    ctx.fillRect(x - 4, y + 12, 6, 6);
  }

  // ===== WITCH RENDERING =====
  private renderWitchNormal(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Robe body - dark green/black
    ctx.fillStyle = '#1a472a';
    ctx.fillRect(x + 8, y + 20, 16, 28);
    ctx.fillRect(x + 4, y + 40, 24, 8);

    // Head - green skin
    ctx.fillStyle = '#7cba5f';
    ctx.fillRect(x + 10, y + 8, 12, 12);

    // Witch hat
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x + 6, y + 2, 20, 8);
    ctx.fillRect(x + 10, y - 6, 12, 8);
    ctx.fillRect(x + 13, y - 14, 6, 8);

    // Hat buckle
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(x + 10, y + 4, 12, 2);

    // Eyes
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + 12, y + 12, 2, 2);
    ctx.fillRect(x + 18, y + 12, 2, 2);

    // Wart
    ctx.fillStyle = '#2d5a27';
    ctx.fillRect(x + 20, y + 16, 2, 2);

    // Broomstick
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + 26, y + 10, 4, 36);

    // Broom bristles
    ctx.fillStyle = '#daa520';
    ctx.fillRect(x + 24, y + 42, 8, 6);
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(x + 25, y + 44, 6, 4);

    // Running animation
    if (this.state === 'running') {
      const legOffset = this.animationFrame % 2 === 0 ? 0 : 4;
      ctx.fillStyle = '#0d2818';
      ctx.fillRect(x + 8 + legOffset, y + 44, 4, 4);
      ctx.fillRect(x + 20 - legOffset, y + 44, 4, 4);
    }
  }

  private renderWitchDucking(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = '#1a472a';
    ctx.fillRect(x + 4, y + 8, 24, 16);

    ctx.fillStyle = '#7cba5f';
    ctx.fillRect(x + 20, y + 2, 10, 10);

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x + 22, y - 4, 14, 6);
    ctx.fillRect(x + 28, y - 10, 6, 6);

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + 24, y + 6, 2, 2);

    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x, y + 14, 32, 4);

    ctx.fillStyle = '#daa520';
    ctx.fillRect(x - 6, y + 12, 8, 6);
  }

  // ===== UNICORN RENDERING =====
  private renderUnicornNormal(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Body
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 4, y + 20, 24, 16);
    ctx.fillRect(x + 6, y + 36, 20, 8);

    // Neck
    ctx.fillRect(x + 20, y + 12, 8, 10);

    // Head
    ctx.fillRect(x + 22, y + 4, 10, 10);

    // Snout
    ctx.fillStyle = '#ffe4e1';
    ctx.fillRect(x + 28, y + 8, 4, 6);

    // Horn
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(x + 26, y - 2, 2, 6);
    ctx.fillStyle = '#ffec8b';
    ctx.fillRect(x + 27, y - 4, 2, 2);

    // Eye
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 24, y + 6, 2, 2);

    // Rainbow mane
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + 18, y + 4, 4, 2);
    ctx.fillStyle = '#ff7f00';
    ctx.fillRect(x + 16, y + 6, 4, 2);
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(x + 14, y + 8, 4, 2);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(x + 12, y + 10, 4, 2);
    ctx.fillStyle = '#0080ff';
    ctx.fillRect(x + 10, y + 12, 4, 2);
    ctx.fillStyle = '#8b00ff';
    ctx.fillRect(x + 8, y + 14, 4, 2);

    // Rainbow tail
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x, y + 22, 4, 2);
    ctx.fillStyle = '#ff7f00';
    ctx.fillRect(x - 2, y + 24, 4, 2);
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(x, y + 26, 4, 2);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(x - 2, y + 28, 4, 2);
    ctx.fillStyle = '#8b00ff';
    ctx.fillRect(x, y + 30, 4, 2);

    // Legs with animation
    ctx.fillStyle = '#ffffff';
    const legOffset = this.state === 'running' ? (this.animationFrame % 2 === 0 ? 0 : 2) : 0;
    ctx.fillRect(x + 6 + legOffset, y + 40, 4, 8);
    ctx.fillRect(x + 14 - legOffset, y + 40, 4, 8);
    ctx.fillRect(x + 18 + legOffset, y + 40, 4, 8);
    ctx.fillRect(x + 24 - legOffset, y + 40, 4, 8);

    // Hooves
    ctx.fillStyle = '#333333';
    ctx.fillRect(x + 6 + legOffset, y + 46, 4, 2);
    ctx.fillRect(x + 14 - legOffset, y + 46, 4, 2);
    ctx.fillRect(x + 18 + legOffset, y + 46, 4, 2);
    ctx.fillRect(x + 24 - legOffset, y + 46, 4, 2);
  }

  private renderUnicornDucking(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Body (compressed)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 4, y + 8, 24, 12);
    ctx.fillRect(x + 22, y + 4, 10, 8);

    // Horn
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(x + 30, y + 2, 4, 2);

    // Eye
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 26, y + 6, 2, 2);

    // Mane (compressed)
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + 18, y + 2, 4, 2);
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(x + 14, y + 4, 4, 2);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(x + 10, y + 6, 4, 2);

    // Legs tucked
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 6, y + 18, 20, 6);
    ctx.fillStyle = '#333333';
    ctx.fillRect(x + 6, y + 22, 4, 2);
    ctx.fillRect(x + 22, y + 22, 4, 2);
  }

  // ===== DRAGON RENDERING =====
  private renderDragonNormal(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Body
    ctx.fillStyle = '#1e90ff';
    ctx.fillRect(x + 8, y + 20, 20, 18);

    // Belly
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(x + 10, y + 24, 12, 12);

    // Neck
    ctx.fillStyle = '#1e90ff';
    ctx.fillRect(x + 22, y + 12, 8, 10);

    // Head
    ctx.fillRect(x + 24, y + 4, 12, 10);

    // Snout
    ctx.fillRect(x + 32, y + 6, 6, 6);

    // Nostril with fire
    ctx.fillStyle = '#ff4500';
    ctx.fillRect(x + 36, y + 8, 2, 2);

    // Eye
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(x + 28, y + 6, 3, 3);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 29, y + 7, 2, 2);

    // Horns
    ctx.fillStyle = '#4169e1';
    ctx.fillRect(x + 26, y, 2, 4);
    ctx.fillRect(x + 32, y, 2, 4);

    // Spikes on back
    ctx.fillStyle = '#4169e1';
    ctx.fillRect(x + 12, y + 16, 4, 4);
    ctx.fillRect(x + 18, y + 14, 4, 6);
    ctx.fillRect(x + 24, y + 12, 4, 4);

    // Wings
    ctx.fillStyle = '#4682b4';
    ctx.fillRect(x + 4, y + 10, 6, 12);
    ctx.fillRect(x, y + 6, 4, 8);
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(x + 5, y + 12, 4, 8);

    // Tail
    ctx.fillStyle = '#1e90ff';
    ctx.fillRect(x, y + 30, 8, 4);
    ctx.fillRect(x - 4, y + 28, 6, 4);
    ctx.fillStyle = '#4169e1';
    ctx.fillRect(x - 6, y + 26, 4, 4);

    // Legs with animation
    ctx.fillStyle = '#1e90ff';
    const legOffset = this.state === 'running' ? (this.animationFrame % 2 === 0 ? 0 : 3) : 0;
    ctx.fillRect(x + 10 + legOffset, y + 36, 5, 10);
    ctx.fillRect(x + 20 - legOffset, y + 36, 5, 10);

    // Claws
    ctx.fillStyle = '#333333';
    ctx.fillRect(x + 10 + legOffset, y + 44, 6, 4);
    ctx.fillRect(x + 20 - legOffset, y + 44, 6, 4);
  }

  private renderDragonDucking(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Body (compressed)
    ctx.fillStyle = '#1e90ff';
    ctx.fillRect(x + 4, y + 8, 24, 12);

    // Belly
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(x + 8, y + 10, 16, 8);

    // Head
    ctx.fillStyle = '#1e90ff';
    ctx.fillRect(x + 24, y + 4, 10, 8);
    ctx.fillRect(x + 30, y + 6, 4, 4);

    // Eye
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(x + 26, y + 6, 2, 2);

    // Fire breath
    ctx.fillStyle = '#ff4500';
    ctx.fillRect(x + 34, y + 6, 2, 2);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(x + 36, y + 5, 3, 4);

    // Wings folded
    ctx.fillStyle = '#4682b4';
    ctx.fillRect(x + 2, y + 4, 6, 8);

    // Tail
    ctx.fillStyle = '#1e90ff';
    ctx.fillRect(x - 4, y + 12, 8, 4);
    ctx.fillStyle = '#4169e1';
    ctx.fillRect(x - 6, y + 10, 4, 4);

    // Legs tucked
    ctx.fillStyle = '#1e90ff';
    ctx.fillRect(x + 6, y + 18, 20, 6);
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
