/**
 * 角色 / 目标配置（数据驱动）。
 * 新增角色只需在此增加一条配置，并可在关卡 projectiles 中引用。
 */
import { ASSETS } from './assets';

export interface CharacterConfig {
  id: string;
  name: string;
  sprite: string;
  radius: number;
  mass: number;
  density: number;
  friction: number;
  restitution: number;
  launchPower: number;
  /** 能力 id（本轮仅 basic 可用，其余下一轮实现） */
  ability: string;
  scoreMultiplier?: number;
}

export const CHARACTERS: Record<string, CharacterConfig> = {
  red: { id: 'red', name: '小红', sprite: ASSETS.birds.red, radius: 24, mass: 1.0, density: 0.002, friction: 0.5, restitution: 0.35, launchPower: 20, ability: 'basic' },
  yellow: { id: 'yellow', name: '小黄', sprite: ASSETS.birds.yellow, radius: 20, mass: 0.9, density: 0.002, friction: 0.5, restitution: 0.4, launchPower: 21, ability: 'speed' },
  blue: { id: 'blue', name: '小蓝', sprite: ASSETS.birds.blue, radius: 22, mass: 1.1, density: 0.002, friction: 0.5, restitution: 0.35, launchPower: 20, ability: 'split' },
  black: { id: 'black', name: '小黑', sprite: ASSETS.birds.black, radius: 25, mass: 1.0, density: 0.0022, friction: 0.5, restitution: 0.3, launchPower: 19, ability: 'explosive' },
  white: { id: 'white', name: '小白', sprite: ASSETS.birds.white, radius: 26, mass: 1.3, density: 0.0022, friction: 0.5, restitution: 0.3, launchPower: 19, ability: 'white' },
};

export interface TargetConfig {
  id: string;
  name: string;
  sprite: string;
  radius: number;
  mass: number;
  health: number;
  scoreValue: number;
}

export const TARGETS: Record<string, TargetConfig> = {
  basic: { id: 'basic', name: '小猪', sprite: ASSETS.pigs.basic, radius: 22, mass: 1.0, health: 60, scoreValue: 500 },
  helmet: { id: 'helmet', name: '铁盔猪', sprite: ASSETS.pigs.helmet, radius: 23, mass: 1.2, health: 120, scoreValue: 750 },
  king: { id: 'king', name: '猪王', sprite: ASSETS.pigs.king, radius: 27, mass: 1.5, health: 180, scoreValue: 1000 },
  pig4: { id: 'pig4', name: '小猪4号', sprite: ASSETS.pigs.pig4, radius: 22, mass: 1.0, health: 70, scoreValue: 550 },
  pig5: { id: 'pig5', name: '小猪5号', sprite: ASSETS.pigs.pig5, radius: 22, mass: 1.0, health: 70, scoreValue: 550 },
};
