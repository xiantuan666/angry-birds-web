/** 摄像机：世界坐标 <-> 屏幕坐标转换、跟随、平滑、震动、边界。 */
import { GAME } from '../config/game';
import { clamp } from '../utils/math';

export class Camera {
  x = 0;
  y = 0;
  zoom = 1;
  /** 震动偏移（渲染层读取） */
  readonly shakeOffset = { x: 0, y: 0 };
  private viewW: number = GAME.VIEW_WIDTH;
  private viewH: number = GAME.VIEW_HEIGHT;
  private shakeTime = 0;
  private shakePower = 0;

  resize(w: number, h: number): void {
    this.viewW = w;
    this.viewH = h;
    this.clamp();
  }

  worldToScreen(wx: number, wy: number): { x: number; y: number } {
    return {
      x: (wx - this.x - this.shakeOffset.x) * this.zoom,
      y: (wy - this.y - this.shakeOffset.y) * this.zoom,
    };
  }

  screenToWorld(sx: number, sy: number): { x: number; y: number } {
    return {
      x: sx / this.zoom + this.x + this.shakeOffset.x,
      y: sy / this.zoom + this.y + this.shakeOffset.y,
    };
  }

  /** 平滑跟随目标并带视线前瞻（不锁死） */
  follow(x: number, y: number, vx: number, vy: number, smoothing: number): void {
    const lookX = vx * 0.35;
    const lookY = vy * 0.2;
    const tx = x + lookX - this.viewW / (2 * this.zoom);
    const ty = y + lookY - this.viewH / (2 * this.zoom);
    this.x += (tx - this.x) * smoothing;
    this.y += (ty - this.y) * smoothing;
    this.clamp();
  }

  /** 视图中心对准某世界点 */
  snapTo(wx: number, wy: number): void {
    this.x = wx - this.viewW / (2 * this.zoom);
    this.y = wy - this.viewH / (2 * this.zoom);
    this.clamp();
  }

  /** 按力度触发屏幕震动 */
  shake(power: number): void {
    this.shakePower = Math.max(this.shakePower, Math.min(power, 30));
    this.shakeTime = Math.max(this.shakeTime, 0.35);
  }

  update(dt: number): void {
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      this.shakeOffset.x = (Math.random() * 2 - 1) * this.shakePower;
      this.shakeOffset.y = (Math.random() * 2 - 1) * this.shakePower;
      if (this.shakeTime <= 0) {
        this.shakeOffset.x = 0;
        this.shakeOffset.y = 0;
        this.shakePower = 0;
      }
    }
  }

  /** 摄像机不能看到世界之外 */
  private clamp(): void {
    const viewW = this.viewW / this.zoom;
    const viewH = this.viewH / this.zoom;
    if (viewW >= GAME.WORLD_WIDTH) {
      this.x = (GAME.WORLD_WIDTH - viewW) / 2;
    } else {
      this.x = clamp(this.x, 0, GAME.WORLD_WIDTH - viewW);
    }
    if (viewH >= GAME.WORLD_HEIGHT) {
      this.y = (GAME.WORLD_HEIGHT - viewH) / 2;
    } else {
      this.y = clamp(this.y, 0, GAME.WORLD_HEIGHT - viewH);
    }
  }
}
