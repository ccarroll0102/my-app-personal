// Base entity class for all game objects

import { Vector2 } from '../utils/Vector2';
import { Rectangle } from '../utils/Rectangle';

export abstract class Entity {
  protected position: Vector2;
  protected velocity: Vector2;
  protected width: number;
  protected height: number;
  protected active: boolean = true;

  constructor(x: number, y: number, width: number, height: number) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, 0);
    this.width = width;
    this.height = height;
  }

  get x(): number {
    return this.position.x;
  }

  set x(value: number) {
    this.position.x = value;
  }

  get y(): number {
    return this.position.y;
  }

  set y(value: number) {
    this.position.y = value;
  }

  get isActive(): boolean {
    return this.active;
  }

  setActive(active: boolean): void {
    this.active = active;
  }

  getHitbox(): Rectangle {
    return new Rectangle(
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  // Get a slightly smaller hitbox for more forgiving collisions
  getForgivingHitbox(shrinkAmount: number = 4): Rectangle {
    return this.getHitbox().shrink(shrinkAmount);
  }

  abstract update(deltaTime: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
}
