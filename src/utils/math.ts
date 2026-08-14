/**
 * 数学工具与纯函数（独立于 DOM，便于单元测试）。
 */

export interface Vec2 { x: number; y: number; }

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

export function vecLength(v: Vec2): number {
  return Math.hypot(v.x, v.y);
}

export function vecNormalize(v: Vec2): Vec2 {
  const len = vecLength(v);
  if (len === 0) return { x: 1, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

/**
 * 弹射速度计算：
 * 拉弓方向 direction = anchor - pullPos（指向发射方向）；
 * 速度 = 归一化方向 × launchPower × pullRatio，并按 maxVelocity 钳制。
 * 拉弓比例低于 minRatio 时返回 null（放回弹弓，不消耗角色）。
 */
export function computeLaunchVelocity(
  anchor: Vec2,
  pullPos: Vec2,
  launchPower: number,
  maxPullDistance: number,
  maxVelocity: number,
  minRatio: number,
): { velocity: Vec2; ratio: number } | null {
  const dx = anchor.x - pullPos.x;
  const dy = anchor.y - pullPos.y;
  const distance = Math.hypot(dx, dy);
  const ratio = clamp(distance / maxPullDistance, 0, 1);
  if (ratio < minRatio) return null;
  const dir = distance > 0 ? vecNormalize({ x: dx, y: dy }) : { x: 1, y: 0 };
  const speed = Math.min(launchPower * ratio, maxVelocity);
  return { velocity: { x: dir.x * speed, y: dir.y * speed }, ratio };
}

/**
 * 瞄准轨迹预测（小圆点，不参与碰撞）。
 * 按当前速度与重力加速度采样 samples 个点，返回世界坐标点数组。
 */
export function predictTrajectory(
  start: Vec2,
  velocity: Vec2,
  gravityY: number,
  samples = 30,
  dt = 0.08,
  frictionAir = 0,
): Vec2[] {
  const points: Vec2[] = [];
  let x = start.x;
  let y = start.y;
  let vx = velocity.x;
  let vy = velocity.y;
  const drag = Math.pow(1 - frictionAir, dt * 60);
  for (let i = 0; i < samples; i++) {
    vx *= drag;
    vy *= drag;
    vy += gravityY * dt;
    x += vx * dt;
    y += vy * dt;
    points.push({ x, y });
    if (y > 3000) break;
  }
  return points;
}

/** 能力·加速：保持方向，速度 ×multiplier 并钳制到 maxSpeed */
export function boostVelocity(velocity: Vec2, multiplier: number, maxSpeed: number): Vec2 {
  const len = Math.hypot(velocity.x, velocity.y) || 1;
  const speed = Math.min(len * multiplier, maxSpeed);
  return { x: (velocity.x / len) * speed, y: (velocity.y / len) * speed };
}

/** 能力·分裂：生成 count 个速度（中间保持原速度，两侧按 spreadRad 展开并乘 magnitudeFactor） */
export function splitVelocities(velocity: Vec2, count: number, spreadRad: number, magnitudeFactor: number): Vec2[] {
  const vels: Vec2[] = [];
  const mid = Math.floor(count / 2);
  for (let i = 0; i < count; i++) {
    const offset = (i - mid) * spreadRad;
    if (offset === 0) {
      vels.push({ x: velocity.x, y: velocity.y });
      continue;
    }
    const angle = Math.atan2(velocity.y, velocity.x) + offset;
    const speed = Math.hypot(velocity.x, velocity.y) * magnitudeFactor;
    vels.push({ x: Math.cos(angle) * speed, y: Math.sin(angle) * speed });
  }
  return vels;
}

/** 音效增益换算：master × 分轨音量（0~1） */
export function computeGain(master: number, track: number): number {
  return clamp01(master) * clamp01(track);
}
