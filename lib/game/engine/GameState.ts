// Game state machine

import { GameStateType } from '@/types/game';

export class GameState {
  private _state: GameStateType = 'idle';
  private _previousState: GameStateType = 'idle';
  private _stateTime: number = 0;

  get current(): GameStateType {
    return this._state;
  }

  get previous(): GameStateType {
    return this._previousState;
  }

  get timeInState(): number {
    return this._stateTime;
  }

  is(state: GameStateType): boolean {
    return this._state === state;
  }

  isAny(...states: GameStateType[]): boolean {
    return states.includes(this._state);
  }

  transition(newState: GameStateType): boolean {
    // Validate state transitions
    if (!this.canTransitionTo(newState)) {
      return false;
    }

    this._previousState = this._state;
    this._state = newState;
    this._stateTime = 0;
    return true;
  }

  update(deltaTime: number): void {
    this._stateTime += deltaTime;
  }

  private canTransitionTo(newState: GameStateType): boolean {
    const validTransitions: Record<GameStateType, GameStateType[]> = {
      idle: ['playing'],
      playing: ['paused', 'gameover', 'death_modal'],
      paused: ['playing', 'idle'],
      gameover: ['idle', 'playing'],
      death_modal: ['countdown', 'idle'],
      countdown: ['playing'],
    };

    return validTransitions[this._state]?.includes(newState) ?? false;
  }

  reset(): void {
    this._state = 'idle';
    this._previousState = 'idle';
    this._stateTime = 0;
  }
}
