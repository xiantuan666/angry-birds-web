/**
 * 开发者自定义素材覆盖层。
 * 优先级：custom → default → fallback（Canvas 占位）。
 * 使用方法：把图片/音频放入 public/assets/custom/ 后在此配置，
 * 即可替换鸟、目标、方块、背景、音效等，无需修改游戏核心逻辑。
 */
export const CUSTOM_ASSETS: {
  birds?: Record<string, string>;
  pigs?: Record<string, string>;
  blocks?: Record<string, string>;
  launcher?: Record<string, string>;
  background?: Record<string, string>;
  effects?: Record<string, string>;
  ui?: Record<string, string>;
  audio?: Record<string, string>;
} = {
  // 示例：
  // birds: { red: '/assets/custom/my-red.png' },
  // pigs: { basic: '/assets/custom/my-pig.png' },
  // audio: { music: '/assets/custom/my-music.mp3' },
};
