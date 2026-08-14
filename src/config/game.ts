/**
 * 全局游戏常量（集中配置，禁止魔法数字散落到代码）。
 */

export const GAME = {
  /** 版本号（主界面显示；每次更新递增） */
  VERSION: '1.7.0',
  /** 世界尺寸（世界坐标）——高度加大，允许手机相机下探到地面 30% */
  WORLD_WIDTH: 3000,
  WORLD_HEIGHT: 1400,
  /** 逻辑分辨率（CSS 像素），Canvas 内部始终按此绘制 */
  VIEW_WIDTH: 1280,
  VIEW_HEIGHT: 720,
  /** 固定物理时间步长（秒） */
  FIXED_TIMESTEP: 1 / 60,
  /** 地面顶部 Y（世界坐标）——抬高地基，让弹弓位于屏幕中部 */
  GROUND_Y: 800,
  /** 弹弓锚点相对地面的高度（世界坐标） */
  LAUNCHER_HEIGHT: 100,
  /** 最大拉弓距离（世界单位） */
  MAX_PULL_DISTANCE: 110,
  /** 发射速度系数：velocity = direction * LAUNCH_POWER * pullRatio（Matter 单位为 单位/帧） */
  LAUNCH_POWER: 24,
  /** 发射速度上限（单位/帧） */
  MAX_LAUNCH_VELOCITY: 26,
  /** 松手时最小有效拉弓比例，低于则放回弹弓不消耗角色 */
  MIN_LAUNCH_RATIO: 0.12,
  /** 瞄准轨迹预测用重力加速度（世界单位/秒²，与 Matter gravity.y=1 等效） */
  PREDICT_GRAVITY: 1000,
  /** 瞄准轨迹预测用空气阻力（与刚体 frictionAir 一致） */
  PREDICT_FRICTION_AIR: 0.005,
  /** 角色飞行超时（秒），超时视为本发结束 */
  PROJECTILE_TIMEOUT: 8,
  /** 物理稳定判定：动态体平均速度低于该值即视为接近静止（单位/帧） */
  SETTLE_SPEED: 0.08,
  /** 持续稳定时长（毫秒）后才判定世界静止 */
  SETTLE_DURATION_MS: 1000,
  /** 目标全部消灭后等待坍塌结算的延迟（毫秒） */
  LEVEL_COMPLETE_DELAY_MS: 1500,
  /** 猪判定为“坠落”的向下位移阈值（世界单位），超阈值即摧毁并得分 */
  FALL_DISTANCE: 30,
  /** 支撑探测容差（世界单位）：支撑面在实体底部下方不超过该值视为有支撑 */
  SUPPORT_GAP: 4,
  /** 近静止判定速度（单位/帧）：低于该值视为静止，参与支撑集合检测 */
  REST_SPEED: 0.05,
  /** 越界清理边界 */
  BOUNDS: { minX: -1000, maxX: 5000, maxY: 3000 },
  /** 碎片刚体数量上限 */
  DEBRIS_MAX_BODIES: 200,
} as const;
