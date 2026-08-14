/**
 * 全局游戏常量（集中配置，禁止魔法数字散落到代码）。
 */

export const GAME = {
  /** 世界尺寸（世界坐标） */
  WORLD_WIDTH: 3000,
  WORLD_HEIGHT: 1200,
  /** 逻辑分辨率（CSS 像素），Canvas 内部始终按此绘制 */
  VIEW_WIDTH: 1280,
  VIEW_HEIGHT: 720,
  /** 固定物理时间步长（秒） */
  FIXED_TIMESTEP: 1 / 60,
  /** 地面顶部 Y（世界坐标） */
  GROUND_Y: 950,
  /** 弹弓锚点相对地面的高度（世界坐标） */
  LAUNCHER_HEIGHT: 100,
  /** 最大拉弓距离（世界单位） */
  MAX_PULL_DISTANCE: 110,
  /** 发射速度系数：velocity = direction * LAUNCH_POWER * pullRatio（Matter 单位为 单位/帧） */
  LAUNCH_POWER: 20,
  /** 发射速度上限（单位/帧） */
  MAX_LAUNCH_VELOCITY: 24,
  /** 松手时最小有效拉弓比例，低于则放回弹弓不消耗角色 */
  MIN_LAUNCH_RATIO: 0.12,
  /** 瞄准轨迹预测用重力加速度（世界单位/秒²，与 Matter gravity.y=1 等效） */
  PREDICT_GRAVITY: 1000,
  /** 瞄准轨迹预测用空气阻力（与刚体 frictionAir 一致，默认 0.01） */
  PREDICT_FRICTION_AIR: 0.01,
  /** 角色飞行超时（秒），超时视为本发结束 */
  PROJECTILE_TIMEOUT: 8,
  /** 物理稳定判定：动态体平均速度低于该值即视为接近静止（单位/帧） */
  SETTLE_SPEED: 0.08,
  /** 持续稳定时长（毫秒）后才判定世界静止 */
  SETTLE_DURATION_MS: 1000,
  /** 目标全部消灭后等待坍塌结算的延迟（毫秒） */
  LEVEL_COMPLETE_DELAY_MS: 1500,
  /** 越界清理边界 */
  BOUNDS: { minX: -1000, maxX: 5000, maxY: 3000 },
  /** 碎片刚体数量上限 */
  DEBRIS_MAX_BODIES: 200,
} as const;
