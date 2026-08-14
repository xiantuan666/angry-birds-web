/** UI 管理：DOM 屏幕切换、HUD、关卡选择、结算、设置。 */
import type { SaveSystem, Settings } from '../save/SaveSystem';
import { LEVEL_COUNT } from '../levels/LevelManager';

export type UIAction =
  | 'play'
  | 'levels'
  | 'settings'
  | 'menu'
  | 'resume'
  | 'restart'
  | 'retry'
  | 'next'
  | 'settings-back'
  | 'pause';

type ScreenName = 'loading' | 'menu' | 'levels' | 'settings' | 'pause' | 'complete' | 'failed';

const BIRD_COLORS: Record<string, string> = {
  red: '#e8453c',
  yellow: '#f5c518',
  blue: '#4a9fe8',
  black: '#3a3f45',
  white: '#f2f2f2',
};

function byId<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

export class UIManager {
  private readonly screens = new Map<ScreenName, HTMLElement>();
  private actionHandler: (action: UIAction) => void = () => {};
  private settingsHandler: (s: Settings) => void = () => {};

  constructor(private readonly save: SaveSystem) {
    (['loading', 'menu', 'levels', 'settings', 'pause', 'complete', 'failed'] as ScreenName[]).forEach((name) => {
      const el = byId<HTMLElement>(`screen-${name}`);
      if (el) this.screens.set(name, el);
    });
    document.querySelectorAll<HTMLElement>('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action as UIAction;
        this.actionHandler(action);
      });
    });
    byId('btn-pause')?.addEventListener('click', () => this.actionHandler('pause'));
    (['master', 'music', 'sfx'] as const).forEach((k) => {
      byId<HTMLInputElement>(`set-${k}`)?.addEventListener('input', () => this.emitSettings());
    });
  }

  setActionHandler(fn: (action: UIAction) => void): void {
    this.actionHandler = fn;
  }

  onSettingsChange(fn: (s: Settings) => void): void {
    this.settingsHandler = fn;
  }

  applySettings(s: Settings): void {
    const set = (id: string, v: number): void => {
      const el = byId<HTMLInputElement>(id);
      if (el) el.value = String(v);
    };
    set('set-master', s.masterVolume);
    set('set-music', s.musicVolume);
    set('set-sfx', s.sfxVolume);
  }

  private emitSettings(): void {
    const val = (id: string): number => {
      const el = byId<HTMLInputElement>(id);
      return el ? parseFloat(el.value) : 0;
    };
    this.settingsHandler({
      masterVolume: val('set-master'),
      musicVolume: val('set-music'),
      sfxVolume: val('set-sfx'),
    });
  }

  hideAllScreens(): void {
    this.screens.forEach((el) => el.classList.add('hidden'));
  }

  showScreen(name: ScreenName): void {
    this.hideAllScreens();
    const el = this.screens.get(name);
    if (el) el.classList.remove('hidden');
  }

  showHud(show: boolean): void {
    byId('hud')?.classList.toggle('hidden', !show);
  }

  setLoadingProgress(percent: number): void {
    const el = byId('loading-progress');
    if (el) el.textContent = `加载中… ${percent}%`;
  }

  updateHud(score: number, levelId: number, projectiles: { id: string; used: boolean }[]): void {
    const scoreEl = byId('hud-score');
    if (scoreEl) scoreEl.textContent = String(score);
    const levelEl = byId('hud-level');
    if (levelEl) levelEl.textContent = String(levelId);
    const listEl = byId('hud-projectiles');
    if (!listEl) return;
    listEl.innerHTML = '';
    projectiles.forEach((p, i) => {
      const span = document.createElement('span');
      span.className = `proj-icon${p.used ? ' used' : ''}${i === 0 ? ' current' : ''}`;
      span.style.background = BIRD_COLORS[p.id] ?? '#888';
      span.textContent = '●';
      span.title = p.id;
      listEl.appendChild(span);
    });
  }

  renderLevelList(onPick: (id: number) => void): void {
    const list = byId('level-list');
    if (!list) return;
    list.innerHTML = '';
    for (let i = 1; i <= LEVEL_COUNT; i++) {
      const unlocked = this.save.isUnlocked(i);
      const stars = this.save.getData().stars[i] ?? 0;
      const btn = document.createElement('button');
      btn.className = `level-btn${unlocked ? '' : ' locked'}`;
      if (unlocked) {
        btn.innerHTML = `${i}<div class="level-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>`;
        btn.addEventListener('click', () => onPick(i));
      } else {
        btn.innerHTML = `${i}<div class="level-stars">🔒</div>`;
        btn.disabled = true;
      }
      list.appendChild(btn);
    }
  }

  showComplete(score: number, stars: number): void {
    const scoreEl = byId('complete-score');
    if (scoreEl) scoreEl.textContent = String(score);
    const starsEl = byId('complete-stars');
    if (starsEl) {
      starsEl.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const s = document.createElement('span');
        s.className = `star${i < stars ? ' filled' : ''}`;
        s.textContent = '★';
        starsEl.appendChild(s);
      }
      starsEl.classList.remove('pop');
      void starsEl.offsetWidth; // 强制回流以重启动画
      starsEl.classList.add('pop');
    }
    this.showScreen('complete');
  }

  showFailed(): void {
    this.showScreen('failed');
  }

  showPause(): void {
    this.showScreen('pause');
  }

  showMenu(): void {
    this.showScreen('menu');
  }

  showLoading(): void {
    this.showScreen('loading');
  }

  showLevels(): void {
    this.showScreen('levels');
  }

  showSettingsScreen(): void {
    this.showScreen('settings');
  }
}
