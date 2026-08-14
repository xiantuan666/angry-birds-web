import Matter from 'matter-js';
import { Entity } from './Entity';

export class Ground extends Entity {
  constructor(id: string, body: Matter.Body) {
    super(id, body, 'ground');
  }

  update(_dt: number): void {
    // 静态地面无需更新
  }
}
