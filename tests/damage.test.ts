import { describe, it, expect } from 'vitest';
import { calculateDamage } from '../src/physics/DamageSystem';
import { PHYSICS } from '../src/config/physics';

describe('calculateDamage 伤害公式', () => {
  it('低速撞击不造成伤害', () => {
    expect(calculateDamage({ impactSpeed: 0.1, attackerMass: 2, attackerType: 'projectile' })).toBe(0);
  });

  it('高速撞击按 速度×质量×倍率 计算', () => {
    const d = calculateDamage({ impactSpeed: 5, attackerMass: 1, attackerType: 'projectile' });
    expect(d).toBeGreaterThan(0);
    expect(d).toBe(Math.round(5 * 1 * PHYSICS.projectileDamageMultiplier * PHYSICS.damageMultiplier));
  });

  it('石块作为攻击者倍率高于木块', () => {
    const stone = calculateDamage({ impactSpeed: 5, attackerMass: 2, attackerType: 'block', attackerMaterial: 'stone' });
    const wood = calculateDamage({ impactSpeed: 5, attackerMass: 2, attackerType: 'block', attackerMaterial: 'wood' });
    expect(stone).toBeGreaterThan(wood);
  });

  it('碎片伤害减半', () => {
    const d = calculateDamage({ impactSpeed: 5, attackerMass: 1, attackerType: 'debris' });
    expect(d).toBe(Math.round(5 * 1 * 0.5 * PHYSICS.damageMultiplier));
  });
});
