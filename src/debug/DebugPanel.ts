/** 开发调试面板（仅开发环境启用）。 */
export interface DebugHooks {
  getFps(): number;
  getBodyCount(): number;
  getParticleCount(): number;
  getState(): string;
  setGravityY(v: number): void;
  setLaunchPower(v: number): void;
  setTimeScale(v: number): void;
  setDamageMultiplier(v: number): void;
  setZoom(v: number): void;
}

export class DebugPanel {
  visible = false;

  constructor(
    private readonly el: HTMLElement | null,
    private readonly hooks: DebugHooks,
  ) {}

  toggle(): void {
    this.visible = !this.visible;
    this.el?.classList.toggle('hidden', !this.visible);
    if (this.visible) this.build();
  }

  update(): void {
    if (!this.visible || !this.el) return;
    const el = this.el;
    const q = (k: string): HTMLElement | null => el.querySelector(`[data-k="${k}"]`);
    const fps = q('fps');
    if (fps) fps.textContent = this.hooks.getFps().toFixed(0);
    const bodies = q('bodies');
    if (bodies) bodies.textContent = String(this.hooks.getBodyCount());
    const particles = q('particles');
    if (particles) particles.textContent = String(this.hooks.getParticleCount());
    const state = q('state');
    if (state) state.textContent = this.hooks.getState();
  }

  private build(): void {
    if (!this.el) return;
    const el = this.el;
    el.innerHTML = `
      <div class="db-title">Debug (F1)</div>
      <div>FPS <b data-k="fps">0</b></div>
      <div>刚体 <b data-k="bodies">0</b></div>
      <div>粒子 <b data-k="particles">0</b></div>
      <div>状态 <b data-k="state">-</b></div>
      <label>重力Y <input data-k="gravity" type="range" min="0" max="3" step="0.1" value="1"></label>
      <label>发射力度 <input data-k="power" type="range" min="5" max="40" step="0.5" value="20"></label>
      <label>时间缩放 <input data-k="timescale" type="range" min="0.1" max="2" step="0.05" value="1"></label>
      <label>伤害倍率 <input data-k="damage" type="range" min="0.1" max="5" step="0.1" value="1"></label>
      <label>镜头缩放 <input data-k="zoom" type="range" min="0.5" max="2" step="0.05" value="1"></label>
      <div class="db-keys">R 重开 · N 下一关 · P 暂停 · T 慢动作</div>`;
    const wire = (k: string, fn: (v: number) => void): void => {
      const input = el.querySelector<HTMLInputElement>(`[data-k="${k}"]`);
      input?.addEventListener('input', () => fn(parseFloat(input.value)));
    };
    wire('gravity', (v) => this.hooks.setGravityY(v));
    wire('power', (v) => this.hooks.setLaunchPower(v));
    wire('timescale', (v) => this.hooks.setTimeScale(v));
    wire('damage', (v) => this.hooks.setDamageMultiplier(v));
    wire('zoom', (v) => this.hooks.setZoom(v));
  }
}
