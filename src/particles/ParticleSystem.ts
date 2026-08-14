/** 粒子系统：对象池 + 飘字，Canvas 渲染，不参与物理。 */
import { clamp } from '../utils/math';
import type { MaterialId } from '../config/physics';

export interface Particle {
  active: boolean;
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number;
  size: number; rotation: number; rotationSpeed: number;
  alpha: number; gravity: number;
  color: string;
  shape: 'circle' | 'rect';
}

export interface FloatingText {
  x: number; y: number; text: string; life: number; maxLife: number;
}

const DEBRIS_COLORS: Record<MaterialId, string> = {
  wood: '#b07b3f',
  stone: '#9aa0a6',
  glass: '#bfe8ff',
};

export class ParticleSystem {
  private readonly particles: Particle[] = [];
  private readonly texts: FloatingText[] = [];
  private readonly maxParticles = 400;

  clear(): void {
    this.particles.length = 0;
    this.texts.length = 0;
  }

  getCount(): number {
    return this.particles.length;
  }

  private alloc(): Particle {
    for (const p of this.particles) if (!p.active) return p;
    if (this.particles.length < this.maxParticles) {
      const p: Particle = {
        active: true, x: 0, y: 0, vx: 0, vy: 0, life: 0.6, maxLife: 0.6,
        size: 3, rotation: 0, rotationSpeed: 0, alpha: 1, gravity: 300, color: '#fff', shape: 'circle',
      };
      this.particles.push(p);
      return p;
    }
    return this.particles[0];
  }

  spawn(x: number, y: number, partial: Partial<Particle>): void {
    const p = this.alloc();
    p.active = true;
    p.x = x; p.y = y;
    p.vx = partial.vx ?? 0;
    p.vy = partial.vy ?? 0;
    p.life = partial.life ?? 0.6;
    p.maxLife = p.life;
    p.size = partial.size ?? 3;
    p.rotation = partial.rotation ?? Math.random() * Math.PI * 2;
    p.rotationSpeed = partial.rotationSpeed ?? (Math.random() - 0.5) * 10;
    p.alpha = partial.alpha ?? 1;
    p.gravity = partial.gravity ?? 300;
    p.color = partial.color ?? '#fff';
    p.shape = partial.shape ?? 'circle';
  }

  spawnBurst(x: number, y: number, count: number, partial: Partial<Particle>): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 220;
      this.spawn(x, y, {
        ...partial,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80,
        life: 0.4 + Math.random() * 0.5,
      });
    }
  }

  spawnDust(x: number, y: number, count = 8): void {
    this.spawnBurst(x, y, count, { color: '#d8c9a3', size: 3 + Math.random() * 4, gravity: 100, alpha: 0.7 });
  }

  spawnDebris(x: number, y: number, material: MaterialId): void {
    this.spawnBurst(x, y, 12, {
      color: DEBRIS_COLORS[material],
      size: 3 + Math.random() * 4,
      gravity: 500,
      rotationSpeed: (Math.random() - 0.5) * 14,
    });
  }

  spawnPigDeath(x: number, y: number): void {
    this.spawnBurst(x, y, 20, { color: '#5fae4c', size: 3 + Math.random() * 5, gravity: 400 });
    this.spawnBurst(x, y, 8, { color: '#ffffff', size: 2 + Math.random() * 3, gravity: 100, alpha: 0.8 });
  }

  spawnScorePopup(x: number, y: number, points: number): void {
    this.texts.push({ x, y, text: `+${points}`, life: 1.0, maxLife: 1.0 });
    if (this.texts.length > 30) this.texts.shift();
  }

  update(dt: number): void {
    for (const p of this.particles) {
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.rotationSpeed * dt;
      p.alpha = clamp(p.life / p.maxLife, 0, 1);
    }
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.life -= dt;
      t.y -= 40 * dt;
      if (t.life <= 0) this.texts.splice(i, 1);
    }
  }

  /** 在世界坐标变换下渲染 */
  render(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      if (!p.active) continue;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size);
      }
      ctx.restore();
    }
    ctx.save();
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    for (const t of this.texts) {
      ctx.globalAlpha = clamp(t.life / t.maxLife, 0, 1);
      ctx.fillStyle = '#ffd54f';
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.restore();
  }
}
