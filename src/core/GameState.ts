/** 游戏状态机（明确枚举，禁止用大量 boolean 控制整个游戏）。 */

export enum GameState {
  MENU = 'MENU',
  LEVEL_SELECT = 'LEVEL_SELECT',
  LOADING = 'LOADING',
  AIMING = 'AIMING',
  LAUNCHING = 'LAUNCHING',
  FLYING = 'FLYING',
  SETTLING = 'SETTLING',
  NEXT_PROJECTILE = 'NEXT_PROJECTILE',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  LEVEL_FAILED = 'LEVEL_FAILED',
  PAUSED = 'PAUSED',
}

/** 是否处于可暂停的游戏内状态 */
export function isPlayableState(state: GameState): boolean {
  return (
    state === GameState.AIMING ||
    state === GameState.LAUNCHING ||
    state === GameState.FLYING ||
    state === GameState.SETTLING ||
    state === GameState.NEXT_PROJECTILE
  );
}
