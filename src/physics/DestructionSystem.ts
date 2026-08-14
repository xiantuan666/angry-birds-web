/** 破坏系统：监听目标/方块被摧毁事件，负责粒子、音效与计分（解耦）。 */
import { EventBus } from '../core/EventBus';
import { ParticleSystem } from '../particles/ParticleSystem';
import { AudioManager } from '../audio/AudioManager';
import { ScoreManager } from '../score/ScoreManager';
import type { MaterialId } from '../config/physics';

export class DestructionSystem {
  private readonly unsubs: Array<() => void> = [];

  constructor(
    private readonly deps: {
      bus: EventBus;
      particles: ParticleSystem;
      audio: AudioManager;
      score: ScoreManager;
    },
  ) {
    this.unsubs.push(deps.bus.on('TARGET_DESTROYED', (p) => this.onTarget(p)));
    this.unsubs.push(deps.bus.on('BLOCK_DESTROYED', (p) => this.onBlock(p)));
  }

  dispose(): void {
    this.unsubs.forEach((u) => u());
    this.unsubs.length = 0;
  }

  private onTarget(p: { x: number; y: number; score: number }): void {
    this.deps.particles.spawnPigDeath(p.x, p.y);
    this.deps.audio.play('targetDeath');
    const pts = this.deps.score.addDestruction(p.score);
    this.deps.particles.spawnScorePopup(p.x, p.y, pts);
  }

  private onBlock(p: { x: number; y: number; material: string; score: number }): void {
    this.deps.particles.spawnDebris(p.x, p.y, p.material as MaterialId);
    const key = p.material === 'wood' ? 'breakWood' : p.material === 'stone' ? 'breakStone' : 'breakGlass';
    this.deps.audio.play(key);
    const pts = this.deps.score.addDestruction(p.score);
    this.deps.particles.spawnScorePopup(p.x, p.y, pts);
  }
}
