/** 实体工厂：由数据配置创建实体（角色/目标/方块/地面）。 */
import Matter from 'matter-js';
import { CHARACTERS, TARGETS, type CharacterConfig } from '../config/characters';
import { CATEGORY, MATERIALS, materialCategory, type MaterialId } from '../config/physics';
import { AssetResolver } from '../assets/AssetResolver';
import { Projectile } from './Projectile';
import { Target } from './Target';
import { Block } from './Block';
import { Ground } from './Ground';

let seq = 0;
const nextId = (prefix: string): string => `${prefix}_${String(++seq).padStart(3, '0')}`;

export class EntityFactory {
  constructor(private readonly resolver: AssetResolver) {}

  createProjectile(charId: string, x: number, y: number): Projectile {
    const config = CHARACTERS[charId];
    if (!config) throw new Error(`未知角色: ${charId}`);
    const sprite = this.resolver.resolve('birds', charId) || config.sprite;
    const body = Matter.Bodies.circle(x, y, config.radius, {
      density: config.density,
      friction: config.friction,
      restitution: config.restitution,
      // 角色飞行空气阻力（0.005：飞行距离足，落地后能较快停下）
      frictionAir: 0.005,
      // 等待发射时静态且不参与碰撞（发射时恢复动态与 mask）
      isStatic: true,
      collisionFilter: { category: CATEGORY.PROJECTILE, mask: 0 },
    });
    Matter.Body.setMass(body, config.mass);
    return new Projectile(nextId('projectile'), body, { ...config, sprite });
  }

  /** 创建"已在飞行中"的角色刚体（分裂/下蛋用）：动态、可碰撞、带速度 */
  createDynamicProjectile(
    config: CharacterConfig,
    x: number,
    y: number,
    velocity: { x: number; y: number },
  ): Projectile {
    const sprite = this.resolver.resolve('birds', config.id) || config.sprite;
    const body = Matter.Bodies.circle(x, y, config.radius, {
      density: config.density,
      friction: config.friction,
      restitution: config.restitution,
      frictionAir: 0.002,
      collisionFilter: { category: CATEGORY.PROJECTILE, mask: 0xffff },
    });
    Matter.Body.setMass(body, config.mass);
    Matter.Body.setVelocity(body, velocity);
    Matter.Sleeping.set(body, false);
    return new Projectile(nextId('projectile'), body, { ...config, sprite });
  }

  createTarget(type: string, x: number, y: number): Target {
    const config = TARGETS[type];
    if (!config) throw new Error(`未知目标类型: ${type}`);
    const sprite = this.resolver.resolve('pigs', type) || config.sprite;
    const body = Matter.Bodies.circle(x, y, config.radius, {
      density: 0.002,
      friction: 0.5,
      restitution: 0.3,
      collisionFilter: { category: CATEGORY.TARGET, mask: 0xffff },
    });
    Matter.Body.setMass(body, config.mass);
    return new Target(nextId('target'), body, { ...config, sprite });
  }

  createBlock(material: string, x: number, y: number, width: number, height: number, rotation = 0): Block {
    const mat = material as MaterialId;
    if (!MATERIALS[mat]) throw new Error(`未知材质: ${material}`);
    const m = MATERIALS[mat];
    const sprite = this.resolver.resolve('blocks', mat);
    const body = Matter.Bodies.rectangle(x, y, width, height, {
      density: m.density,
      friction: m.friction,
      restitution: m.restitution,
      angle: rotation,
      collisionFilter: { category: materialCategory(mat), mask: 0xffff },
    });
    return new Block(nextId('block'), body, mat, width, height, sprite);
  }

  createGround(worldWidth: number, groundY: number): Ground {
    const body = Matter.Bodies.rectangle(worldWidth / 2, groundY + 50, worldWidth + 400, 100, {
      isStatic: true,
      friction: 0.9,
      collisionFilter: { category: CATEGORY.GROUND, mask: 0xffff },
    });
    return new Ground(nextId('ground'), body);
  }
}
