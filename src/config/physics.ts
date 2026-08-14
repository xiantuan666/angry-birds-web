/**
 * 物理参数集中配置（材质、重力、伤害系数、碰撞分类）。
 */
import type { Body } from 'matter-js';

export interface MaterialConfig {
  density: number;
  friction: number;
  restitution: number;
  health: number;
  score: number;
  /** 作为攻击者（砸到目标/其他块）时的伤害倍率 */
  attackMultiplier: number;
}

export type MaterialId = keyof typeof MATERIALS;

export const MATERIALS = {
  wood: { density: 0.0012, friction: 0.7, restitution: 0.1, health: 100, score: 50, attackMultiplier: 1.0 },
  stone: { density: 0.004, friction: 0.8, restitution: 0.05, health: 300, score: 100, attackMultiplier: 1.6 },
  glass: { density: 0.0007, friction: 0.3, restitution: 0.25, health: 40, score: 75, attackMultiplier: 0.4 },
} satisfies Record<string, MaterialConfig>;

export const PHYSICS = {
  /** Matter.js 重力（y=1 等效约 1000 单位/秒²） */
  gravity: { x: 0, y: 1 },
  /** 伤害公式：impactSpeed × attackerMass × multiplier；低于该速度不造成伤害 */
  minimumImpactSpeed: 0.35,
  /** 整体伤害倍率（调手感用） */
  damageMultiplier: 1.0,
  /** 角色撞击倍率（满速直击可摧毁木块/小猪，石块需多次，调手感） */
  projectileDamageMultiplier: 6.0,
  /** 方块砸目标倍率 */
  blockDamageMultiplier: 1.0,
  /** 启用睡眠以提升性能 */
  sleeping: true,
};

/** 碰撞分类（collisionFilter） */
export const CATEGORY = {
  PROJECTILE: 0x0001,
  TARGET: 0x0002,
  WOOD: 0x0004,
  STONE: 0x0008,
  GLASS: 0x0010,
  GROUND: 0x0020,
  DEBRIS: 0x0040,
} as const;

export function materialCategory(material: MaterialId): number {
  switch (material) {
    case 'wood': return CATEGORY.WOOD;
    case 'stone': return CATEGORY.STONE;
    case 'glass': return CATEGORY.GLASS;
  }
}

/** 读取刚体上绑定的实体元数据 */
export function bodyEntityType(body: Body): string | undefined {
  return (body.plugin as { entityType?: string } | undefined)?.entityType;
}

export function bodyEntityId(body: Body): string | undefined {
  return (body.plugin as { entityId?: string } | undefined)?.entityId;
}

/** 动态体平均速度（单位/帧），用于稳定检测 */
export function averageDynamicSpeed(bodies: Body[]): number {
  let total = 0;
  let count = 0;
  for (const b of bodies) {
    if (b.isStatic) continue;
    total += Math.hypot(b.velocity.x, b.velocity.y);
    count += 1;
  }
  return count === 0 ? 0 : total / count;
}
