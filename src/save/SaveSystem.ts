/** 存档系统：LocalStorage（key: game_save），保存解锁关卡/最高分/星级/音量设置。 */

export interface Settings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
}

export interface SaveData {
  unlockedLevels: number[];
  bestScores: Record<number, number>;
  stars: Record<number, number>;
  settings: Settings;
}

const KEY = 'game_save';

const DEFAULT_SETTINGS: Settings = { masterVolume: 0.8, musicVolume: 0.7, sfxVolume: 1 };

const DEFAULT_DATA: SaveData = {
  unlockedLevels: [1],
  bestScores: {},
  stars: {},
  settings: { ...DEFAULT_SETTINGS },
};

export class SaveSystem {
  private data: SaveData;

  constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage) {
    this.data = this.load();
  }

  private load(): SaveData {
    try {
      const raw = this.storage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SaveData>;
        // 深拷贝可变嵌套字段，避免跨实例共享默认对象
        return {
          unlockedLevels: [...(parsed.unlockedLevels ?? DEFAULT_DATA.unlockedLevels)],
          bestScores: { ...(parsed.bestScores ?? {}) },
          stars: { ...(parsed.stars ?? {}) },
          settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
        };
      }
    } catch (e) {
      console.error('读取存档失败', e);
    }
    return {
      unlockedLevels: [...DEFAULT_DATA.unlockedLevels],
      bestScores: {},
      stars: {},
      settings: { ...DEFAULT_SETTINGS },
    };
  }

  private persist(): void {
    try {
      this.storage.setItem(KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('保存存档失败', e);
    }
  }

  getData(): SaveData {
    return this.data;
  }

  isUnlocked(level: number): boolean {
    return this.data.unlockedLevels.includes(level);
  }

  unlockLevel(level: number): void {
    if (!this.isUnlocked(level)) {
      this.data.unlockedLevels.push(level);
      this.persist();
    }
  }

  /** 记录关卡结果并解锁下一关 */
  recordResult(level: number, score: number, stars: number): void {
    this.data.bestScores[level] = Math.max(this.data.bestScores[level] ?? 0, score);
    this.data.stars[level] = Math.max(this.data.stars[level] ?? 0, stars);
    this.unlockLevel(level + 1);
    this.persist();
  }

  getSettings(): Settings {
    return this.data.settings;
  }

  setSettings(partial: Partial<Settings>): void {
    this.data.settings = { ...this.data.settings, ...partial };
    this.persist();
  }

  resetProgress(): void {
    this.data = {
      unlockedLevels: [...DEFAULT_DATA.unlockedLevels],
      bestScores: {},
      stars: {},
      settings: { ...DEFAULT_SETTINGS },
    };
    this.persist();
  }
}
