/** 游戏主编排器：状态机、关卡流程、输入、发射、结算。 */
import Matter from 'matter-js';
import { GAME } from '../config/game';
import { PHYSICS, averageDynamicSpeed } from '../config/physics';
import { SCORE } from '../config/score';
import { ABILITIES } from '../config/abilities';
import type { CharacterConfig } from '../config/characters';
import { GameState, isPlayableState } from './GameState';
import { GameLoop } from './GameLoop';
import { EventBus } from './EventBus';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { CollisionManager } from '../physics/CollisionManager';
import { SupportSystem } from '../physics/SupportSystem';
import { ExplosionSystem } from '../physics/ExplosionSystem';
import { DestructionSystem } from '../physics/DestructionSystem';
import { EntityFactory } from '../entities/EntityFactory';
import type { Entity } from '../entities/Entity';
import type { Projectile } from '../entities/Projectile';
import type { Target } from '../entities/Target';
import { Launcher } from '../entities/Launcher';
import { Camera } from '../camera/Camera';
import { PointerController, type PointerDragTarget } from '../input/PointerController';
import { Renderer } from '../rendering/Renderer';
import { ParticleSystem } from '../particles/ParticleSystem';
import { AudioManager } from '../audio/AudioManager';
import { ScoreManager } from '../score/ScoreManager';
import { SaveSystem } from '../save/SaveSystem';
import { UIManager, type UIAction } from '../ui/UIManager';
import { DebugPanel, type DebugHooks } from '../debug/DebugPanel';
import { LevelManager } from '../levels/LevelManager';
import type { LevelConfig } from '../levels/Level';
import { AssetManager } from '../assets/AssetManager';
import { AssetResolver } from '../assets/AssetResolver';
import { AbilityRegistry } from '../abilities/AbilityRegistry';
import { SpeedAbility } from '../abilities/SpeedAbility';
import { SplitAbility } from '../abilities/SplitAbility';
import { ExplosiveAbility } from '../abilities/ExplosiveAbility';
import { WhiteAbility } from '../abilities/WhiteAbility';
import type { AbilityContext } from '../abilities/Ability';
import { computeLaunchVelocity, predictTrajectory } from '../utils/math';

export class Game implements PointerDragTarget {
  private readonly canvas: HTMLCanvasElement;
  private readonly camera = new Camera();
  private readonly bus = new EventBus();
  private readonly particles = new ParticleSystem();
  private readonly audio = new AudioManager();
  private readonly score = new ScoreManager();
  private readonly save = new SaveSystem();
  private readonly levels = new LevelManager();
  private readonly assets = new AssetManager();
  private readonly resolver = new AssetResolver();
  private readonly abilities = new AbilityRegistry();
  private readonly loop = new GameLoop();
  private readonly ui: UIManager;
  private readonly destruction: DestructionSystem;

  private renderer!: Renderer;
  private world!: PhysicsWorld;
  private collision!: CollisionManager;
  private support!: SupportSystem;
  private explosion!: ExplosionSystem;
  private factory!: EntityFactory;
  private input!: PointerController;
  private debugPanel!: DebugPanel;

  private state: GameState = GameState.MENU;
  private prevState: GameState = GameState.MENU;
  private settingsReturn: 'menu' | 'pause' = 'menu';

  private readonly entities: Entity[] = [];
  private readonly entityById = new Map<string, Entity>();
  private targets: Target[] = [];
  private projectileQueue: string[] = [];
  private currentProjectile: Projectile | null = null;
  private launcher: Launcher | null = null;
  private level: LevelConfig | null = null;

