/**
 * 默认素材路径映射（游戏逻辑禁止直接写死素材路径）。
 * 所有素材位于 public/assets/ 下，由开发者自行放入。
 */

export const ASSETS = {
  birds: {
    red: '/assets/birds/red.png',
    yellow: '/assets/birds/yellow.png',
    blue: '/assets/birds/blue.png',
    black: '/assets/birds/black.png',
    white: '/assets/birds/white.png',
  },
  pigs: {
    basic: '/assets/pigs/basic.png',
    helmet: '/assets/pigs/helmet.png',
    king: '/assets/pigs/king.png',
  },
  blocks: {
    wood: '/assets/blocks/wood.png',
    stone: '/assets/blocks/stone.png',
    glass: '/assets/blocks/glass.png',
  },
  launcher: {
    launcher: '/assets/launcher/launcher.png',
    bandLeft: '/assets/launcher/band-left.png',
    bandRight: '/assets/launcher/band-right.png',
  },
  background: {
    sky: '/assets/background/sky.png',
    clouds: '/assets/background/clouds.png',
    landscape: '/assets/background/landscape.png',
    ground: '/assets/background/ground.png',
  },
  effects: {
    explosion: '/assets/effects/explosion.png',
  },
  ui: {
    logo: '/assets/ui/logo.png',
  },
} as const;

export type AssetKind = keyof typeof ASSETS;

/** 音频资源路径（AudioManager 使用） */
export const AUDIO_KEYS = {
  music: '/assets/audio/music.mp4',
  launch: ['/assets/audio/launch-1.wav', '/assets/audio/launch-2.wav'],
  /** 相似碰撞音效随机选择 */
  collision: [
    '/assets/audio/collision-1.wav',
    '/assets/audio/collision-2.wav',
    '/assets/audio/collision-3.wav',
  ],
  breakWood: '/assets/audio/break-wood.wav',
  breakStone: '/assets/audio/break-stone.wav',
  breakGlass: '/assets/audio/break-glass.wav',
  explosion: '/assets/audio/explosion.wav',
  targetHit: '/assets/audio/target-hit.mp3',
  targetDeath: '/assets/audio/target-death.mp3',
  levelComplete: '/assets/audio/level-complete.wav',
  button: '/assets/audio/button.wav',
} as const;

/** 汇总所有图片素材 URL（用于预加载） */
export function collectImageUrls(): string[] {
  const urls = new Set<string>();
  const walk = (obj: unknown): void => {
    if (typeof obj === 'string') { urls.add(obj); return; }
    if (obj && typeof obj === 'object') {
      for (const v of Object.values(obj as Record<string, unknown>)) walk(v);
    }
  };
  walk(ASSETS);
  return [...urls];
}
