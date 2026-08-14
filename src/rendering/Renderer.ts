/** 渲染器：背景/弹弓/实体/粒子/轨迹，Canvas 世界渲染。 */
import { Camera } from '../camera/Camera';
import { GAME } from '../config/game';
import { AssetManager } from '../assets/AssetManager';
import { ParticleSystem } from '../particles/ParticleSystem';
import type { Entity } from '../entities/Entity';
import type { Projectile } from '../entities/Projectile';
import type { Target } from '../entities/Target';
import type { Block } from '../entities/Block';
import type { Launcher } from '../entities/Launcher';

/** 方块纹理平铺尺寸（世界单位） */
const BLOCK_TILE = 64;

function materialColor(material: string): string {
  switch (material) {
    case 'wood': return '#c9975b';
    case 'stone': return '#a8adb4';
    case 'glass': return '#c9ecff';
    default: return '#cccccc';
  }
}

export class Renderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly patternCache = new Map<string, CanvasPattern>();
  private dpr = 1;
  private viewW = GAME.VIEW_WIDTH;
  private viewH = GAME.VIEW_HEIGHT;

  /** 生成/复用平铺纹理图案（按 BLOCK_TILE 等比缩放居中裁切，避免拉伸变形） */
  private getBlockPattern(img: HTMLImageElement): CanvasPattern | null {
    const cached = this.patternCache.get(img.src);
    if (cached) return cached;
    const c = document.createElement('canvas');
    c.width = BLOCK_TILE;
    c.height = BLOCK_TILE;
    const g = c.getContext('2d');
    if (!g) return null;
    const scale = Math.max(BLOCK_TILE / img.width, BLOCK_TILE / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    g.drawImage(img, (BLOCK_TILE - w) / 2, (BLOCK_TILE - h) / 2, w, h);
    const pattern = this.ctx.createPattern(c, 'repeat');
    if (pattern) this.patternCache.set(img.src, pattern);
    return pattern;
  }

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly camera: Camera,
    private readonly assets: AssetManager,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法创建 Canvas 2D 上下文');
    this.ctx = ctx;
  }

  /** 适配容器尺寸（保持 1280x720 逻辑分辨率，letterbox 居中） */
  resize(containerW: number, containerH: number): void {
    this.dpr = window.devicePixelRatio || 1;
    const scale = Math.min(containerW / GAME.VIEW_WIDTH, containerH / GAME.VIEW_HEIGHT);
    const w = Math.max(1, Math.floor(GAME.VIEW_WIDTH * scale));
    const h = Math.max(1, Math.floor(GAME.VIEW_HEIGHT * scale));
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.viewW = GAME.VIEW_WIDTH;
    this.viewH = GAME.VIEW_HEIGHT;
    this.camera.resize(this.viewW, this.viewH);
  }

  render(
    entities: Entity[],
    launcher: Launcher | null,
    particles: ParticleSystem,
    trajectory: { x: number; y: number }[],
  ): void {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.viewW, this.viewH);
    this.drawSky();

    // 世界变换
    const s = this.camera.zoom;
    const cx = this.camera.x + this.camera.shakeOffset.x;
    const cy = this.camera.y + this.camera.shakeOffset.y;
    ctx.save();
    ctx.setTransform(this.dpr * s, 0, 0, this.dpr * s, this.dpr * (-cx * s), this.dpr * (-cy * s));

    this.drawGround();

    // 弹弓后层（后叉 + 后带）
    if (launcher) this.drawLauncherBack(launcher);

    for (const e of entities) this.drawEntity(e);

    // 弹弓前层（前带）
    if (launcher) this.drawLauncherFront(launcher);

    this.drawTrajectory(trajectory);
    particles.render(ctx);
    ctx.restore();
  }

  private drawSky(): void {
    const ctx = this.ctx;
    const grad = ctx.createLinearGradient(0, 0, 0, this.viewH);
    grad.addColorStop(0, '#6db7ea');
    grad.addColorStop(0.6, '#a8d8f5');
    grad.addColorStop(1, '#e3f2fb');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.viewW, this.viewH);

    // 视差云
    const offset = -this.camera.x * 0.2;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (let i = 0; i < 7; i++) {
      const x = (((i * 260 + 60 + offset) % (this.viewW + 400)) + this.viewW + 400) % (this.viewW + 400) - 200;
      const y = 60 + ((i * 97) % 170);
      const scale = 1 + (i % 3) * 0.35;
      this.drawCloud(x, y, scale);
    }
  }

  private drawCloud(x: number, y: number, scale: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.arc(26, -8, 28, 0, Math.PI * 2);
    ctx.arc(56, 0, 22, 0, Math.PI * 2);
    ctx.arc(28, 8, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawGround(): void {
    const ctx = this.ctx;
    const gy = GAME.GROUND_Y;
    const grad = ctx.createLinearGradient(0, gy, 0, gy + 320);
    grad.addColorStop(0, '#8bc34a');
    grad.addColorStop(0.18, '#6d9a35');
    grad.addColorStop(1, '#5c3a1e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, gy, GAME.WORLD_WIDTH, 500);
    ctx.fillStyle = '#a5d66a';
    ctx.fillRect(0, gy, GAME.WORLD_WIDTH, 12);
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const y = gy + 34 + i * 34;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GAME.WORLD_WIDTH, y);
      ctx.stroke();
    }
  }

  private drawLauncherBack(launcher: Launcher): void {
    const ctx = this.ctx;
    const { x, y } = launcher.anchor;
    ctx.fillStyle = '#5b3a1e';
    this.roundRect(x - 34, y - 12, 16, 78, 6);
    this.roundRect(x + 18, y - 12, 16, 78, 6);
    // 后带
    const bird = launcher.current ? launcher.current.position : { x, y: y - 10 };
    ctx.strokeStyle = '#3a2410';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x - 26, y + 2);
    ctx.lineTo(bird.x, bird.y);
    ctx.stroke();
  }

  private drawLauncherFront(launcher: Launcher): void {
    const ctx = this.ctx;
    const { x, y } = launcher.anchor;
    if (!launcher.current) return;
    const bird = launcher.current.position;
    ctx.strokeStyle = '#4a2e14';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(bird.x, bird.y);
    ctx.lineTo(x + 26, y + 2);
    ctx.stroke();
    // 前叉覆盖（弹弓头）
    ctx.fillStyle = '#6b4423';
    this.roundRect(x - 6, y - 16, 12, 26, 6);
  }

  private drawEntity(e: Entity): void {
    if (e.type === 'ground') return;
    const ctx = this.ctx;
    const pos = e.body.position;

    if (e.type === 'block') {
      const blk = e as Block;
      const img = this.assets.get(blk.sprite);
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(e.body.angle);
      if (img) {
        // 平铺纹理填充，避免把整张贴图拉伸到方块尺寸导致变形
        const pattern = this.getBlockPattern(img);
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(-blk.width / 2, -blk.height / 2, blk.width, blk.height);
        } else {
          ctx.drawImage(img, -blk.width / 2, -blk.height / 2, blk.width, blk.height);
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(-blk.width / 2, -blk.height / 2, blk.width, blk.height);
      } else {
        ctx.fillStyle = materialColor(blk.material);
        ctx.fillRect(-blk.width / 2, -blk.height / 2, blk.width, blk.height);
        ctx.strokeStyle = 'rgba(0,0,0,0.28)';
        ctx.lineWidth = 3;
        ctx.strokeRect(-blk.width / 2, -blk.height / 2, blk.width, blk.height);
      }
      ctx.restore();
      return;
    }

    if (e.type === 'projectile' || e.type === 'target') {
      const ent = e as Projectile | Target;
      const radius = ent.config.radius;
      // 蛋：白鸟下蛋，画成椭圆
      if ((e.body.plugin as { isEgg?: boolean } | undefined)?.isEgg) {
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.fillStyle = '#f6efe4';
        ctx.strokeStyle = '#c9b89a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 0.9, radius * 1.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        return;
      }
      const img = this.assets.get(ent.sprite);
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(e.body.angle);
      const size = radius * 2 * 1.06;
      if (img) {
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
      } else {
        // Canvas 占位：彩色圆 + 眼睛 + 喙
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = e.type === 'target' ? '#6fbf4a' : '#e8453c';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(-radius * 0.32, -radius * 0.28, radius * 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(radius * 0.32, -radius * 0.28, radius * 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#222';
        ctx.beginPath(); ctx.arc(-radius * 0.32, -radius * 0.28, radius * 0.13, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(radius * 0.32, -radius * 0.28, radius * 0.13, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f5a623';
        ctx.beginPath();
        ctx.moveTo(0, radius * 0.12);
        ctx.lineTo(radius * 0.38, radius * 0.4);
        ctx.lineTo(-radius * 0.38, radius * 0.4);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private drawTrajectory(trajectory: { x: number; y: number }[]): void {
    if (trajectory.length < 2) return;
    const ctx = this.ctx;
    ctx.save();
    // 半透明曲线 + 圆点，呈现清晰的抛物线
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(trajectory[0].x, trajectory[0].y);
    for (let i = 1; i < trajectory.length; i++) {
      ctx.lineTo(trajectory[i].x, trajectory[i].y);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (let i = 0; i < trajectory.length; i += 2) {
      ctx.beginPath();
      ctx.arc(trajectory[i].x, trajectory[i].y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number): void {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  }
}
