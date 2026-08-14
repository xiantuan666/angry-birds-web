/** 固定时间步长游戏循环（避免不同设备 FPS 导致物理不一致）。 */
import { GAME } from '../config/game';

export class GameLoop {
  private rafId = 0;
  private lastTime = 0;
  private accumulator = 0;
  private running = false;
  private timeScale = 1;

  /** 固定步长回调（物理/逻辑更新） */
  onStep: ((dt: number) => void) | null = null;
  /** 渲染回调（alpha 为帧间插值系数） */
  onFrame: ((alpha: number) => void) | null = null;

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    const tick = (now: number): void => {
      if (!this.running) return;
      const frameDt = Math.min((now - this.lastTime) / 1000, 0.25);
      this.lastTime = now;
      this.accumulator += frameDt * this.timeScale;
      while (this.accumulator >= GAME.FIXED_TIMESTEP) {
        this.onStep?.(GAME.FIXED_TIMESTEP);
        this.accumulator -= GAME.FIXED_TIMESTEP;
      }
      this.onFrame?.(this.accumulator / GAME.FIXED_TIMESTEP);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  setTimeScale(s: number): void {
    this.timeScale = s;
  }

  getTimeScale(): number {
    return this.timeScale;
  }
}
