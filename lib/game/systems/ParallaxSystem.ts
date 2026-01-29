// Parallax background system

import { GameConfig } from '../engine/GameConfig';

interface ParallaxLayer {
  speedMultiplier: number;
  offset: number;
  render: (ctx: CanvasRenderingContext2D, offset: number, progress: number) => void;
}

export class ParallaxSystem {
  private layers: ParallaxLayer[] = [];
  private width: number;
  private height: number;

  constructor() {
    this.width = GameConfig.GAME_WIDTH;
    this.height = GameConfig.GAME_HEIGHT;
    this.initLayers();
  }

  private initLayers(): void {
    // Layer 0: Stars (slowest) - only visible at night
    this.layers.push({
      speedMultiplier: 0.05,
      offset: 0,
      render: this.renderStars.bind(this),
    });

    // Layer 1: Sun/Moon
    this.layers.push({
      speedMultiplier: 0.02,
      offset: 0,
      render: this.renderSunMoon.bind(this),
    });

    // Layer 2: Far mountains
    this.layers.push({
      speedMultiplier: 0.1,
      offset: 0,
      render: this.renderFarMountains.bind(this),
    });

    // Layer 3: Near mountains
    this.layers.push({
      speedMultiplier: 0.2,
      offset: 0,
      render: this.renderNearMountains.bind(this),
    });

    // Layer 4: Clouds
    this.layers.push({
      speedMultiplier: 0.15,
      offset: 0,
      render: this.renderClouds.bind(this),
    });

    // Layer 5: Floating crystals (decorative)
    this.layers.push({
      speedMultiplier: 0.4,
      offset: 0,
      render: this.renderFloatingCrystals.bind(this),
    });
  }

  update(scrollSpeed: number): void {
    this.layers.forEach((layer) => {
      layer.offset += scrollSpeed * layer.speedMultiplier;
      layer.offset %= this.width * 2; // Reset after two widths for seamless loop
    });
  }

  render(ctx: CanvasRenderingContext2D, progress: number = 0): void {
    this.layers.forEach((layer) => {
      layer.render(ctx, layer.offset, progress);
    });
  }

  private renderStars(ctx: CanvasRenderingContext2D, offset: number, progress: number): void {
    // Stars only visible after sunset (progress > 0.4)
    if (progress < 0.4) return;

    // Fade in stars
    const starOpacity = Math.min(1, (progress - 0.4) / 0.3);
    ctx.globalAlpha = starOpacity;
    ctx.fillStyle = '#ffffff';

    // Fixed star positions that wrap
    const stars = [
      { x: 50, y: 20 }, { x: 120, y: 35 }, { x: 200, y: 15 },
      { x: 280, y: 45 }, { x: 350, y: 25 }, { x: 420, y: 40 },
      { x: 500, y: 18 }, { x: 570, y: 50 }, { x: 80, y: 55 },
      { x: 160, y: 30 }, { x: 240, y: 60 }, { x: 320, y: 22 },
      { x: 400, y: 48 }, { x: 480, y: 35 }, { x: 550, y: 28 },
    ];

    stars.forEach((star) => {
      const x = (star.x - offset + this.width * 2) % (this.width * 2) - this.width / 2;
      if (x > -10 && x < this.width + 10) {
        // Twinkling effect
        const size = Math.random() > 0.9 ? 3 : 2;
        ctx.fillRect(x, star.y, size, size);
      }
    });

    ctx.globalAlpha = 1;
  }

  private renderSunMoon(ctx: CanvasRenderingContext2D, offset: number, progress: number): void {
    const celestialX = 500 - offset * 0.5;
    const celestialY = 30;

    if (celestialX > -40 && celestialX < this.width + 40) {
      if (progress < GameConfig.TIME_OF_DAY.SUNSET_END) {
        // Render Sun during day/sunset
        this.renderSun(ctx, celestialX, celestialY, progress);
      } else {
        // Render Moon at night
        this.renderMoon(ctx, celestialX, celestialY, progress);
      }
    }
  }