  private trajectory: { x: number; y: number }[] = [];
  private dragging = false;
  private settleTimer = 0;
  private completeTimer = 0;
  private launchPower: number = GAME.LAUNCH_POWER;
  private fps = 0;
  private frameCount = 0;
  private fpsTimer = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    if (import.meta.env.DEV) {
      (window as unknown as { __Matter?: typeof Matter }).__Matter = Matter;
    }
    this.ui = new UIManager(this.save);
    this.destruction = new DestructionSystem({
      bus: this.bus,
      particles: this.particles,
      audio: this.audio,
      score: this.score,
    });
    // 爆炸特效（黑鸟爆炸 / 蛋爆炸统一走 EXPLOSION 事件）
    this.bus.on('EXPLOSION', (e) => {
      this.particles.spawnBurst(e.x, e.y, 26, { color: '#ff8a3d', size: 4 + Math.random() * 3, gravity: 120 });
      this.particles.spawnBurst(e.x, e.y, 12, { color: '#5a5a5a', size: 5, gravity: 60, alpha: 0.8, life: 0.7 });
      this.audio.play('explosion');
      this.camera.shake(16);
    });
    this.bus.on('EGG_IMPACT', (p) => {
      if (this.explosion) {
        this.explosion.apply(
          p.x,
          p.y,
          ABILITIES.EGG_EXPLOSION_RADIUS,
          ABILITIES.EGG_EXPLOSION_FORCE,
          ABILITIES.EGG_EXPLOSION_DAMAGE,
        );
      }
    });
    this.setupUi();
    this.registerAbilities();
  }

  /** 释放全部资源与监听（防止内存泄漏） */
  dispose(): void {
    this.destruction.dispose();
    this.loop.stop();
    this.input?.dispose();
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('visibilitychange', this.handleVisibility);
    this.unloadLevel();
  }

  async init(): Promise<void> {
    this.renderer = new Renderer(this.canvas, this.camera, this.assets);
    this.input = new PointerController(this.canvas, this.camera);
    this.input.setTarget(this);
    this.input.onTap = () => this.triggerAbility();
    const panelEl = document.getElementById('debug-panel') as HTMLElement | null;
    this.debugPanel = new DebugPanel(panelEl, this.debugHooks());

    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('visibilitychange', this.handleVisibility);
    this.handleResize();

    this.loop.onStep = (dt) => this.update(dt);
    this.loop.onFrame = () => this.render();
    this.loop.start();

    this.setState(GameState.LOADING);
    this.ui.showLoading();
    await this.assets.preload((loaded, total) => {
      this.ui.setLoadingProgress(total === 0 ? 100 : Math.round((loaded / total) * 100));
    });
    this.toMenu();
  }

  // ---------- UI ----------

  private setupUi(): void {
    this.ui.setActionHandler((action) => this.handleAction(action));
    document.getElementById('btn-fullscreen')?.addEventListener('click', () => this.toggleFullscreen());
    this.ui.onSettingsChange((settings) => {
      this.save.setSettings(settings);
      this.audio.setMasterVolume(settings.masterVolume);
      this.audio.setMusicVolume(settings.musicVolume);
      this.audio.setSfxVolume(settings.sfxVolume);
    });
    const s = this.save.getSettings();
    this.ui.applySettings(s);
    this.audio.setMasterVolume(s.masterVolume);
    this.audio.setMusicVolume(s.musicVolume);
    this.audio.setSfxVolume(s.sfxVolume);
  }

  private handleAction(action: UIAction): void {
    this.audio.unlock();
    this.audio.play('button');
    switch (action) {
      case 'play': this.startFirstUnlocked(); break;
      case 'levels': this.showLevelSelect(); break;
      case 'settings': this.openSettings(this.state === GameState.PAUSED ? 'pause' : 'menu'); break;
      case 'settings-back': this.backFromSettings(); break;
      case 'resume': this.resume(); break;
      case 'pause': this.pause(); break;
      case 'restart':
      case 'retry': this.restartLevel(); break;
      case 'next': this.nextLevel(); break;
      case 'menu': this.toMenu(); break;
    }
  }

  private startFirstUnlocked(): void {
    const unlocked = [...this.save.getData().unlockedLevels].sort((a, b) => a - b);
    this.playLevel(unlocked[0] ?? 1);
  }

  private openSettings(from: 'menu' | 'pause'): void {
    this.settingsReturn = from;
    this.ui.showSettingsScreen();
  }

  private backFromSettings(): void {
    if (this.settingsReturn === 'pause') this.ui.showPause();
    else this.ui.showMenu();
  }

  // ---------- 生命周期与状态 ----------

  private setState(to: GameState): void {
    if (this.state === to) return;
    const from = this.state;
    this.state = to;
    this.bus.emit('STATE_CHANGED', { from, to });
  }

  private update(dt: number): void {
    this.updateFps(dt);
    this.particles.update(dt);
    this.camera.update(dt);
    this.debugPanel.update();

    if (this.state === GameState.PAUSED) return;

    if (
      this.state === GameState.FLYING ||
      this.state === GameState.SETTLING ||
      this.state === GameState.LAUNCHING ||
      this.state === GameState.LEVEL_COMPLETE ||
      this.state === GameState.LEVEL_FAILED
    ) {
      this.world.step(dt);
      if (this.state === GameState.FLYING || this.state === GameState.SETTLING) {
        this.handleFlight(dt);
      }
      // 支撑丢失检测 + 猪坠落判定（保证失去支撑必倒、坠落得分）
      this.support.wakeUnsupported(this.entities);
      this.support.checkFallenTargets(this.targets, this.bus);
    }

    this.cleanupPending();
    this.cleanupOutOfBounds();
  }

  private render(): void {
    this.renderer.render(this.entities, this.launcher, this.particles, this.trajectory);
  }

  private pause(): void {
    if (!isPlayableState(this.state)) return;
    this.prevState = this.state;
    this.setState(GameState.PAUSED);
    this.ui.showPause();
  }

  private resume(): void {
    if (this.state !== GameState.PAUSED) return;
    this.setState(this.prevState);
    this.ui.hideAllScreens();
    this.ui.showHud(true);
  }

  private toMenu(): void {
    this.unloadLevel();
    this.setState(GameState.MENU);
    this.ui.showHud(false);
    this.ui.renderLevelList((id) => this.playLevel(id));
    this.ui.showMenu();
  }

  private showLevelSelect(): void {
    this.setState(GameState.LEVEL_SELECT);
    this.ui.showHud(false);
    this.ui.renderLevelList((id) => this.playLevel(id));
    this.ui.showLevels();
  }

  private restartLevel(): void {
    const current = this.level ?? this.levels.restartLevel();
    if (current) this.playLevel(current.id);
  }

  private nextLevel(): void {
    if (!this.level) return;
    if (this.levels.hasNext(this.level.id)) {
      this.playLevel(this.level.id + 1);
    } else {
      this.toMenu();
    }
  }

  // ---------- 关卡加载 ----------

  private playLevel(id: number): void {
    this.unloadLevel();
    this.setState(GameState.LOADING);
    this.ui.showHud(false);
    this.ui.showLoading();
    window.setTimeout(() => {
      try {
        this.loadLevelIntoWorld(id);
        this.ui.hideAllScreens();
        this.ui.showHud(true);
        this.setState(GameState.AIMING);
        this.refreshHud();
      } catch (e) {
        console.error('关卡加载失败', e);
        this.toMenu();
      }
    }, 120);
  }

  private loadLevelIntoWorld(id: number): void {
    const level = this.levels.loadLevel(id);
    this.level = level;

    this.world = new PhysicsWorld();
    this.collision = new CollisionManager(this.bus);
    this.collision.attach(this.world.engine);
    this.support = new SupportSystem(this.world);
    this.explosion = new ExplosionSystem(this.world, this.bus, this.entityById);
    this.factory = new EntityFactory(this.resolver);

    this.entities.length = 0;
    this.entityById.clear();
    this.targets = [];
    this.projectileQueue = [];
    this.currentProjectile = null;
    this.launcher = null;
    this.particles.clear();
    this.score.reset();
    this.trajectory = [];
    this.settleTimer = 0;
    this.completeTimer = 0;

    this.addEntity(this.factory.createGround(level.world.width, GAME.GROUND_Y));
    for (const b of level.blocks) {
      this.addEntity(this.factory.createBlock(b.material, b.x, b.y, b.width, b.height, b.rotation ?? 0));
    }
    for (const t of level.targets) {
      const target = this.factory.createTarget(t.type, t.x, t.y);
      this.targets.push(target);
      this.addEntity(target);
    }

    this.launcher = new Launcher(level.launcher.x, level.launcher.y);
    this.projectileQueue = [...level.projectiles];
    this.loadNextProjectile();

    // 预热物理，让结构自然沉降稳定（避免开局抖动）
    for (let i = 0; i < 90; i++) this.world.step(GAME.FIXED_TIMESTEP);

    this.camera.snapTo(level.launcher.x + 420, GAME.GROUND_Y - 120);
    this.camera.zoom = 1;
  }

  private unloadLevel(): void {
    if (this.collision && this.world) this.collision.detach(this.world.engine);
    if (this.world) this.world.dispose();
    this.entities.length = 0;
    this.entityById.clear();
    this.targets = [];
    this.projectileQueue = [];
    this.currentProjectile = null;
    this.launcher = null;
    this.level = null;
    this.particles.clear();
    this.trajectory = [];
    this.settleTimer = 0;
    this.completeTimer = 0;
  }

  private addEntity(e: Entity): void {
    this.entities.push(e);
    this.entityById.set(e.id, e);
    this.world.addBody(e.body);
    this.collision.registerEntity(e);
  }

  private loadNextProjectile(): void {
    if (!this.launcher || !this.level) return;
    const charId = this.projectileQueue.shift();
    if (!charId) return;
    const p = this.factory.createProjectile(charId, this.launcher.anchor.x, this.launcher.anchor.y - 16);
    this.currentProjectile = p;
    this.launcher.current = p.body;
    this.addEntity(p);
    this.settleTimer = 0;
    this.completeTimer = 0;
    this.trajectory = [];
    this.camera.snapTo(this.launcher.anchor.x + 420, GAME.GROUND_Y - 120);
    this.setState(GameState.AIMING);
    this.refreshHud();
  }

  private refreshHud(): void {
    if (!this.level) return;
    this.ui.updateHud(this.score.getScore(), this.level.id, this.hudProjectiles());
  }

  private hudProjectiles(): { id: string; used: boolean }[] {
    const list: { id: string; used: boolean }[] = [];
    if (this.currentProjectile && !this.currentProjectile.launched) {
      list.push({ id: this.currentProjectile.config.id, used: false });
    }
    for (const charId of this.projectileQueue) list.push({ id: charId, used: false });
    return list;
  }

  private remainingProjectiles(): number {
    return this.projectileQueue.length + (this.currentProjectile && !this.currentProjectile.launched ? 1 : 0);
  }

  private aliveTargets(): number {
    return this.targets.filter((t) => !t.destroyed).length;
  }

  // ---------- 输入（PointerDragTarget） ----------

  hitTest(wx: number, wy: number): boolean {
    if (this.state !== GameState.AIMING || !this.currentProjectile || this.currentProjectile.launched) return false;
    const pos = this.currentProjectile.body.position;
    const r = this.currentProjectile.radius + 14;
    return Math.hypot(wx - pos.x, wy - pos.y) <= r;
  }

  onDragStart(wx: number, wy: number): void {
    if (!this.currentProjectile || !this.launcher) return;
    this.dragging = true;
    this.audio.unlock();
    this.currentProjectile.body.isStatic = true;
    this.moveProjectileTo(wx, wy);
  }

  onDragMove(wx: number, wy: number): void {
    if (!this.dragging) return;
    this.moveProjectileTo(wx, wy);
  }

  onDragEnd(): void {
    if (!this.dragging) return;
    this.dragging = false;
    if (!this.currentProjectile || !this.launcher) return;
    const pos = this.currentProjectile.body.position;
    const result = computeLaunchVelocity(
      this.launcher.anchor,
      pos,
      this.launchPower,
      this.launcher.maxPullDistance,
      GAME.MAX_LAUNCH_VELOCITY,
      GAME.MIN_LAUNCH_RATIO,
    );
    if (!result) {
      // 力度过小：放回弹弓，不消耗角色
      this.resetProjectileToSling();
      this.trajectory = [];
      return;
    }
    this.launch(result.velocity);
  }

  private moveProjectileTo(wx: number, wy: number): void {
    if (!this.currentProjectile || !this.launcher) return;
    const anchor = this.launcher.anchor;
    let dx = wx - anchor.x;
    let dy = wy - anchor.y;
    const dist = Math.hypot(dx, dy);
    if (dist > this.launcher.maxPullDistance) {
      dx = (dx / dist) * this.launcher.maxPullDistance;
      dy = (dy / dist) * this.launcher.maxPullDistance;
    }
    Matter.Body.setPosition(this.currentProjectile.body, { x: anchor.x + dx, y: anchor.y + dy });
    this.updateTrajectory();
  }

  private updateTrajectory(): void {
    if (!this.currentProjectile || !this.launcher) return;
    const pos = this.currentProjectile.body.position;
    const result = computeLaunchVelocity(
      this.launcher.anchor,
      pos,
      this.launchPower,
      this.launcher.maxPullDistance,
      GAME.MAX_LAUNCH_VELOCITY,
      0,
    );
    if (!result) {
      this.trajectory = [];
      return;
    }
    // Matter 速度单位为"每帧"，轨迹预测按"每秒"计算，需换算（×60）
    const velocityPerSec = { x: result.velocity.x * 60, y: result.velocity.y * 60 };
    this.trajectory = predictTrajectory(pos, velocityPerSec, GAME.PREDICT_GRAVITY, 90, 0.025, GAME.PREDICT_FRICTION_AIR);
  }

  private resetProjectileToSling(): void {
    if (!this.currentProjectile || !this.launcher) return;
    Matter.Body.setPosition(this.currentProjectile.body, {
      x: this.launcher.anchor.x,
      y: this.launcher.anchor.y - 16,
    });
    Matter.Body.setVelocity(this.currentProjectile.body, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(this.currentProjectile.body, 0);
  }

  private launch(velocity: { x: number; y: number }): void {
    const p = this.currentProjectile;
    if (!p || !this.launcher || !this.level) return;
    const body = p.body;
    // 必须用 Body.setStatic 而非直接赋值 isStatic，否则 Matter 内部状态不一致导致穿模
    Matter.Body.setStatic(body, false);
    body.collisionFilter.mask = 0xffff;
    // 等待期间刚体可能被标记为 sleeping，发射时必须唤醒
    Matter.Sleeping.set(body, false);
    Matter.Body.setVelocity(body, velocity);
    Matter.Body.setAngle(body, Math.atan2(velocity.y, velocity.x));
    p.launched = true;
    p.launchedAt = performance.now();
    this.launcher.current = null;
    this.trajectory = [];
    this.audio.play('launch');
    this.bus.emit('PROJECTILE_LAUNCHED', { entityId: p.id, velocity });
    this.setState(GameState.FLYING);
    this.refreshHud();
  }

  // ---------- 飞行 / 结算 ----------

  private handleFlight(dt: number): void {
    const p = this.currentProjectile;
    const bodies = this.world.getBodies();
    const avgSpeed = averageDynamicSpeed(bodies);

    if (p && p.launched && !p.finished) {
      const elapsed = (performance.now() - p.launchedAt) / 1000;
      if (elapsed > GAME.PROJECTILE_TIMEOUT) {
        p.finished = true;
        p.markForRemoval(); // 超时视为已用，移除避免无限滚动阻塞结算
      }
      if (
        p.body.position.x < GAME.BOUNDS.minX ||
        p.body.position.x > GAME.BOUNDS.maxX ||
        p.body.position.y > GAME.BOUNDS.maxY
      ) {
        p.finished = true;
      }
      this.camera.follow(p.body.position.x, p.body.position.y, p.body.velocity.x, p.body.velocity.y, 0.05);
    }

    // 目标全部消灭：进入结算延迟，让建筑继续坍塌并计分
    if (this.aliveTargets() === 0) {
      this.completeTimer += dt * 1000;
      if (this.completeTimer >= GAME.LEVEL_COMPLETE_DELAY_MS) {
        this.completeLevel();
      }
      return;
    }

    if (avgSpeed < GAME.SETTLE_SPEED) {
      this.settleTimer += dt * 1000;
    } else {
      this.settleTimer = 0;
    }

    if (this.settleTimer >= GAME.SETTLE_DURATION_MS) {
      if (p && p.launched && !p.finished) p.finished = true;
      if (this.projectileQueue.length === 0) {
        this.failLevel();
      } else {
        this.loadNextProjectile();
      }
    }
  }

  private completeLevel(): void {
    if (!this.level) return;
    const remaining = this.remainingProjectiles();
    if (remaining > 0) this.score.addBonus(remaining * SCORE.remainingProjectile);
    const score = this.score.getScore();
    const maxScore = ScoreManager.calculateLevelMaxScore(this.level);
    const stars = ScoreManager.calculateStarsByPercent(score, maxScore);
    this.save.recordResult(this.level.id, score, stars);
    this.bus.emit('LEVEL_COMPLETE', { levelId: this.level.id, score, stars });
    this.setState(GameState.LEVEL_COMPLETE);
    this.ui.showHud(false);
    this.ui.showComplete(score, stars, maxScore);
    this.audio.play('levelComplete');
    this.camera.snapTo(this.level.world.width / 2, GAME.GROUND_Y - 120);
  }

  private failLevel(): void {
    if (!this.level) return;
    this.bus.emit('LEVEL_FAILED', { levelId: this.level.id });
    this.setState(GameState.LEVEL_FAILED);
    this.ui.showHud(false);
    this.ui.showFailed();
  }

  // ---------- 清理 ----------

  private cleanupPending(): void {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const e = this.entities[i];
      if (!e.pendingRemoval) continue;
      this.world.removeBody(e.body);
      this.collision.unregisterEntity(e.id);
      this.entityById.delete(e.id);
      this.entities.splice(i, 1);
    }
  }

  private cleanupOutOfBounds(): void {
    for (const e of this.entities) {
      if (e.destroyed || e.type === 'ground') continue;
      const pos = e.body.position;
      if (
        pos.x < GAME.BOUNDS.minX ||
        pos.x > GAME.BOUNDS.maxX ||
        pos.y > GAME.BOUNDS.maxY
      ) {
        if (e.type === 'projectile' && this.currentProjectile === e) {
          (e as Projectile).finished = true;
        }
        e.markForRemoval();
      }
    }
  }

  // ---------- 事件与调试 ----------

  private handleResize = (): void => {
    if (!this.renderer) return;
    const container = document.getElementById('game-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    this.renderer.resize(rect.width, rect.height);
    const hint = document.getElementById('portrait-hint');
    if (hint) {
      hint.classList.toggle(
        'hidden',
        !(window.matchMedia('(orientation: portrait)').matches && window.innerWidth < 900),
      );
    }
  };

  private handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      if (this.state === GameState.PAUSED) this.resume();
      else if (isPlayableState(this.state)) this.pause();
      return;
    }
    if (e.code === 'Space') {
      e.preventDefault();
      if (this.state === GameState.FLYING) this.triggerAbility();
      return;
    }
    if (!import.meta.env.DEV) return;
    switch (e.key.toLowerCase()) {
      case 'f1':
        e.preventDefault();
        this.debugPanel.toggle();
        break;
      case 'r':
        this.restartLevel();
        break;
      case 'n':
        this.nextLevel();
        break;
      case 'p':
        if (isPlayableState(this.state)) this.pause();
        else if (this.state === GameState.PAUSED) this.resume();
        break;
      case 't':
        this.cycleTimeScale();
        break;
    }
  };

  private handleVisibility = (): void => {
    if (document.hidden && isPlayableState(this.state)) this.pause();
  };

  private cycleTimeScale(): void {
    const s = this.loop.getTimeScale();
    const next = s >= 1 ? 0.25 : s >= 0.5 ? 0.5 : 1;
    this.loop.setTimeScale(next);
  }

  private toggleFullscreen(): void {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    } else {
      void document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  private updateFps(dt: number): void {
    this.frameCount += 1;
    this.fpsTimer += dt;
    if (this.fpsTimer >= 0.5) {
      this.fps = this.frameCount / this.fpsTimer;
      this.frameCount = 0;
      this.fpsTimer = 0;
    }
  }

  private registerAbilities(): void {
    this.abilities.register({ id: 'basic', trigger: () => { /* 无特殊能力 */ } });
    this.abilities.register(new SpeedAbility());
    this.abilities.register(new SplitAbility());
    this.abilities.register(new ExplosiveAbility());
    this.abilities.register(new WhiteAbility());
  }

  /** 飞行中触发当前角色能力（每只一次） */
  private triggerAbility(): void {
    const p = this.currentProjectile;
    if (!p || !p.launched || p.abilityUsed) return;
    if (this.state !== GameState.FLYING) return;
    const ability = this.abilities.get(p.config.ability);
    if (!ability) return;
    p.abilityUsed = true;
    ability.trigger(this.abilityContext(p));
  }

  private abilityContext(p: Projectile): AbilityContext {
    return {
      projectile: p,
      world: this.world,
      bus: this.bus,
      particles: this.particles,
      audio: this.audio,
      explosion: this.explosion,
      spawnProjectile: (config, x, y, velocity) => this.spawnDynamicProjectile(config, x, y, velocity),
      removeProjectile: (proj) => this.removeFlyingProjectile(proj),
    };
  }

  private spawnDynamicProjectile(
    config: CharacterConfig,
    x: number,
    y: number,
    velocity: { x: number; y: number },
  ): Projectile {
    const p = this.factory.createDynamicProjectile(config, x, y, velocity);
    this.addEntity(p);
    return p;
  }

  private removeFlyingProjectile(p: Projectile): void {
    p.finished = true;
    p.markForRemoval();
  }

  private debugHooks(): DebugHooks {
    return {
      getFps: () => this.fps,
      getBodyCount: () => (this.world ? this.world.getBodies().length : 0),
      getParticleCount: () => this.particles.getCount(),
      getState: () => this.state,
      setGravityY: (v) => {
        if (this.world) this.world.engine.gravity.y = v;
      },
      setLaunchPower: (v) => {
        this.launchPower = v;
      },
      setTimeScale: (v) => this.loop.setTimeScale(v),
      setDamageMultiplier: (v) => {
        PHYSICS.damageMultiplier = v;
      },
      setZoom: (v) => {
        this.camera.zoom = v;
        this.camera.resize(GAME.VIEW_WIDTH, GAME.VIEW_HEIGHT);
      },
    };
  }
}
