/** 能力注册表：数据驱动，新增能力只需注册实现。 */
import type { Ability } from './Ability';

export class AbilityRegistry {
  private readonly abilities = new Map<string, Ability>();

  register(ability: Ability): void {
    this.abilities.set(ability.id, ability);
  }

  get(id: string): Ability | undefined {
    return this.abilities.get(id);
  }

  has(id: string): boolean {
    return this.abilities.has(id);
  }
}
