/** 计分配置（集中配置，禁止魔法数字）。 */

export const SCORE = {
  /** 击败目标基础分 */
  target: 500,
  blockWood: 50,
  blockStone: 100,
  blockGlass: 75,
  /** 关卡结束时每个剩余角色奖励 */
  remainingProjectile: 500,
  /** 连击窗口（毫秒），窗口内连续破坏递增连击 */
  comboWindowMs: 1500,
  /** 连击乘数 = 1 + comboStep × (combo - 1)，封顶 comboCap */
  comboStep: 0.25,
  comboCap: 3,
} as const;
