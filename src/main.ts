import './style.css';
import { Game } from './core/Game';

const canvas = document.getElementById('game-canvas');
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('缺少 #game-canvas 元素');
}

const game = new Game(canvas);
if (import.meta.env.DEV) {
  // 开发调试：暴露实例便于 Playwright/控制台检查状态
  (window as unknown as { __game?: Game }).__game = game;
}
void game.init();
