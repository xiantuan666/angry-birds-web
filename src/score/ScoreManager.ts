/** 计分管理：连击、百分比星级、关卡满分（数据驱动）。 */
import { SCORE } from '../config/score';
import { TARGETS } from '../config/characters';
import { MATERIALS } from '../config/physics';
import type { LevelConfig } from '../levels/Level';

export class ScoreManager {
  private score = 0;
  private combo = 0;
  private lastComboAt = 0;

  reset(): void {
    this.score = 0;
    this.combo = 0;
    this.lastComboAt = 0;
  }

  getScore(): number {
    return this.score;
  }

  getCombo(): number {
    return this.combo;
  }

  /** 单次破坏得分（自动计算连击乘数），返回实际获得分数 */
  addDestruction(base: number): number {
    const now = Date.now();
    if (now - this.lastComboAt <= SCORE.comboWindowMs) {
      this.combo += 1;
    } else {
      this.combo = 1;
    }
    this.lastComboAt = now;
    const multiplier = Math.min(1 + SCORE.comboStep * (this.combo - 1), SCORE.comboCap);
    const points = Math.round(base * multiplier);
    this.score += points;
    return points;
  }

  /** 一次性加分（不参与连击，如剩余角色奖励） */
  addBonus(points: number): void {
    this.score += points;
  }

  /** 百分比星级：≥80% 三星 / ≥60% 二星 / ≥30% 一星 / 否则 0 星 */
  static calculateStarsByPercent(score: number, maxScore: number): number {
    if (maxScore <= 0) return score > 0 ? 3 : 0;
    const ratio = score / maxScore;
    if (ratio >= SCORE.STAR_THREE) return 3;
    if (ratio >= SCORE.STAR_TWO) return 2;
    if (ratio >= SCORE.STAR_ONE) return 1;
    return 0;
  }

  /** 关卡满分 = 全部猪 scoreValue + 全部方块材质 score */
  static calculateLevelMaxScore(level: LevelConfig): number {
    let total = 0;
    for (const t of level.targets) {
      total += TARGETS[t.type]?.scoreValue ?? 0;
    }
    for (const b of level.blocks) {
      total += MATERIALS[b.material as keyof typeof MATERIALS]?.score ?? 0;
    }
    return total;
  }
}