  private renderSun(ctx: CanvasRenderingContext2D, x: number, y: number, progress: number): void {
    // Sun gets more orange during sunset
    const isSunset = progress > GameConfig.TIME_OF_DAY.DAY_END;
    const sunColor = isSunset ? '#FF6B35' : '#FFD700';
    const glowColor = isSunset ? 'rgba(255, 107, 53, 0.3)' : 'rgba(255, 215, 0, 0.3)';

    // Sun glow
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(x + 16, y + 16, 28, 0, Math.PI * 2);
    ctx.fill();

    // Sun body (pixel style)
    ctx.fillStyle = sunColor;
    ctx.fillRect(x + 4, y, 24, 4);
    ctx.fillRect(x, y + 4, 32, 24);
    ctx.fillRect(x + 4, y + 28, 24, 4);

    // Sun rays
    ctx.fillStyle = isSunset ? '#FF8C00' : '#FFEC8B';
    ctx.fillRect(x + 12, y - 6, 8, 4);
    ctx.fillRect(x + 12, y + 34, 8, 4);
    ctx.fillRect(x - 6, y + 12, 4, 8);
    ctx.fillRect(x + 34, y + 12, 4, 8);
  }

  private renderMoon(ctx: CanvasRenderingContext2D, x: number, y: number, progress: number): void {
    // Moon gets brighter as night progresses
    const nightProgress = (progress - GameConfig.TIME_OF_DAY.SUNSET_END) / (1 - GameConfig.TIME_OF_DAY.SUNSET_END);
    const glowIntensity = 0.1 + nightProgress * 0.2;

    // Moon glow (more intense at deep night)
    ctx.fillStyle = `rgba(255, 255, 200, ${glowIntensity})`;
    ctx.beginPath();
    ctx.arc(x + 16, y + 16, 30, 0, Math.PI * 2);
    ctx.fill();

    // Moon body (pixel style)
    ctx.fillStyle = '#ffffd0';
    ctx.fillRect(x + 4, y, 24, 4);
    ctx.fillRect(x, y + 4, 32, 24);
    ctx.fillRect(x + 4, y + 28, 24, 4);

    // Craters
    ctx.fillStyle = '#ffff88';
    ctx.fillRect(x + 8, y + 8, 4, 4);
    ctx.fillRect(x + 18, y + 14, 6, 6);

    // At very late night, add eerie red tint
    if (progress > 0.85) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
      ctx.fillRect(x, y, 32, 32);
    }
  }

  private renderFarMountains(ctx: CanvasRenderingContext2D, offset: number, progress: number): void {
    // Mountains get darker as night approaches
    const nightFactor = Math.max(0, (progress - 0.3) / 0.7);
    const baseColor = GameConfig.COLORS.MOUNTAIN_FAR;
    ctx.fillStyle = this.darkenColor(baseColor, nightFactor * 0.6);

    const groundY = GameConfig.GROUND_Y;

    // Mountain pattern that repeats
    for (let i = -1; i <= 2; i++) {
      const baseX = i * 300 - (offset % 300);

      // Mountain 1
      this.drawPixelMountain(ctx, baseX + 20, groundY - 50, 80, 50);
      // Mountain 2
      this.drawPixelMountain(ctx, baseX + 100, groundY - 70, 100, 70);
      // Mountain 3
      this.drawPixelMountain(ctx, baseX + 200, groundY - 45, 70, 45);
    }
  }

  private renderNearMountains(ctx: CanvasRenderingContext2D, offset: number, progress: number): void {
    // Near mountains also darken at night
    const nightFactor = Math.max(0, (progress - 0.3) / 0.7);
    const baseColor = GameConfig.COLORS.MOUNTAIN_NEAR;
    ctx.fillStyle = this.darkenColor(baseColor, nightFactor * 0.5);

    const groundY = GameConfig.GROUND_Y;

    for (let i = -1; i <= 2; i++) {
      const baseX = i * 400 - (offset % 400);

      this.drawPixelMountain(ctx, baseX + 50, groundY - 35, 60, 35);
      this.drawPixelMountain(ctx, baseX + 150, groundY - 55, 90, 55);
      this.drawPixelMountain(ctx, baseX + 280, groundY - 40, 70, 40);
    }
  }

  private drawPixelMountain(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    // Draw stepped mountain shape
    const steps = 5;
    const stepHeight = height / steps;
    const stepWidth = width / steps;

    for (let i = 0; i < steps; i++) {
      const stepY = y + (steps - 1 - i) * stepHeight;
      const stepX = x + i * stepWidth / 2;
      const currentWidth = width - i * stepWidth;
      ctx.fillRect(stepX, stepY, currentWidth, stepHeight + 1);
    }
  }

  private renderClouds(ctx: CanvasRenderingContext2D, offset: number, progress: number): void {
    // Clouds fade out during dusk and night
    const cloudOpacity = progress < 0.5 ? 1 : Math.max(0.2, 1 - (progress - 0.5) * 1.5);

    const clouds = [
      { x: 100, y: 40, size: 1 },
      { x: 300, y: 60, size: 0.8 },
      { x: 500, y: 35, size: 1.2 },
    ];

    ctx.globalAlpha = cloudOpacity;
    clouds.forEach((cloud) => {
      const x = (cloud.x - offset + this.width * 3) % (this.width * 2) - this.width / 2;
      if (x > -60 && x < this.width + 60) {
        this.drawPixelCloud(ctx, x, cloud.y, cloud.size, progress);
      }
    });
    ctx.globalAlpha = 1;
  }

  private drawPixelCloud(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    progress: number = 0
  ): void {
    // Clouds get darker/grayer at night
    const nightFactor = Math.max(0, (progress - 0.4) / 0.6);
    const baseColor = GameConfig.COLORS.CLOUD;
    ctx.fillStyle = nightFactor > 0 ? this.darkenColor(baseColor, nightFactor * 0.4) : baseColor;

    const s = scale * 4; // Base unit

    // Cloud shape (blocky)
    ctx.fillRect(x + s * 2, y, s * 4, s * 2);
    ctx.fillRect(x, y + s, s * 8, s * 2);
    ctx.fillRect(x + s, y + s * 2, s * 6, s);
  }

  private renderFloatingCrystals(ctx: CanvasRenderingContext2D, offset: number, progress: number): void {
    // At night, crystals glow more intensely
    const nightFactor = Math.max(0, (progress - 0.4) / 0.6);
    const glowIntensity = 0.3 + nightFactor * 0.5;

    const crystals = [
      { x: 150, y: 90, color: '#ff69b4', nightColor: '#ff99cc' },
      { x: 400, y: 75, color: '#00ffff', nightColor: '#88ffff' },
    ];

    crystals.forEach((crystal) => {
      const x = (crystal.x - offset + this.width * 2) % (this.width * 2) - this.width / 2;
      if (x > -20 && x < this.width + 20) {
        const y = crystal.y;

        // At night, add outer glow
        if (nightFactor > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${nightFactor * 0.2})`;
          ctx.fillRect(x, y - 2, 12, 16);
        }

        // Small floating crystal - brighter at night
        const crystalColor = nightFactor > 0.5 ? crystal.nightColor : crystal.color;
        ctx.fillStyle = crystalColor;
        ctx.fillRect(x + 4, y, 4, 4);
        ctx.fillRect(x + 2, y + 4, 8, 4);
        ctx.fillRect(x + 4, y + 8, 4, 4);

        // Inner glow - more intense at night
        ctx.fillStyle = `rgba(255, 255, 255, ${glowIntensity})`;
        ctx.fillRect(x + 5, y + 1, 2, 2);
      }
    });
  }

  reset(): void {
    this.layers.forEach((layer) => {
      layer.offset = 0;
    });
  }

  // Helper to darken a hex color by a factor (0 = no change, 1 = black)
  private darkenColor(hex: string, factor: number): string {
    // Parse hex color
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;

    const r = Math.round(parseInt(result[1], 16) * (1 - factor));
    const g = Math.round(parseInt(result[2], 16) * (1 - factor));
    const b = Math.round(parseInt(result[3], 16) * (1 - factor));

    return `rgb(${r}, ${g}, ${b})`;
  }
}
