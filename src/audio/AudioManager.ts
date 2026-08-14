/** 音频管理：Web Audio 播放音效 + HTMLAudio 循环音乐，支持音量分级与自动播放解锁。 */
import { AUDIO_KEYS } from '../config/assets';
import { CUSTOM_ASSETS } from '../config/customAssets';
import { clamp01, computeGain } from '../utils/math';

export type SfxKey =
  | 'launch'
  | 'collision'
  | 'breakWood'
  | 'breakStone'
  | 'breakGlass'
  | 'explosion'
  | 'targetHit'
  | 'targetDeath'
  | 'levelComplete'
  | 'button';

const SFX_URLS: Record<SfxKey, string | readonly string[]> = {
  launch: AUDIO_KEYS.launch,
  collision: AUDIO_KEYS.collision,
  breakWood: AUDIO_KEYS.breakWood,
  breakStone: AUDIO_KEYS.breakStone,
  breakGlass: AUDIO_KEYS.breakGlass,
  explosion: AUDIO_KEYS.explosion,
  targetHit: AUDIO_KEYS.targetHit,
  targetDeath: AUDIO_KEYS.targetDeath,
  levelComplete: AUDIO_KEYS.levelComplete,
  button: AUDIO_KEYS.button,
};

export class AudioManager {
  private ctx: AudioContext | null = null;
  private readonly bufferCache = new Map<string, AudioBuffer>();
  private musicEl: HTMLAudioElement | null = null;
  private musicUrl: string | null = null;
  private master = 0.8;
  private musicVolume = 0.7;
  private sfxVolume = 1;
  private unlocked = false;
  private readonly lastPlayedAt = new Map<string, number>();
  private readonly globalCooldownMs = 60;

  setMasterVolume(v: number): void {
    this.master = clamp01(v);
    this.applyMusicVolume();
  }

  setMusicVolume(v: number): void {
    this.musicVolume = clamp01(v);
    this.applyMusicVolume();
  }

  setSfxVolume(v: number): void {
    this.sfxVolume = clamp01(v);
  }

  getMasterVolume(): number { return this.master; }
  getMusicVolume(): number { return this.musicVolume; }
  getSfxVolume(): number { return this.sfxVolume; }

  /** 首次用户点击时解锁（浏览器自动播放策略） */
  unlock(): void {
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
      } catch {
        return;
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    this.unlocked = true;
  }

  play(key: SfxKey, throttleMs = 0): void {
    if (!this.unlocked || !this.ctx) return;
    const now = performance.now();
    const last = this.lastPlayedAt.get(key) ?? 0;
    if (now - last < Math.max(throttleMs, this.globalCooldownMs)) return;
    this.lastPlayedAt.set(key, now);

    const url = this.resolveUrl(key);
    if (!url) return;
    void this.playUrl(url, computeGain(this.master, this.sfxVolume));
  }

  playMusic(): void {
    const url = this.resolveUrl('music');
    if (!url) return;
    if (!this.musicEl) {
      this.musicEl = new Audio(url);
      this.musicEl.loop = true;
      this.musicUrl = url;
      this.applyMusicVolume();
    } else if (this.musicUrl !== url) {
      this.musicEl.src = url;
      this.musicUrl = url;
    }
    void this.musicEl.play().catch(() => {
      // 自动播放受限时静默，等待下次解锁
    });
  }

  stopMusic(): void {
    if (this.musicEl) {
      this.musicEl.pause();
      this.musicEl.currentTime = 0;
    }
  }

  private resolveUrl(key: SfxKey | 'music'): string | null {
    const custom = CUSTOM_ASSETS.audio?.[key];
    if (custom) return custom;
    if (key === 'music') return AUDIO_KEYS.music;
    const url = SFX_URLS[key];
    if (typeof url === 'string') return url;
    return url[Math.floor(Math.random() * url.length)] ?? null;
  }

  private async playUrl(url: string, gain: number): Promise<void> {
    try {
      const buffer = await this.getBuffer(url);
      if (!this.ctx) return;
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      const g = this.ctx.createGain();
      g.gain.value = gain;
      source.connect(g).connect(this.ctx.destination);
      source.start();
    } catch {
      // 素材缺失/解码失败：静默，不影响游戏
    }
  }

  private async getBuffer(url: string): Promise<AudioBuffer> {
    const cached = this.bufferCache.get(url);
    if (cached) return cached;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`音频加载失败: ${url}`);
    const arrayBuf = await resp.arrayBuffer();
    if (!this.ctx) throw new Error('AudioContext 未初始化');
    const buffer = await this.ctx.decodeAudioData(arrayBuf);
    this.bufferCache.set(url, buffer);
    return buffer;
  }

  private applyMusicVolume(): void {
    if (this.musicEl) this.musicEl.volume = computeGain(this.master, this.musicVolume);
  }
}
