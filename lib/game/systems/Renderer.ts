// Canvas renderer system

import { GameConfig } from '../engine/GameConfig';
import { Player } from '../entities/Player';
import { Obstacle } from '../entities/Obstacle';
import { ParallaxSystem } from './ParallaxSystem';
import { TimeOfDay } from '../generators/DifficultyManager';
import { DeathModalChoice } from '@/types/game';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private currentTimeOfDay: TimeOfDay = 'day';
  private progress: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.width = GameConfig.GAME_WIDTH;
    this.height = GameConfig.GAME_HEIGHT;

    // Disable image smoothing for pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = false;
  }

  setTimeOfDay(timeOfDay: TimeOfDay, progress: number): void {
    this.currentTimeOfDay = timeOfDay;
    this.progress = progress;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  private getSkyColors(): { top: string; bottom: string } {
    // Smooth interpolation between time periods
    const p = this.progress;

    if (p < GameConfig.TIME_OF_DAY.DAY_END) {
      // Day time - bright and cheerful
      return {
        top: GameConfig.COLORS.SKY_DAY_TOP,
        bottom: GameConfig.COLORS.SKY_DAY_BOTTOM,
      };
    } else if (p < GameConfig.TIME_OF_DAY.SUNSET_END) {
      // Sunset - orange and warm
      const t = (p - GameConfig.TIME_OF_DAY.DAY_END) /
                (GameConfig.TIME_OF_DAY.SUNSET_END - GameConfig.TIME_OF_DAY.DAY_END);
      return {
        top: this.lerpColor(GameConfig.COLORS.SKY_DAY_TOP, GameConfig.COLORS.SKY_SUNSET_TOP, t),
        bottom: this.lerpColor(GameConfig.COLORS.SKY_DAY_BOTTOM, GameConfig.COLORS.SKY_SUNSET_BOTTOM, t),
      };
    } else if (p < GameConfig.TIME_OF_DAY.DUSK_END) {
      // Dusk - purple twilight
      const t = (p - GameConfig.TIME_OF_DAY.SUNSET_END) /
                (GameConfig.TIME_OF_DAY.DUSK_END - GameConfig.TIME_OF_DAY.SUNSET_END);
      return {
        top: this.lerpColor(GameConfig.COLORS.SKY_SUNSET_TOP, GameConfig.COLORS.SKY_DUSK_TOP, t),
        bottom: this.lerpColor(GameConfig.COLORS.SKY_SUNSET_BOTTOM, GameConfig.COLORS.SKY_DUSK_BOTTOM, t),
      };
    } else {
      // Night - dark and spooky
      const t = (p - GameConfig.TIME_OF_DAY.DUSK_END) / (1 - GameConfig.TIME_OF_DAY.DUSK_END);
      return {
        top: this.lerpColor(GameConfig.COLORS.SKY_DUSK_TOP, GameConfig.COLORS.SKY_NIGHT_TOP, t),
        bottom: this.lerpColor(GameConfig.COLORS.SKY_DUSK_BOTTOM, GameConfig.COLORS.SKY_NIGHT_BOTTOM, t),
      };
    }
  }

  private lerpColor(color1: string, color2: string, t: number): string {
    // Parse hex colors
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);

    // Interpolate
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);

    return `rgb(${r}, ${g}, ${b})`;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
  }

  renderBackground(parallax: ParallaxSystem): void {
    // Get sky colors based on time of day
    const skyColors = this.getSkyColors();

    // Sky gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, skyColors.top);
    gradient.addColorStop(1, skyColors.bottom);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Render parallax layers (pass time of day for star visibility)
    parallax.render(this.ctx, this.progress);
  }

  renderGround(offset: number): void {
    const groundY = GameConfig.GROUND_Y;
    const groundHeight = this.height - groundY;

    // Get ground colors based on time of day
    const isNight = this.progress > GameConfig.TIME_OF_DAY.SUNSET_END;
    const groundColor = isNight ? GameConfig.COLORS.GROUND_NIGHT : GameConfig.COLORS.GROUND_DAY;
    const groundDark = isNight ? GameConfig.COLORS.GROUND_NIGHT_DARK : GameConfig.COLORS.GROUND_DAY_DARK;
    const grassColor = isNight ? '#2E7D32' : '#66BB6A';

    // Main ground
    this.ctx.fillStyle = groundColor;
    this.ctx.fillRect(0, groundY, this.width, groundHeight);

    // Ground texture
    this.ctx.fillStyle = groundDark;
    this.ctx.fillRect(0, groundY + 8, this.width, groundHeight - 8);

    // Grass tufts on top
    this.ctx.fillStyle = grassColor;
    for (let x = -offset % 16; x < this.width; x += 16) {
      this.ctx.fillRect(x, groundY - 4, 4, 6);
      this.ctx.fillRect(x + 8, groundY - 2, 3, 4);
    }

    // Ground line
    this.ctx.fillStyle = isNight ? '#0d3d0d' : '#1B5E20';
    this.ctx.fillRect(0, groundY, this.width, 2);
  }

  renderPlayer(player: Player): void {
    player.render(this.ctx);
  }

  renderObstacles(obstacles: Obstacle[]): void {
    obstacles.forEach((obstacle) => {
      if (obstacle.isActive) {
        obstacle.render(this.ctx);
      }
    });
  }

  renderScore(score: number, highScore: number): void {
    this.ctx.save();

    // Score text styling (pixel font simulation)
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.textAlign = 'right';

    // High score
    this.ctx.fillStyle = '#888888';
    const hiText = `HI ${String(Math.floor(highScore)).padStart(5, '0')}`;
    this.ctx.fillText(hiText, this.width - 100, 24);

    // Current score
    this.ctx.fillStyle = '#ffffff';
    const scoreText = String(Math.floor(score)).padStart(5, '0');
    this.ctx.fillText(scoreText, this.width - 16, 24);

    this.ctx.restore();
  }

  renderStartScreen(): void {
    this.ctx.save();

    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Title
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = '24px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('WIZARD RUN', this.width / 2, 70);

    // Instructions
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.fillText('Press SPACE or TAP to start', this.width / 2, 110);

    // Controls hint
    this.ctx.fillStyle = '#aaaaaa';
    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.fillText('SPACE/UP: Jump | DOWN: Duck', this.width / 2, 140);

    this.ctx.restore();
  }

  renderGameOver(score: number, highScore: number, isNewHighScore: boolean): void {
    this.ctx.save();

    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Game Over text
    this.ctx.fillStyle = '#ff4444';
    this.ctx.font = '20px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.width / 2, 60);

    // Score
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.fillText(`Score: ${Math.floor(score)}`, this.width / 2, 95);

    // High score
    if (isNewHighScore) {
      this.ctx.fillStyle = '#ffd700';
      this.ctx.fillText('NEW HIGH SCORE!', this.width / 2, 120);
    } else {
      this.ctx.fillStyle = '#888888';
      this.ctx.fillText(`Best: ${Math.floor(highScore)}`, this.width / 2, 120);
    }

    // Restart instruction
    this.ctx.fillStyle = '#aaaaaa';
    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.fillText('Press SPACE to restart', this.width / 2, 160);

    this.ctx.restore();
  }

  renderPaused(): void {
    this.ctx.save();

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);

    this.ctx.restore();
  }

  renderLives(livesCount: number): void {
    this.ctx.save();

    const heartSize = 16;
    const padding = 6;
    const startX = 12;
    const startY = 12;

    for (let i = 0; i < 3; i++) {
      const x = startX + i * (heartSize + padding);
      const filled = i < livesCount;
      this.renderHeart(x, startY, heartSize, filled);
    }

    this.ctx.restore();
  }

  private renderHeart(x: number, y: number, size: number, filled: boolean): void {
    this.ctx.fillStyle = filled ? '#ff4444' : '#444444';
    const s = size / 8;

    // Pixel art heart shape
    this.ctx.fillRect(x + s, y, s * 2, s);
    this.ctx.fillRect(x + s * 5, y, s * 2, s);
    this.ctx.fillRect(x, y + s, s * 4, s);
    this.ctx.fillRect(x + s * 4, y + s, s * 4, s);
    this.ctx.fillRect(x, y + s * 2, s * 8, s * 2);
    this.ctx.fillRect(x + s, y + s * 4, s * 6, s);
    this.ctx.fillRect(x + s * 2, y + s * 5, s * 4, s);
    this.ctx.fillRect(x + s * 3, y + s * 6, s * 2, s);
  }

  renderDeathModal(livesRemaining: number, selectedOption: DeathModalChoice): void {
    this.ctx.save();

    // Dark overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const centerX = this.width / 2;

    // Title
    this.ctx.fillStyle = '#ff4444';
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('YOU DIED!', centerX, 45);

    // Lives remaining text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.fillText(`Lives Remaining: ${livesRemaining}`, centerX, 68);

    // Render hearts centered
    const heartsStartX = centerX - 33;
    for (let i = 0; i < 3; i++) {
      this.renderHeart(heartsStartX + i * 22, 78, 16, i < livesRemaining);
    }

    // Options
    const continueY = 120;
    const restartY = 145;
    const buttonWidth = 140;
    const buttonHeight = 24;

    // Continue option background (hover/selected state)
    const canContinue = livesRemaining > 0;
    if (selectedOption === 'continue' && canContinue) {
      this.ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
      this.ctx.fillRect(centerX - buttonWidth / 2, continueY - buttonHeight / 2, buttonWidth, buttonHeight);
      this.ctx.strokeStyle = '#ffd700';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(centerX - buttonWidth / 2, continueY - buttonHeight / 2, buttonWidth, buttonHeight);
    }

    // Continue option text
    if (selectedOption === 'continue' && canContinue) {
      this.ctx.fillStyle = '#ffd700';
      this.ctx.font = '10px "Press Start 2P", monospace';
      this.ctx.fillText('CONTINUE', centerX, continueY + 4);
    } else {
      this.ctx.fillStyle = canContinue ? '#888888' : '#444444';
      this.ctx.font = '10px "Press Start 2P", monospace';
      this.ctx.fillText('CONTINUE', centerX, continueY + 4);
    }

    if (!canContinue) {
      this.ctx.fillStyle = '#666666';
      this.ctx.font = '6px "Press Start 2P", monospace';
      this.ctx.fillText('(no lives left)', centerX, continueY + 16);
    }

    // Restart option background (hover/selected state)
    if (selectedOption === 'restart') {
      this.ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
      this.ctx.fillRect(centerX - buttonWidth / 2, restartY - buttonHeight / 2, buttonWidth, buttonHeight);
      this.ctx.strokeStyle = '#ffd700';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(centerX - buttonWidth / 2, restartY - buttonHeight / 2, buttonWidth, buttonHeight);
    }

    // Restart option text
    if (selectedOption === 'restart') {
      this.ctx.fillStyle = '#ffd700';
      this.ctx.font = '10px "Press Start 2P", monospace';
      this.ctx.fillText('RESTART', centerX, restartY + 4);
    } else {
      this.ctx.fillStyle = '#888888';
      this.ctx.font = '10px "Press Start 2P", monospace';
      this.ctx.fillText('RESTART', centerX, restartY + 4);
    }

    // Controls hint
    this.ctx.fillStyle = '#555555';
    this.ctx.font = '6px "Press Start 2P", monospace';
    this.ctx.fillText('UP/DOWN: Select | SPACE: Confirm', centerX, 175);

    this.ctx.restore();
  }

  renderCountdown(value: number): void {
    this.ctx.save();

    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Large countdown number or GO!
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = '48px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const text = value > 0 ? String(value) : 'GO!';
    this.ctx.fillText(text, this.width / 2, this.height / 2);

    this.ctx.restore();
  }

  renderNoLivesTimer(secondsUntilReset: number): void {
    this.ctx.save();

    // Dark overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const centerX = this.width / 2;

    // Title
    this.ctx.fillStyle = '#ff4444';
    this.ctx.font = '14px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('NO LIVES LEFT!', centerX, 55);

    // Empty hearts
    const heartsStartX = centerX - 33;
    for (let i = 0; i < 3; i++) {
      this.renderHeart(heartsStartX + i * 22, 70, 16, false);
    }

    // Timer label
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.fillText('Lives restore in:', centerX, 110);

    // Format time
    const hours = Math.floor(secondsUntilReset / 3600);
    const minutes = Math.floor((secondsUntilReset % 3600) / 60);
    const seconds = secondsUntilReset % 60;
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Timer display
    this.ctx.fillStyle = '#00ffff';
    this.ctx.font = '18px "Press Start 2P", monospace';
    this.ctx.fillText(timeStr, centerX, 135);

    // Hint
    this.ctx.fillStyle = '#666666';
    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.fillText('Come back later!', centerX, 165);

    this.ctx.restore();
  }
}
