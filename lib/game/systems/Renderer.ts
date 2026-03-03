// Canvas renderer system

import { GameConfig } from '../engine/GameConfig';
import { Player } from '../entities/Player';
import { Obstacle } from '../entities/Obstacle';
import { ParallaxSystem } from './ParallaxSystem';
import { TimeOfDay } from '../generators/DifficultyManager';
import { DeathModalChoice, CharacterType } from '@/types/game';

const CHARACTER_TYPES: CharacterType[] = ['wizard', 'witch', 'unicorn', 'dragon'];
const CHARACTER_NAMES: Record<CharacterType, string> = {
  wizard: 'WIZARD',
  witch: 'WITCH',
  unicorn: 'UNICORN',
  dragon: 'DRAGON',
};

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

  renderUsernameModal(currentInput: string, errorMessage?: string): void {
    this.ctx.save();

    // Dark overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const centerX = this.width / 2;

    // Title
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('WIZARD RUN', centerX, 35);

    // Subtitle
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '8px "Press Start 2P", monospace';
    this.ctx.fillText('Enter your name, wizard!', centerX, 58);

    // Input box
    const inputX = centerX - 100;
    const inputY = 75;
    const inputWidth = 200;
    const inputHeight = 30;

    // Input background
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.fillRect(inputX, inputY, inputWidth, inputHeight);

    // Input border
    const isValid = !errorMessage;
    this.ctx.strokeStyle = isValid ? '#ffd700' : '#ff4444';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(inputX, inputY, inputWidth, inputHeight);

    // Input text with blinking cursor
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';

    const displayText = currentInput || '';
    const showCursor = Date.now() % 1000 < 500;
    const textWithCursor = displayText + (showCursor ? '_' : '');
    this.ctx.fillText(textWithCursor, centerX, inputY + 20);

    // Error message
    if (errorMessage) {
      this.ctx.fillStyle = '#ff4444';
      this.ctx.font = '6px "Press Start 2P", monospace';
      this.ctx.fillText(errorMessage, centerX, inputY + 45);
    }

    // Confirm button
    const buttonY = 140;
    const buttonWidth = 120;
    const buttonHeight = 24;
    const canSubmit = currentInput.length >= 3 && currentInput.length <= 15;

    // Button background
    if (canSubmit) {
      this.ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
      this.ctx.fillRect(centerX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight);
      this.ctx.strokeStyle = '#ffd700';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(centerX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight);
    }

    // Button text
    this.ctx.fillStyle = canSubmit ? '#ffd700' : '#555555';
    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.fillText('START', centerX, buttonY + 4);

    // Instructions
    this.ctx.fillStyle = '#666666';
    this.ctx.font = '6px "Press Start 2P", monospace';
    this.ctx.fillText('3-15 characters | ENTER to confirm', centerX, 175);

    this.ctx.restore();
  }

  getStartButtonBounds(): { x: number; y: number; width: number; height: number } {
    const centerX = this.width / 2;
    const buttonY = 140;
    const buttonWidth = 120;
    const buttonHeight = 24;
    return {
      x: centerX - buttonWidth / 2,
      y: buttonY - buttonHeight / 2,
      width: buttonWidth,
      height: buttonHeight,
    };
  }

  renderCharacterSelect(selectedIndex: number, hoveredIndex: number): void {
    this.ctx.save();

    // Dark overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const centerX = this.width / 2;

    // Title
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = '14px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('CHOOSE YOUR CHARACTER', centerX, 30);

    // Character cards
    const cardWidth = 70;
    const cardHeight = 80;
    const cardSpacing = 10;
    const totalWidth = (cardWidth * 4) + (cardSpacing * 3);
    const startX = centerX - totalWidth / 2;
    const cardY = 50;

    for (let i = 0; i < CHARACTER_TYPES.length; i++) {
      const charType = CHARACTER_TYPES[i];
      const cardX = startX + i * (cardWidth + cardSpacing);
      const isSelected = i === selectedIndex;
      const isHovered = i === hoveredIndex;

      // Card background
      if (isSelected) {
        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        this.ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
        this.ctx.strokeStyle = '#ffd700';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);
      } else if (isHovered) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
        this.ctx.strokeStyle = '#888888';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);
      } else {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
        this.ctx.strokeStyle = '#444444';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);
      }

      // Render character preview
      const previewX = cardX + (cardWidth - 32) / 2;
      const previewY = cardY + 10;
      this.renderCharacterPreview(charType, previewX, previewY);

      // Character name
      this.ctx.fillStyle = isSelected ? '#ffd700' : '#ffffff';
      this.ctx.font = '6px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(CHARACTER_NAMES[charType], cardX + cardWidth / 2, cardY + cardHeight - 8);
    }

    // Select button
    const buttonY = 145;
    const buttonWidth = 100;
    const buttonHeight = 24;

    this.ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
    this.ctx.fillRect(centerX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight);
    this.ctx.strokeStyle = '#ffd700';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(centerX - buttonWidth / 2, buttonY - buttonHeight / 2, buttonWidth, buttonHeight);

    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('SELECT', centerX, buttonY + 4);

    // Instructions
    this.ctx.fillStyle = '#666666';
    this.ctx.font = '6px "Press Start 2P", monospace';
    this.ctx.fillText('LEFT/RIGHT: Choose | SPACE: Select', centerX, 178);

    this.ctx.restore();
  }

  private renderCharacterPreview(charType: CharacterType, x: number, y: number): void {
    this.ctx.save();

    switch (charType) {
      case 'wizard':
        this.renderWizardPreview(x, y);
        break;
      case 'witch':
        this.renderWitchPreview(x, y);
        break;
      case 'unicorn':
        this.renderUnicornPreview(x, y);
        break;
      case 'dragon':
        this.renderDragonPreview(x, y);
        break;
    }

    this.ctx.restore();
  }

  private renderWizardPreview(x: number, y: number): void {
    // Robe body
    this.ctx.fillStyle = '#4a00b4';
    this.ctx.fillRect(x + 8, y + 20, 16, 28);
    this.ctx.fillRect(x + 4, y + 40, 24, 8);

    // Head
    this.ctx.fillStyle = '#ffe4c4';
    this.ctx.fillRect(x + 10, y + 8, 12, 12);

    // Hat
    this.ctx.fillStyle = '#4a00b4';
    this.ctx.fillRect(x + 8, y + 2, 16, 8);
    this.ctx.fillRect(x + 12, y - 6, 8, 8);
    this.ctx.fillRect(x + 14, y - 10, 4, 4);

    // Star
    this.ctx.fillStyle = '#ffd700';
    this.ctx.fillRect(x + 15, y - 8, 2, 2);

    // Brim
    this.ctx.fillStyle = '#3a0094';
    this.ctx.fillRect(x + 6, y + 8, 20, 2);

    // Eyes
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(x + 12, y + 12, 2, 2);
    this.ctx.fillRect(x + 18, y + 12, 2, 2);

    // Beard
    this.ctx.fillStyle = '#c0c0c0';
    this.ctx.fillRect(x + 12, y + 18, 8, 4);
    this.ctx.fillRect(x + 14, y + 22, 4, 4);

    // Staff
    this.ctx.fillStyle = '#8b4513';
    this.ctx.fillRect(x + 26, y + 10, 4, 36);

    // Orb
    this.ctx.fillStyle = '#00ffff';
    this.ctx.fillRect(x + 25, y + 4, 6, 6);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(x + 27, y + 5, 2, 2);
  }

  private renderWitchPreview(x: number, y: number): void {
    // Robe
    this.ctx.fillStyle = '#1a472a';
    this.ctx.fillRect(x + 8, y + 20, 16, 28);
    this.ctx.fillRect(x + 4, y + 40, 24, 8);

    // Head
    this.ctx.fillStyle = '#7cba5f';
    this.ctx.fillRect(x + 10, y + 8, 12, 12);

    // Hat
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(x + 6, y + 2, 20, 8);
    this.ctx.fillRect(x + 10, y - 6, 12, 8);
    this.ctx.fillRect(x + 13, y - 14, 6, 8);

    // Buckle
    this.ctx.fillStyle = '#ffd700';
    this.ctx.fillRect(x + 10, y + 4, 12, 2);

    // Eyes
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(x + 12, y + 12, 2, 2);
    this.ctx.fillRect(x + 18, y + 12, 2, 2);

    // Wart
    this.ctx.fillStyle = '#2d5a27';
    this.ctx.fillRect(x + 20, y + 16, 2, 2);

    // Broomstick
    this.ctx.fillStyle = '#8b4513';
    this.ctx.fillRect(x + 26, y + 10, 4, 36);

    // Bristles
    this.ctx.fillStyle = '#daa520';
    this.ctx.fillRect(x + 24, y + 42, 8, 6);
  }

  private renderUnicornPreview(x: number, y: number): void {
    // Body
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(x + 4, y + 20, 24, 16);
    this.ctx.fillRect(x + 6, y + 36, 20, 8);
    this.ctx.fillRect(x + 20, y + 12, 8, 10);
    this.ctx.fillRect(x + 22, y + 4, 10, 10);

    // Snout
    this.ctx.fillStyle = '#ffe4e1';
    this.ctx.fillRect(x + 28, y + 8, 4, 6);

    // Horn
    this.ctx.fillStyle = '#ffd700';
    this.ctx.fillRect(x + 26, y - 2, 2, 6);
    this.ctx.fillStyle = '#ffec8b';
    this.ctx.fillRect(x + 27, y - 4, 2, 2);

    // Eye
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(x + 24, y + 6, 2, 2);

    // Rainbow mane
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(x + 18, y + 4, 4, 2);
    this.ctx.fillStyle = '#ff7f00';
    this.ctx.fillRect(x + 16, y + 6, 4, 2);
    this.ctx.fillStyle = '#ffff00';
    this.ctx.fillRect(x + 14, y + 8, 4, 2);
    this.ctx.fillStyle = '#00ff00';
    this.ctx.fillRect(x + 12, y + 10, 4, 2);
    this.ctx.fillStyle = '#0080ff';
    this.ctx.fillRect(x + 10, y + 12, 4, 2);
    this.ctx.fillStyle = '#8b00ff';
    this.ctx.fillRect(x + 8, y + 14, 4, 2);

    // Legs
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(x + 8, y + 40, 4, 8);
    this.ctx.fillRect(x + 16, y + 40, 4, 8);
    this.ctx.fillRect(x + 20, y + 40, 4, 8);

    // Hooves
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(x + 8, y + 46, 4, 2);
    this.ctx.fillRect(x + 16, y + 46, 4, 2);
    this.ctx.fillRect(x + 20, y + 46, 4, 2);
  }

  private renderDragonPreview(x: number, y: number): void {
    // Body
    this.ctx.fillStyle = '#1e90ff';
    this.ctx.fillRect(x + 8, y + 20, 20, 18);

    // Belly
    this.ctx.fillStyle = '#87ceeb';
    this.ctx.fillRect(x + 10, y + 24, 12, 12);

    // Neck
    this.ctx.fillStyle = '#1e90ff';
    this.ctx.fillRect(x + 22, y + 12, 8, 10);

    // Head
    this.ctx.fillRect(x + 24, y + 4, 12, 10);
    this.ctx.fillRect(x + 32, y + 6, 6, 6);

    // Fire
    this.ctx.fillStyle = '#ff4500';
    this.ctx.fillRect(x + 36, y + 8, 2, 2);

    // Eye
    this.ctx.fillStyle = '#ffff00';
    this.ctx.fillRect(x + 28, y + 6, 3, 3);
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(x + 29, y + 7, 2, 2);

    // Horns
    this.ctx.fillStyle = '#4169e1';
    this.ctx.fillRect(x + 26, y, 2, 4);
    this.ctx.fillRect(x + 32, y, 2, 4);

    // Spikes
    this.ctx.fillRect(x + 12, y + 16, 4, 4);
    this.ctx.fillRect(x + 18, y + 14, 4, 6);

    // Wings
    this.ctx.fillStyle = '#4682b4';
    this.ctx.fillRect(x + 4, y + 10, 6, 12);
    this.ctx.fillRect(x, y + 6, 4, 8);
    this.ctx.fillStyle = '#87ceeb';
    this.ctx.fillRect(x + 5, y + 12, 4, 8);

    // Legs
    this.ctx.fillStyle = '#1e90ff';
    this.ctx.fillRect(x + 12, y + 36, 5, 10);
    this.ctx.fillRect(x + 22, y + 36, 5, 10);

    // Claws
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(x + 12, y + 44, 6, 4);
    this.ctx.fillRect(x + 22, y + 44, 6, 4);
  }

  getCharacterSelectBounds(): {
    characters: { x: number; y: number; width: number; height: number }[];
    selectButton: { x: number; y: number; width: number; height: number };
  } {
    const centerX = this.width / 2;
    const cardWidth = 70;
    const cardHeight = 80;
    const cardSpacing = 10;
    const totalWidth = (cardWidth * 4) + (cardSpacing * 3);
    const startX = centerX - totalWidth / 2;
    const cardY = 50;

    const characters: { x: number; y: number; width: number; height: number }[] = [];
    for (let i = 0; i < 4; i++) {
      characters.push({
        x: startX + i * (cardWidth + cardSpacing),
        y: cardY,
        width: cardWidth,
        height: cardHeight,
      });
    }

    const buttonY = 145;
    const buttonWidth = 100;
    const buttonHeight = 24;

    return {
      characters,
      selectButton: {
        x: centerX - buttonWidth / 2,
        y: buttonY - buttonHeight / 2,
        width: buttonWidth,
        height: buttonHeight,
      },
    };
  }
}
