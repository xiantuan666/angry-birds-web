/** 计分管理：连击、星级（阈值来自关卡数据，不写死在管理器）。 */
import { SCORE } from '../config/score';

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

  /** 根据关卡阈值计算星级（0~3） */
  static calculateStars(score: number, thresholds: [number, number, number]): number {
    if (score >= thresholds[2]) return 3;
    if (score >= thresholds[1]) return 2;
    if (score >= thresholds[0]) return 1;
    return 0;
  }
}
