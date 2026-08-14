/** 指针输入：统一鼠标/触摸/触控笔，只跟踪单个指针，防止多指误操作。 */
import type { Camera } from '../camera/Camera';
import { GAME } from '../config/game';

export interface PointerDragTarget {
  /** 命中检测（世界坐标） */
  hitTest(wx: number, wy: number): boolean;
  onDragStart(wx: number, wy: number): void;
  onDragMove(wx: number, wy: number): void;
  onDragEnd(): void;
}

export class PointerController {
  private activePointerId: number | null = null;
  private dragging = false;
  private target: PointerDragTarget | null = null;
  /** 非拖拽点击回调（能力触发用） */
  onTap: ((wx: number, wy: number) => void) | null = null;

  constructor(private readonly canvas: HTMLCanvasElement, private readonly camera: Camera) {
    canvas.addEventListener('pointerdown', this.onDown);
    canvas.addEventListener('pointermove', this.onMove);
    canvas.addEventListener('pointerup', this.onUp);
    canvas.addEventListener('pointercancel', this.onUp);
  }

  dispose(): void {
    this.canvas.removeEventListener('pointerdown', this.onDown);
    this.canvas.removeEventListener('pointermove', this.onMove);
    this.canvas.removeEventListener('pointerup', this.onUp);
    this.canvas.removeEventListener('pointercancel', this.onUp);
  }

  setTarget(target: PointerDragTarget | null): void {
    this.target = target;
    if (!target) this.reset();
  }

  private readonly onDown = (e: PointerEvent): void => {
    if (this.activePointerId !== null) return;
    const w = this.toWorld(e);
    if (this.target && this.target.hitTest(w.x, w.y)) {
      this.activePointerId = e.pointerId;
      this.dragging = true;
      this.target.onDragStart(w.x, w.y);
      try {
        this.canvas.setPointerCapture(e.pointerId);
      } catch {
        // 某些环境不支持指针捕获，忽略
      }
      e.preventDefault();
    } else if (this.onTap) {
      // 未命中拖拽目标 → 视为点击（能力触发）
      this.onTap(w.x, w.y);
    }
  };

  private readonly onMove = (e: PointerEvent): void => {
    if (e.pointerId !== this.activePointerId || !this.dragging || !this.target) return;
    const w = this.toWorld(e);
    this.target.onDragMove(w.x, w.y);
    e.preventDefault();
  };

  private readonly onUp = (e: PointerEvent): void => {
    if (e.pointerId !== this.activePointerId) return;
    if (this.dragging && this.target) this.target.onDragEnd();
    this.reset();
  };

  private reset(): void {
    this.activePointerId = null;
    this.dragging = false;
  }

  private toWorld(e: PointerEvent): { x: number; y: number } {
    // 优先用 offsetX/offsetY（相对画布自身局部坐标，旋转后依然正确）；个别环境缺失时退回 rect 方式
    const rect = this.canvas.getBoundingClientRect();
    const cssX = typeof e.offsetX === 'number' ? e.offsetX : e.clientX - rect.left;
    const cssY = typeof e.offsetY === 'number' ? e.offsetY : e.clientY - rect.top;
    const cw = this.canvas.clientWidth || rect.width || 1;
    const ch = this.canvas.clientHeight || rect.height || 1;
    const sx = cssX * (GAME.VIEW_WIDTH / cw);
    const sy = cssY * (GAME.VIEW_HEIGHT / ch);
    return this.camera.screenToWorld(sx, sy);
  }
}
