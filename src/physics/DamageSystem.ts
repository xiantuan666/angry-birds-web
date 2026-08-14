/** 伤害计算（纯函数，便于单元测试）。 */
import { PHYSICS, MATERIALS, type MaterialId } from '../config/physics';

export interface ImpactInfo {
  impactSpeed: number;
  attackerMass: number;
  attackerType: 'projectile' | 'block' | 'debris';
  attackerMaterial?: MaterialId;
}

/**
 * 伤害 = impactSpeed × attackerMass × 材质/类型倍率；
 * 低于 minimumImpactSpeed 的低速接触不造成伤害。
 */
export function calculateDamage(info: ImpactInfo): number {
  if (info.impactSpeed < PHYSICS.minimumImpactSpeed) return 0;
  let multiplier = 1;
  if (info.attackerType === 'projectile') {
    multiplier = PHYSICS.projectileDamageMultiplier;
  } else if (info.attackerType === 'block' && info.attackerMaterial) {
    multiplier = MATERIALS[info.attackerMaterial].attackMultiplier * PHYSICS.blockDamageMultiplier;
  } else if (info.attackerType === 'debris') {
    multiplier = 0.5;
  }
  const raw = info.impactSpeed * info.attackerMass * multiplier * PHYSICS.damageMultiplier;
  return Math.max(0, Math.round(raw));
}
