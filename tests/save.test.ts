import { describe, it, expect } from 'vitest';
import { SaveSystem } from '../src/save/SaveSystem';

class MemoryStorage {
  private readonly map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

describe('SaveSystem 存档', () => {
  it('默认解锁第 1 关', () => {
    const save = new SaveSystem(new MemoryStorage());
    expect(save.isUnlocked(1)).toBe(true);
    expect(save.isUnlocked(2)).toBe(false);
  });

  it('记录结果解锁下一关并保存最高分/星级', () => {
    const save = new SaveSystem(new MemoryStorage());
    save.recordResult(1, 3000, 2);
    expect(save.isUnlocked(2)).toBe(true);
    expect(save.getData().bestScores[1]).toBe(3000);
    expect(save.getData().stars[1]).toBe(2);
  });

  it('从持久化存储恢复', () => {
    const storage = new MemoryStorage();
    const save = new SaveSystem(storage);
    save.recordResult(1, 2500, 1);
    const save2 = new SaveSystem(storage);
    expect(save2.isUnlocked(2)).toBe(true);
    expect(save2.getData().bestScores[1]).toBe(2500);
  });

  it('设置持久化且不覆盖默认值', () => {
    const storage = new MemoryStorage();
    const save = new SaveSystem(storage);
    save.setSettings({ masterVolume: 0.4 });
    const save2 = new SaveSystem(storage);
    expect(save2.getSettings().masterVolume).toBe(0.4);
    expect(save2.getSettings().musicVolume).toBe(0.7);
    expect(save2.getSettings().sfxVolume).toBe(1);
  });

  it('屏幕缩放默认 1 且可持久化', () => {
    const save = new SaveSystem(new MemoryStorage());
    expect(save.getSettings().screenScale).toBe(1);
    const storage = new MemoryStorage();
    const s1 = new SaveSystem(storage);
    s1.setSettings({ screenScale: 1.3 });
    const s2 = new SaveSystem(storage);
    expect(s2.getSettings().screenScale).toBe(1.3);
  });

  it('旧存档缺少 screenScale 时自动补默认 1', () => {
    const storage = new MemoryStorage();
    storage.setItem('game_save', JSON.stringify({ unlockedLevels: [1], settings: { masterVolume: 0.5 } }));
    const save = new SaveSystem(storage);
    expect(save.getSettings().screenScale).toBe(1);
    expect(save.getSettings().masterVolume).toBe(0.5);
  });
});
