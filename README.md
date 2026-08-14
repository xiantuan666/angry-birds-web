# Slingshot · 愤怒的小鸟网页复刻

网页版 2D 弹射物理益智游戏，高度还原经典弹射玩法：**选择角色 → 放入弹弓 → 拖动瞄准 → 松手发射 → 抛物线飞行 → 碰撞建筑 → 建筑坍塌 → 击倒目标 → 连锁反应 → 计分 → 使用下一只角色 → 完成关卡**。

- 技术栈：**TypeScript + Vite + HTML5 + CSS3 + Canvas 2D + Matter.js + Web Audio API + LocalStorage**
- 不依赖 React，游戏世界全部由 Canvas 渲染，DOM 只负责菜单/HUD/弹窗
- 数据驱动：角色、目标、材质、关卡全部集中在配置文件，新增内容不改核心逻辑
- 素材可替换：通过 `src/config/customAssets.ts` 覆盖默认素材，无需修改游戏代码

## 快速开始

```bash
pnpm install        # 安装依赖（store 位于 D 盘，见 .npmrc）
pnpm dev            # 开发服务器，默认 http://localhost:5173
pnpm build          # 类型检查 + 生产构建（输出 dist/）
pnpm test           # vitest 单元测试
pnpm preview        # 本地预览构建产物
```

> 需要 Node.js（本项目使用内置 Node v24 / pnpm 11）。

## 本轮已实现

- 完整状态机：MENU / LEVEL_SELECT / LOADING / AIMING / LAUNCHING / FLYING / SETTLING / NEXT_PROJECTILE / LEVEL_COMPLETE / LEVEL_FAILED / PAUSED
- 真实物理（Matter.js）：固定时间步长、睡眠机制、碰撞分类、越界清理、稳定检测
- 拖拽发射：Pointer Events（鼠标/触摸/触控笔）、拉弓限位、弹射公式、瞄准轨迹（含空气阻力预测）、低速放回不消耗
- 碰撞伤害与破坏：伤害 = 冲击速度 × 攻击者质量 × 材质倍率，低速接触无伤害；目标死亡流程；连锁坍塌由物理自然产生
- 角色队列与结算：按关卡顺序使用角色、剩余角色奖励、连击、星级（每关阈值）、失败/通关界面
- 存档：LocalStorage（key `game_save`）保存解锁关卡 / 最高分 / 星级 / 音量设置，通关解锁下一关
- UI：主菜单、关卡选择（★/🔒）、HUD、暂停（ESC）、设置（主音量/音乐/音效）、全屏、竖屏提示
- 粒子与反馈：木屑/石屑/玻璃碎片/尘土、碰撞闪光、按力度分级的镜头震动、分数飘字、星级弹出动画
- 音频：Web Audio 音效 + 循环背景音乐，首次点击自动解锁 AudioContext，音量分级，碰撞音效节流
- Debug（仅开发环境，按 F1）：FPS/刚体数/粒子数/状态、实时调节重力/发射力度/时间缩放/伤害倍率/镜头缩放；快捷键 R 重开、N 下一关、P 暂停、T 慢动作

## 目录结构

```
project/
├── index.html / package.json / tsconfig.json / vite.config.ts / README.md
├── public/assets/          # 素材（图片/音频）
│   ├── birds/ pigs/ blocks/ launcher/ background/ effects/ ui/ audio/ custom/
└── src/
    ├── main.ts
    ├── config/             # 数据驱动：assets / customAssets / physics / game / score / characters
    ├── core/               # Game / GameLoop / GameState / EventBus
    ├── physics/            # PhysicsWorld / CollisionManager / DamageSystem / DestructionSystem / ExplosionSystem
    ├── entities/           # Entity / Projectile / Target / Block / Launcher / Ground / EntityFactory
    ├── abilities/          # Ability 接口 + 注册表（本轮仅 basic 可用）
    ├── rendering/          # Renderer（背景/弹弓/实体/粒子/轨迹）
    ├── camera/ input/ particles/ audio/
    ├── levels/             # Level 类型 / LevelManager / level01
    ├── score/ save/ ui/ debug/
    └── style.css
tests/                      # vitest 单元测试
screenshots/                # Playwright 冒烟测试截图
```

## 素材说明

