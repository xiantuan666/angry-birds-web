import Matter from 'matter-js';
import { Entity } from './Entity';
import type { CharacterConfig } from '../config/characters';

export class Projectile extends Entity {
  readonly config: CharacterConfig;
  readonly sprite: string;
  launched = false;
  abilityUsed = false;
  launchedAt = 0;
  /** 本发是否已结算结束 */
  finished = false;

  constructor(id: string, body: Matter.Body, config: CharacterConfig) {
    super(id, body, 'projectile');
    this.config = config;
    this.sprite = config.sprite;
  }

  get radius(): number {
    return this.config.radius;
  }

  update(_dt: number): void {
    // 本轮无每帧自定义逻辑
  }
}
