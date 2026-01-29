// Main game engine - orchestrates all game systems

import { GameConfig } from './GameConfig';
import { GameState } from './GameState';
import { InputManager } from '../systems/InputManager';
import { Renderer } from '../systems/Renderer';
import { ParallaxSystem } from '../systems/ParallaxSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { Player } from '../entities/Player';
import { ObstacleGenerator } from '../generators/ObstacleGenerator';
import { DifficultyManager } from '../generators/DifficultyManager';
import { GameCallbacks, LivesState, DeathModalChoice } from '@/types/game';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private inputManager: InputManager;
  private renderer: Renderer;
  private parallax: ParallaxSystem;
  private audio: AudioSystem;
  private player: Player;
  private obstacleGenerator: ObstacleGenerator;
  private difficultyManager: DifficultyManager;

  private score: number = 0;
  private highScore: number = 0;
  private groundOffset: number = 0;
  private lastTimestamp: number = 0;
  private animationFrameId: number | null = null;
  private idleLoopId: number | null = null;
  private isNewHighScore: boolean = false;
  private callbacks: GameCallbacks = {};

  // Lives system
  private livesState: LivesState | null = null;
  private deathModalSelection: DeathModalChoice = 'continue';
  private countdownValue: number = 3;
  private countdownStartTime: number = 0;
  private hoveredOption: DeathModalChoice | null = null;

  constructor(canvas: HTMLCanvasElement, callbacks?: GameCallbacks) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = ctx;

    // Initialize systems
    this.gameState = new GameState();
    this.inputManager = new InputManager();
    this.renderer = new Renderer(this.ctx);
    this.parallax = new ParallaxSystem();
    this.audio = new AudioSystem();
    this.player = new Player();
    this.obstacleGenerator = new ObstacleGenerator();
    this.difficultyManager = new DifficultyManager();

    if (callbacks) {
      this.callbacks = callbacks;
    }

    // Bind methods
    this.gameLoop = this.gameLoop.bind(this);
    this.idleLoop = this.idleLoop.bind(this);
    this.handleCanvasClick = this.handleCanvasClick.bind(this);
    this.handleCanvasMouseMove = this.handleCanvasMouseMove.bind(this);
  }

  init(): void {
    // Set up canvas
    this.canvas.width = GameConfig.GAME_WIDTH;
    this.canvas.height = GameConfig.GAME_HEIGHT;
    this.ctx.imageSmoothingEnabled = false;

    // Initialize input
    this.inputManager.init();
    this.inputManager.initTouch(this.canvas);

    // Add click and hover handlers for death modal
    this.canvas.addEventListener('click', this.handleCanvasClick);
    this.canvas.addEventListener('mousemove', this.handleCanvasMouseMove);

    // Initial render
    this.render();

    // Start idle loop to listen for input
    this.startIdleLoop();
  }

  private startIdleLoop(): void {
    if (this.idleLoopId !== null) return;
    this.idleLoopId = requestAnimationFrame(this.idleLoop);
  }

  private stopIdleLoop(): void {
    if (this.idleLoopId !== null) {
      cancelAnimationFrame(this.idleLoopId);
      this.idleLoopId = null;
    }
  }

  private idleLoop(): void {
    // Block starting if no lives remaining
    if (this.gameState.is('idle') && this.livesState !== null && this.livesState.count === 0) {
      // Just keep rendering the no-lives screen
      this.render();
      this.inputManager.clearJustPressed();
      this.idleLoopId = requestAnimationFrame(this.idleLoop);
      return;
    }

    // Handle death modal input
    if (this.gameState.is('death_modal')) {
      this.processDeathModalInput();
      this.inputManager.clearJustPressed();
      this.idleLoopId = requestAnimationFrame(this.idleLoop);
      return;
    }

    // Check for input to start/restart game
    if (this.gameState.is('idle') || this.gameState.is('gameover')) {
      if (this.inputManager.isJumpJustPressed()) {
        this.stopIdleLoop();
        this.start();
        return;
      }
    }

    // Clear just-pressed states
    this.inputManager.clearJustPressed();

    // Continue idle loop if not playing
    if (!this.gameState.is('playing')) {
      this.idleLoopId = requestAnimationFrame(this.idleLoop);
    }
  }

  start(): void {
    if (this.gameState.is('idle') || this.gameState.is('gameover')) {
      this.reset();
      this.gameState.transition('playing');
      this.audio.playStart();
      this.callbacks.onGameStart?.();
      this.lastTimestamp = performance.now();
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
  }

  private gameLoop(timestamp: number): void {
    // Calculate delta time
    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    // Cap delta time to prevent huge jumps
    const cappedDelta = Math.min(deltaTime, 32);

    // Update game state time
    this.gameState.update(cappedDelta);

    // Process input
    this.processInput();

    // Update game
    if (this.gameState.is('playing')) {
      this.update(cappedDelta);
    }

    // Render
    this.render();

    // Clear just-pressed states
    this.inputManager.clearJustPressed();

    // Continue loop if playing
    if (this.gameState.is('playing')) {
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
  }

  private processInput(): void {
    if (this.gameState.is('idle')) {
      if (this.inputManager.isJumpJustPressed()) {
        this.start();
      }
    } else if (this.gameState.is('playing')) {
      // Jump
      if (this.inputManager.isJumpJustPressed()) {
        if (this.player.currentState !== 'jumping') {
          this.audio.playJump();
        }
        this.player.jump();
      }

      // Duck
      if (this.inputManager.isDuckPressed()) {
        this.player.duck();
      } else {
        this.player.standUp();
      }
    } else if (this.gameState.is('gameover')) {
      if (this.inputManager.isJumpJustPressed()) {
        this.start();
      }
    } else if (this.gameState.is('death_modal')) {
      this.processDeathModalInput();
    }
    // Note: countdown state does not process input
  }

  private processDeathModalInput(): void {
    const canContinue = this.livesState !== null && this.livesState.count > 0;

    // Navigate with up/down
    if (this.inputManager.isKeyJustPressed('ArrowUp')) {
      this.deathModalSelection = canContinue ? 'continue' : 'restart';
      this.render();
    } else if (this.inputManager.isKeyJustPressed('ArrowDown')) {
      this.deathModalSelection = 'restart';
      this.render();
    }

    // Confirm with space/enter
    if (this.inputManager.isJumpJustPressed()) {
      this.confirmDeathModalSelection();
    }
  }

  private confirmDeathModalSelection(): void {
    const canContinue = this.livesState !== null && this.livesState.count > 0;

    if (this.deathModalSelection === 'continue' && canContinue) {
      // Decrement lives locally immediately
      if (this.livesState) {
        this.livesState = {
          ...this.livesState,
          count: this.livesState.count - 1,
        };
      }
      // Notify React to update Supabase
      this.callbacks.onLifeUsed?.();
      this.startCountdown();
    } else {
      // Restart game fresh
      this.stopIdleLoop();
      this.reset();
      this.gameState.transition('idle');
      this.render();
      this.startIdleLoop();
    }
  }

  private startCountdown(): void {
    this.stopIdleLoop();
    this.countdownValue = 3;
    this.countdownStartTime = performance.now();
    this.gameState.transition('countdown');
    this.lastTimestamp = performance.now();
    this.animationFrameId = requestAnimationFrame(this.countdownLoop.bind(this));
  }

  private countdownLoop(timestamp: number): void {
    const elapsed = timestamp - this.countdownStartTime;
    const newValue = 3 - Math.floor(elapsed / 1000);

    if (newValue !== this.countdownValue && newValue >= 0) {
      this.countdownValue = newValue;
      this.audio.playPoint(); // Beep for each number
    }

    this.render();

    if (elapsed >= 3500) {
      // Countdown complete, resume game
      this.resumeFromDeath();
    } else {
      this.animationFrameId = requestAnimationFrame(this.countdownLoop.bind(this));
    }
  }

  private resumeFromDeath(): void {
    // Reset player position but keep score and clear nearby obstacles
    this.player.reset();
    this.obstacleGenerator.clearNearby(this.player.x + 200);

    this.gameState.transition('playing');
    this.lastTimestamp = performance.now();
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  }

  private update(deltaTime: number): void {
    const scrollSpeed = this.difficultyManager.speed;

    // Update player
    this.player.update(deltaTime);

    // Update parallax backgrounds
    this.parallax.update(scrollSpeed);

    // Update ground offset
    this.groundOffset = (this.groundOffset + scrollSpeed) % 16;

    // Update obstacles with scary chance based on difficulty
    this.obstacleGenerator.update(
      deltaTime,
      scrollSpeed,
      this.difficultyManager.level,
      this.difficultyManager.scaryFactor
    );

    // Check collisions
    this.checkCollisions();

    // Update score
    this.score += GameConfig.POINTS_PER_FRAME * (scrollSpeed / GameConfig.BASE_SCROLL_SPEED);

    // Add bonus points for passing obstacles
    const bonusPoints = this.obstacleGenerator.checkPassedObstacles(this.player.x);
    if (bonusPoints > 0) {
      this.audio.playPoint();
    }
    this.score += bonusPoints;

    // Update difficulty
    this.difficultyManager.update(this.score);

    // Callback for score changes
    this.callbacks.onScoreChange?.(Math.floor(this.score));

    // Check for milestone (every 100 points)
    const currentMilestone = Math.floor(this.score / GameConfig.MILESTONE_INTERVAL);
    const previousMilestone = Math.floor((this.score - GameConfig.POINTS_PER_FRAME) / GameConfig.MILESTONE_INTERVAL);
    if (currentMilestone > previousMilestone) {
      this.audio.playMilestone();
    }
  }

  private checkCollisions(): void {
    const playerHitbox = this.player.getHitbox();
    const obstacles = this.obstacleGenerator.getObstacles();

    for (const obstacle of obstacles) {
      if (obstacle.isActive && playerHitbox.intersects(obstacle.getHitbox())) {
        this.gameOver();
        return;
      }
    }
  }

  private gameOver(): void {
    this.player.die();
    this.audio.playGameOver();

    // Check for new high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.isNewHighScore = true;
      this.callbacks.onHighScoreChange?.(Math.floor(this.highScore));
    } else {
      this.isNewHighScore = false;
    }

    // Stop animation loop
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // If lives system is active, show death modal instead of game over
    if (this.livesState !== null) {
      this.deathModalSelection = this.livesState.count > 0 ? 'continue' : 'restart';
      this.gameState.transition('death_modal');
      this.render();
      this.startIdleLoop();
    } else {
      // Standard game over flow
      this.gameState.transition('gameover');
      this.callbacks.onGameOver?.(Math.floor(this.score));
      this.render();
      this.startIdleLoop();
    }
  }

  private render(): void {
    // Clear canvas
    this.renderer.clear();

    // Update renderer with current time of day
    this.renderer.setTimeOfDay(
      this.difficultyManager.timeOfDay,
      this.difficultyManager.progress
    );

    // Render background and parallax
    this.renderer.renderBackground(this.parallax);

    // Render ground
    this.renderer.renderGround(this.groundOffset);

    // Render obstacles
    this.renderer.renderObstacles(this.obstacleGenerator.getObstacles());

    // Render player
    this.renderer.renderPlayer(this.player);

    // Render UI
    if (this.gameState.isAny('playing', 'gameover', 'death_modal', 'countdown')) {
      this.renderer.renderScore(this.score, this.highScore);
      if (this.livesState !== null) {
        this.renderer.renderLives(this.livesState.count);
      }
    }

    // Render state-specific overlays
    if (this.gameState.is('idle')) {
      if (this.livesState !== null && this.livesState.count === 0) {
        this.renderer.renderNoLivesTimer(this.livesState.secondsUntilReset);
      } else {
        this.renderer.renderStartScreen();
      }
    } else if (this.gameState.is('gameover')) {
      this.renderer.renderGameOver(this.score, this.highScore, this.isNewHighScore);
    } else if (this.gameState.is('paused')) {
      this.renderer.renderPaused();
    } else if (this.gameState.is('death_modal')) {
      this.renderer.renderDeathModal(
        this.livesState?.count ?? 0,
        this.deathModalSelection
      );
    } else if (this.gameState.is('countdown')) {
      this.renderer.renderCountdown(this.countdownValue);
    }
  }

  private reset(): void {
    this.score = 0;
    this.groundOffset = 0;
    this.isNewHighScore = false;

    this.player.reset();
    this.obstacleGenerator.reset();
    this.difficultyManager.reset();
    this.parallax.reset();
    this.gameState.reset();
  }

  setHighScore(score: number): void {
    this.highScore = score;
  }

  setLivesState(lives: LivesState): void {
    this.livesState = lives;
  }

  getLivesState(): LivesState | null {
    return this.livesState;
  }

  getScore(): number {
    return Math.floor(this.score);
  }

  getHighScore(): number {
    return Math.floor(this.highScore);
  }

  isGameOver(): boolean {
    return this.gameState.is('gameover');
  }

  destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.stopIdleLoop();
    this.inputManager.destroy();
    this.inputManager.destroyTouch(this.canvas);
    this.canvas.removeEventListener('click', this.handleCanvasClick);
    this.canvas.removeEventListener('mousemove', this.handleCanvasMouseMove);
    this.audio.destroy();
  }

  private getButtonBounds(): {
    continueBtn: { x: number; y: number; width: number; height: number };
    restartBtn: { x: number; y: number; width: number; height: number };
  } {
    const centerX = GameConfig.GAME_WIDTH / 2;
    const buttonWidth = 140;
    const buttonHeight = 24;

    return {
      continueBtn: {
        x: centerX - buttonWidth / 2,
        y: 120 - buttonHeight / 2,
        width: buttonWidth,
        height: buttonHeight,
      },
      restartBtn: {
        x: centerX - buttonWidth / 2,
        y: 145 - buttonHeight / 2,
        width: buttonWidth,
        height: buttonHeight,
      },
    };
  }

  private getCanvasCoords(e: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  private isPointInRect(
    x: number,
    y: number,
    rect: { x: number; y: number; width: number; height: number }
  ): boolean {
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
  }

  private handleCanvasMouseMove(e: MouseEvent): void {
    if (!this.gameState.is('death_modal')) {
      if (this.hoveredOption !== null) {
        this.hoveredOption = null;
      }
      return;
    }

    const { x, y } = this.getCanvasCoords(e);
    const bounds = this.getButtonBounds();
    const canContinue = this.livesState !== null && this.livesState.count > 0;

    let newHovered: DeathModalChoice | null = null;

    if (canContinue && this.isPointInRect(x, y, bounds.continueBtn)) {
      newHovered = 'continue';
    } else if (this.isPointInRect(x, y, bounds.restartBtn)) {
      newHovered = 'restart';
    }

    if (newHovered !== this.hoveredOption) {
      this.hoveredOption = newHovered;
      if (newHovered) {
        this.deathModalSelection = newHovered;
      }
      this.canvas.style.cursor = newHovered ? 'pointer' : 'default';
      this.render();
    }
  }

  private handleCanvasClick(e: MouseEvent): void {
    if (!this.gameState.is('death_modal')) return;

    const { x, y } = this.getCanvasCoords(e);
    const bounds = this.getButtonBounds();
    const canContinue = this.livesState !== null && this.livesState.count > 0;

    if (canContinue && this.isPointInRect(x, y, bounds.continueBtn)) {
      this.deathModalSelection = 'continue';
      this.confirmDeathModalSelection();
      return;
    }

    if (this.isPointInRect(x, y, bounds.restartBtn)) {
      this.deathModalSelection = 'restart';
      this.confirmDeathModalSelection();
    }
  }
}
