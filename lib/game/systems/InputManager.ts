// Input manager for keyboard and touch controls

export type InputAction = 'jump' | 'duck' | 'none';

export class InputManager {
  private keys: Map<string, boolean> = new Map();
  private justPressed: Map<string, boolean> = new Map();
  private preventDefaultKeys: string[] = ['Space', 'ArrowUp', 'ArrowDown'];
  private enabled: boolean = true;
  private touchStartY: number = 0;
  private isTouching: boolean = false;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
  }

  init(): void {
    if (typeof window === 'undefined') return;

    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }

  initTouch(canvas: HTMLCanvasElement): void {
    canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
  }

  destroy(): void {
    if (typeof window === 'undefined') return;

    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  destroyTouch(canvas: HTMLCanvasElement): void {
    canvas.removeEventListener('touchstart', this.handleTouchStart);
    canvas.removeEventListener('touchend', this.handleTouchEnd);
    canvas.removeEventListener('touchmove', this.handleTouchMove);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.preventDefaultKeys.includes(e.code)) {
      e.preventDefault();
    }

    if (!this.keys.get(e.code)) {
      this.justPressed.set(e.code, true);
    }
    this.keys.set(e.code, true);
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.keys.set(e.code, false);
    this.justPressed.set(e.code, false);
  }

  private handleTouchStart(e: TouchEvent): void {
    e.preventDefault();
    if (e.touches.length > 0) {
      this.touchStartY = e.touches[0].clientY;
      this.isTouching = true;
      // Treat tap as jump
      this.justPressed.set('Space', true);
      this.keys.set('Space', true);
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    e.preventDefault();
    this.isTouching = false;
    this.keys.set('Space', false);
    this.keys.set('ArrowDown', false);
  }

  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault();
    if (e.touches.length > 0 && this.isTouching) {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - this.touchStartY;

      // Swipe down to duck
      if (deltaY > 30) {
        this.keys.set('ArrowDown', true);
        this.keys.set('Space', false);
      } else {
        this.keys.set('ArrowDown', false);
      }
    }
  }

  isKeyDown(code: string): boolean {
    return this.enabled && (this.keys.get(code) ?? false);
  }

  isKeyJustPressed(code: string): boolean {
    return this.enabled && (this.justPressed.get(code) ?? false);
  }

  isJumpPressed(): boolean {
    return this.isKeyDown('Space') || this.isKeyDown('ArrowUp');
  }

  isJumpJustPressed(): boolean {
    return this.isKeyJustPressed('Space') || this.isKeyJustPressed('ArrowUp');
  }

  isDuckPressed(): boolean {
    return this.isKeyDown('ArrowDown');
  }

  clearJustPressed(): void {
    this.justPressed.clear();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  reset(): void {
    this.keys.clear();
    this.justPressed.clear();
    this.isTouching = false;
  }
}
