/** 实体基类：物理刚体 + 运行时状态。 */
import Matter from 'matter-js';

export type EntityType = 'projectile' | 'target' | 'block' | 'ground' | 'debris';

export abstract class Entity {
  readonly id: string;
  body: Matter.Body;
  readonly type: EntityType;
  active = true;
  destroyed = false;
  /** 待统一清理标记（禁止在碰撞回调中直接删除刚体） */
  pendingRemoval = false;

  constructor(id: string, body: Matter.Body, type: EntityType) {
    this.id = id;
    this.body = body;
    this.type = type;
    body.plugin = body.plugin || {};
    body.plugin.entityId = id;
    body.plugin.entityType = type;
  }

  markForRemoval(): void {
    this.pendingRemoval = true;
  }

  destroy(): void {
    this.destroyed = true;
    this.active = false;
  }

  abstract update(dt: number): void;
}
