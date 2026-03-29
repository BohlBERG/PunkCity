import Phaser from 'phaser';
import { stageBounds, theStripEncounters } from '../../game/content/encounters/theStrip';
import type { InputState } from '../../game/input/actions';
import type { EnemyState, GameState, PickupState } from '../../game/simulation/state';
import { SceneBridge } from '../adapters/sceneBridge';
import { createHud, type HudController } from '../../ui/hud/renderHud';

type KeyMap = Record<
  'left' | 'right' | 'up' | 'down' | 'light' | 'heavy' | 'special' | 'jump' | 'dodge' | 'interact' | 'enter' | 'esc',
  Phaser.Input.Keyboard.Key
>;

interface FighterView {
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Rectangle;
  accent: Phaser.GameObjects.Rectangle;
  shadow: Phaser.GameObjects.Ellipse;
}

export class BattleScene extends Phaser.Scene {
  private bridge!: SceneBridge;
  private hud!: HudController;
  private keys!: KeyMap;
  private playerView!: FighterView;
  private enemyViews = new Map<string, FighterView>();
  private pickupViews = new Map<string, Phaser.GameObjects.Container>();

  constructor() {
    super('battle');
  }

  public create() {
    const hudRoot = document.getElementById('hud-root');
    if (!hudRoot) {
      throw new Error('Missing #hud-root mount');
    }

    this.bridge = new SceneBridge();
    this.hud = createHud(hudRoot);
    this.hud.setVisible(true);

    const keyBundle = this.input.keyboard?.addKeys({
      left: 'A',
      right: 'D',
      up: 'W',
      down: 'S',
      light: 'J',
      heavy: 'K',
      special: 'L',
      jump: 'SPACE',
      dodge: 'SHIFT',
      interact: 'E',
      enter: 'ENTER',
      esc: 'ESC',
    });

    if (!keyBundle) {
      throw new Error('Keyboard input unavailable');
    }

    this.keys = keyBundle as KeyMap;

    this.buildBackdrop();
    this.playerView = this.createFighterView(true, 0xf5efe7, 0xff6b35, 1);

    this.cameras.main.setBounds(stageBounds.minX - 120, 0, stageBounds.maxX - stageBounds.minX + 240, 720);
    this.cameras.main.startFollow(this.playerView.container, false, 0.09, 0.09, -160, 0);
    this.cameras.main.setBackgroundColor('#140f16');

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.hud.destroy();
      this.enemyViews.clear();
      this.pickupViews.clear();
    });
  }

  public update(_time: number, delta: number) {
    if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
      this.scene.start('menu');
      return;
    }

    const input = this.buildInputState();
    const state = this.bridge.step(input, delta);

    if (
      (state.phase === 'victory' || state.phase === 'defeat') &&
      Phaser.Input.Keyboard.JustDown(this.keys.enter)
    ) {
      this.scene.restart();
      return;
    }

    this.syncScene(state);
    this.hud.update(state);
    this.playFrameEvents(state.frameEvents);
  }

  private buildInputState(): InputState {
    const moveX = Number(this.keys.right.isDown) - Number(this.keys.left.isDown);
    const moveY = Number(this.keys.down.isDown) - Number(this.keys.up.isDown);

    return {
      moveX,
      moveY,
      lightPressed: Phaser.Input.Keyboard.JustDown(this.keys.light),
      heavyPressed: Phaser.Input.Keyboard.JustDown(this.keys.heavy),
      specialPressed: Phaser.Input.Keyboard.JustDown(this.keys.special),
      jumpPressed: Phaser.Input.Keyboard.JustDown(this.keys.jump),
      dodgePressed: Phaser.Input.Keyboard.JustDown(this.keys.dodge),
      interactPressed: Phaser.Input.Keyboard.JustDown(this.keys.interact),
    };
  }

  private syncScene(state: GameState) {
    this.playerView.container.setPosition(state.player.x, state.player.y);
    this.playerView.container.setScale(state.player.facing, 1);
    this.playerView.container.setDepth(state.player.y);
    this.playerView.body.setFillStyle(state.player.hitFlashTimer > 0 ? 0xfff1c1 : 0xf5efe7);
    this.playerView.accent.setFillStyle(state.player.hitFlashTimer > 0 ? 0xf94144 : 0xff6b35);
    this.playerView.shadow.setAlpha(state.player.dodgeTimer > 0 ? 0.16 : 0.32);

    for (const enemy of state.enemies) {
      this.syncEnemy(enemy);
    }

    for (const pickup of state.pickups) {
      this.syncPickup(pickup);
    }

    if (state.cameraLock) {
      this.cameras.main.setBounds(
        state.cameraLock.left,
        0,
        Math.max(1280, state.cameraLock.right - state.cameraLock.left),
        720,
      );
    } else {
      this.cameras.main.setBounds(stageBounds.minX - 120, 0, stageBounds.maxX - stageBounds.minX + 240, 720);
    }
  }

  private syncEnemy(enemy: EnemyState) {
    let view = this.enemyViews.get(enemy.id);
    if (!view) {
      const palette = this.getEnemyPalette(enemy.kind);
      view = this.createFighterView(false, palette.body, palette.accent, enemy.kind === 'boss' ? 1.4 : 1);
      this.enemyViews.set(enemy.id, view);
    }

    view.container.setPosition(enemy.x, enemy.y);
    view.container.setScale(enemy.facing, 1);
    view.container.setDepth(enemy.y);
    view.container.setAlpha(enemy.alive ? 1 : 0.24);
    view.body.setFillStyle(enemy.hitFlashTimer > 0 ? 0xf5efe7 : this.getEnemyPalette(enemy.kind).body);
    view.accent.setFillStyle(enemy.hitFlashTimer > 0 ? 0xff6b35 : this.getEnemyPalette(enemy.kind).accent);
  }

  private syncPickup(pickup: PickupState) {
    let view = this.pickupViews.get(pickup.id);
    if (!view) {
      const shadow = this.add.ellipse(0, 20, 34, 14, 0x000000, 0.3);
      const body = this.add.rectangle(0, 0, 34, 18, 0xe9c46a).setStrokeStyle(2, 0x140f16, 0.9);
      const garnish = this.add.rectangle(0, -6, 24, 8, 0xf94144);
      const label = this.add.text(0, -34, 'FOOD', {
        fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
        fontSize: '16px',
        color: '#f5efe7',
      }).setOrigin(0.5);

      view = this.add.container(0, 0, [shadow, body, garnish, label]);
      this.pickupViews.set(pickup.id, view);
    }

    view.setPosition(pickup.x, pickup.y);
    view.setDepth(pickup.y);
    view.setVisible(!pickup.collected);
  }

  private playFrameEvents(events: GameState['frameEvents']) {
    for (const event of events) {
      if (event.type === 'enemy-hit') {
        this.spawnFloatingText(event.x, event.y, `-${event.damage}`, '#f5efe7');
      }

      if (event.type === 'enemy-defeated') {
        this.spawnFloatingText(event.x, event.y, 'DOWN', '#ff6b35');
      }

      if (event.type === 'player-hit') {
        this.cameras.main.shake(90, 0.003);
      }

      if (event.type === 'special') {
        const burst = this.add.circle(event.x, event.y - 12, 18, 0xe9c46a, 0.6).setDepth(event.y + 200);
        this.tweens.add({
          targets: burst,
          radius: 170,
          alpha: 0,
          duration: 240,
          onComplete: () => burst.destroy(),
        });
      }

      if (event.type === 'pickup') {
        this.spawnFloatingText(event.x, event.y, `+${event.value} HP`, '#e9c46a');
      }

      if (event.type === 'wave-clear') {
        this.spawnBanner(event.title.toUpperCase());
      }
    }
  }

  private spawnBanner(text: string) {
    const banner = this.add
      .text(this.cameras.main.midPoint.x, 120, text, {
        fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
        fontSize: '40px',
        color: '#140f16',
        backgroundColor: '#e9c46a',
        padding: { left: 22, right: 22, top: 10, bottom: 10 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2000);

    this.tweens.add({
      targets: banner,
      alpha: 0,
      y: 70,
      duration: 900,
      ease: 'Cubic.easeOut',
      onComplete: () => banner.destroy(),
    });
  }

  private spawnFloatingText(x: number, y: number, text: string, color: string) {
    const label = this.add
      .text(x, y, text, {
        fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
        fontSize: '26px',
        color,
        stroke: '#140f16',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(y + 200);

    this.tweens.add({
      targets: label,
      y: y - 36,
      alpha: 0,
      duration: 420,
      ease: 'Quad.easeOut',
      onComplete: () => label.destroy(),
    });
  }

  private buildBackdrop() {
    const worldHeight = 720;
    const horizonY = 220;
    const laneTop = stageBounds.minY - 42;
    const laneHeight = stageBounds.maxY - stageBounds.minY + 88;

    this.add.rectangle(1600, worldHeight / 2, 4000, worldHeight, 0x120f14);

    for (const encounter of theStripEncounters) {
      const width = encounter.xEnd - encounter.xStart + 260;
      const centerX = (encounter.xStart + encounter.xEnd) / 2;

      this.add.rectangle(centerX, worldHeight / 2, width, worldHeight, encounter.palette.sky, 0.96);
      this.add.rectangle(centerX, horizonY, width, 90, encounter.palette.accent, 0.08);
      this.add.rectangle(centerX, laneTop + laneHeight / 2, width, laneHeight, encounter.palette.ground, 0.92);

      for (let offset = encounter.xStart - 60; offset <= encounter.xEnd + 60; offset += 180) {
        const buildingHeight = 100 + ((offset / 5) % 4) * 24;
        this.add.rectangle(offset, 170, 90, buildingHeight, 0x0a090d, 0.84).setOrigin(0.5, 1);
        this.add.rectangle(offset, 188, 62, 4, encounter.palette.accent, 0.3).setOrigin(0.5, 1);
      }

      this.add
        .text(centerX, 142, encounter.backgroundLabel, {
          fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
          fontSize: '34px',
          color: '#f5efe7',
          backgroundColor: '#140f16',
          padding: { left: 12, right: 12, top: 8, bottom: 8 },
        })
        .setOrigin(0.5)
        .setRotation(-0.03);
    }

    for (let x = stageBounds.minX - 80; x <= stageBounds.maxX + 200; x += 110) {
      this.add.rectangle(x, stageBounds.maxY + 18, 70, 4, 0x5f4b57, 0.36);
    }

    this.add.rectangle(1600, 563, 4000, 160, 0x08070b, 0.9);
    this.add.rectangle(1600, 545, 4000, 14, 0xf5efe7, 0.08);
  }

  private createFighterView(isPlayer: boolean, bodyColor: number, accentColor: number, scale: number): FighterView {
    const shadow = this.add.ellipse(0, 28, 54 * scale, 18 * scale, 0x000000, 0.32);
    const body = this.add.rectangle(0, -4 * scale, 34 * scale, 62 * scale, bodyColor).setStrokeStyle(2, 0x140f16, 0.9);
    const accent = this.add.rectangle(0, -10 * scale, 16 * scale, 28 * scale, accentColor);
    const head = this.add.circle(0, -52 * scale, 15 * scale, 0xf0c7a7).setStrokeStyle(2, 0x140f16, 0.9);
    const mohawk = this.add.triangle(0, -71 * scale, -6 * scale, 0, 0, -18 * scale, 6 * scale, 0, accentColor);
    const armLeft = this.add.rectangle(-18 * scale, -10 * scale, 8 * scale, 34 * scale, bodyColor).setAngle(12);
    const armRight = this.add.rectangle(18 * scale, -2 * scale, 8 * scale, 34 * scale, bodyColor).setAngle(-14);

    const container = this.add.container(0, 0, [shadow, armLeft, armRight, body, accent, head, mohawk]);
    if (isPlayer) {
      container.setDepth(800);
    }

    return { container, body, accent, shadow };
  }

  private getEnemyPalette(kind: EnemyState['kind']) {
    if (kind === 'runner') {
      return { body: 0x90be6d, accent: 0x1d3557 };
    }

    if (kind === 'bouncer') {
      return { body: 0x577590, accent: 0xf94144 };
    }

    if (kind === 'boss') {
      return { body: 0xf94144, accent: 0xe9c46a };
    }

    return { body: 0x6d597a, accent: 0xf4a261 };
  }
}
