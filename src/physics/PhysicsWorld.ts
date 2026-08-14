/** 物理世界：统一负责 Matter 引擎、刚体、碰撞、睡眠与模拟。 */
import Matter from 'matter-js';
import { PHYSICS } from '../config/physics';

export class PhysicsWorld {
  readonly engine: Matter.Engine;

  constructor() {
    this.engine = Matter.Engine.create({ enableSleeping: PHYSICS.sleeping });
    this.engine.gravity.x = PHYSICS.gravity.x;
    this.engine.gravity.y = PHYSICS.gravity.y;
  }

  addBody(body: Matter.Body): void {
    Matter.Composite.add(this.engine.world, body);
  }

  removeBody(body: Matter.Body): void {
    Matter.Composite.remove(this.engine.world, body);
  }

  /** 固定步长推进（dt 秒） */
  step(dt: number): void {
    Matter.Engine.update(this.engine, dt * 1000);
  }

  getBodies(): Matter.Body[] {
    return Matter.Composite.allBodies(this.engine.world);
  }

  clear(): void {
    Matter.Composite.clear(this.engine.world, false);
    Matter.Engine.clear(this.engine);
  }

  dispose(): void {
    this.clear();
  }
}
