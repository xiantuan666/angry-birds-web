import Matter from 'matter-js';
import { Entity } from './Entity';
import { MATERIALS, type MaterialId } from '../config/physics';

export class Block extends Entity {
  readonly material: MaterialId;
  readonly sprite: string;
  readonly width: number;
  readonly height: number;
  health: number;

  constructor(id: string, body: Matter.Body, material: MaterialId, width: number, height: number, sprite: string) {
    super(id, body, 'block');
    this.material = material;
    this.width = width;
    this.height = height;
    this.sprite = sprite;
    this.health = MATERIALS[material].health;
    body.plugin = body.plugin || {};
    body.plugin.material = material;
  }

  update(_dt: number): void {
    // 本轮无每帧自定义逻辑
  }
}
