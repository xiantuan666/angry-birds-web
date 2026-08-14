import Matter from 'matter-js';
import { Entity } from './Entity';
import type { TargetConfig } from '../config/characters';

export class Target extends Entity {
  readonly config: TargetConfig;
  readonly sprite: string;
  health: number;

  constructor(id: string, body: Matter.Body, config: TargetConfig) {
    super(id, body, 'target');
    this.config = config;
    this.sprite = config.sprite;
    this.health = config.health;
  }

  get scoreValue(): number {
    return this.config.scoreValue;
  }

  update(_dt: number): void {
    // 本轮无每帧自定义逻辑
  }
}