**素材来源与版权免责声明**：本项目按你的要求使用了第三方素材（原版愤怒的小鸟风格），来源包括
GitHub 上的开源学习项目（`ronelian/Angry-Birds`、`ChavezJuanC/Angry-Birds-Clone-Unity`、`fathimanabeela/angrybirds2`）。
这些素材的版权归原作者所有，本项目不声明任何所有权，仅供学习交流；请勿用于商业发行。
缺失/合成的音效与背景音乐为程序原创生成（无版权问题）。

- 角色/目标/方块图片：`public/assets/birds|pigs|blocks/`
- 弹弓/背景/特效/UI：`public/assets/launcher|background|effects|ui/`（当前为占位图，可自行替换）
- 音效与音乐：`public/assets/audio/`（launch/collision/break-wood/break-stone/break-glass/target-hit/target-death/level-complete/button/music）
- 素材加载失败时**不会崩溃**：控制台输出错误并使用 Canvas 绘制的占位图/静默。

### 如何替换鸟 / 目标 / 方块 / 音乐 / 音效

1. 将你的图片/音频放入 `public/assets/custom/`（或直接覆盖默认文件）。
2. 在 `src/config/customAssets.ts` 中配置覆盖项，例如：

```typescript
export const CUSTOM_ASSETS = {
  birds: { red: '/assets/custom/my-red.png', yellow: '/assets/custom/my-yellow.png' },
  pigs: { basic: '/assets/custom/my-pig.png' },
  blocks: { wood: '/assets/custom/my-wood.png' },
  background: { sky: '/assets/custom/my-sky.png' },
  audio: { music: '/assets/custom/my-music.mp3', launch: '/assets/custom/my-launch.wav' },
};
```

3. 重新运行 `pnpm dev` 即可。**只替换图片不会改变物理、速度、碰撞、能力或计分**（素材只是皮肤）。

### 如何新增角色

在 `src/config/characters.ts` 的 `CHARACTERS` 中增加一条配置：

```typescript
myCharacter: {
  id: 'myCharacter', name: '我的角色', sprite: '/assets/custom/my-bird.png',
  radius: 25, mass: 1, density: 0.002, friction: 0.5, restitution: 0.35,
  launchPower: 20, ability: 'basic',
},
```

然后在关卡 `projectiles` 中引用 `"myCharacter"` 即可，无需修改核心代码。

### 如何创建关卡

在 `src/levels/` 新建 `levelXX.ts`，按 `LevelConfig` 结构编写数据
（launcher/projectiles/targets/blocks/starThresholds），再到 `src/levels/LevelManager.ts` 的 `LEVELS` 中注册：

```typescript
import { level02 } from './level02';
const LEVELS = { 1: level01, 2: level02 };
```

### 如何修改物理参数

所有物理参数集中在 `src/config/physics.ts`（重力、材质密度/摩擦/弹性/生命/分数、伤害倍率、最低冲击速度）
与 `src/config/game.ts`（发射力度、最大拉弓距离、速度上限、稳定阈值、结算延迟等）。修改后热更新即可。

## Debug

开发模式下（`pnpm dev`）：

- `F1` 打开/关闭调试面板：FPS、刚体数、粒子数、状态，以及重力/发射力度/时间缩放/伤害倍率/镜头缩放实时调节
- `R` 重新开始当前关卡 · `N` 下一关 · `P` 暂停 · `T` 慢动作循环（0.25 / 0.5 / 1）
- 生产构建（`pnpm build`）自动关闭调试快捷键

## 已知限制（下一轮计划）

- 特殊能力（加速/分裂/爆炸/重型）本轮仅保留数据与占位，下一轮实现
- 关卡 2/3 数据与 JSON 清单加载下一轮
- 音乐为程序原创合成循环；部分装饰性素材（弹弓/背景/特效/logo）为占位图，可替换
- 移动端横屏适配已做提示；如需更强适配可在后续迭代完善

## 测试

```bash
pnpm test    # 伤害公式 / 轨迹预测 / 弹射公式 / 计分连击 / 存档 / 关卡数据 / 音频增益
pnpm build   # 严格类型检查（tsc --noEmit）+ 生产构建，必须零错误
```

Playwright 冒烟测试（截图见 `screenshots/`）验证：加载 → 主菜单 → 进入关卡 → 拖拽发射 → 飞行 → 碰撞 → 稳定 → 下一只/结算，全程无控制台错误。
