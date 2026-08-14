/** 关卡数据类型（数据驱动，关卡编辑友好）。 */

export interface TargetSpawn {
  type: string;
  x: number;
  y: number;
}

export interface BlockSpawn {
  material: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  background?: string;
  world: { width: number; height: number };
  launcher: { x: number; y: number };
  projectiles: string[];
  targets: TargetSpawn[];
  blocks: BlockSpawn[];
}
