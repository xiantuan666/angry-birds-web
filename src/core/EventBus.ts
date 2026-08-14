/** 轻量事件总线，系统间解耦（Gameplay 只 emit，Audio/Score/UI 监听）。 */

import type { GameState } from './GameState';

export interface GameEventMap {
  PROJECTILE_LAUNCHED: { entityId: string; velocity: { x: number; y: number } };
  PROJECTILE_HIT: { entityId: string; impactSpeed: number; x: number; y: number };
  TARGET_DAMAGED: { entityId: string; health: number; impactSpeed: number };
  TARGET_DESTROYED: { entityId: string; x: number; y: number; score: number };
  BLOCK_DAMAGED: { entityId: string; health: number; impactSpeed: number };
  BLOCK_DESTROYED: { entityId: string; x: number; y: number; material: string; score: number };
  EXPLOSION: { x: number; y: number; radius: number };
  EGG_IMPACT: { x: number; y: number };
  LEVEL_COMPLETE: { levelId: number; score: number; stars: number };
  LEVEL_FAILED: { levelId: number };
  STATE_CHANGED: { from: GameState; to: GameState };
}

type AnyListener = (payload: never) => void;

export class EventBus {
  private listeners = new Map<string, Set<AnyListener>>();

  on<K extends keyof GameEventMap>(event: K, fn: (payload: GameEventMap[K]) => void): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(fn as AnyListener);
    return () => this.off(event, fn);
  }

  off<K extends keyof GameEventMap>(event: K, fn: (payload: GameEventMap[K]) => void): void {
    this.listeners.get(event)?.delete(fn as AnyListener);
  }

  emit<K extends keyof GameEventMap>(event: K, payload: GameEventMap[K]): void {
    this.listeners.get(event)?.forEach((fn) => fn(payload as never));
  }

  clear(): void {
    this.listeners.clear();
  }
}
