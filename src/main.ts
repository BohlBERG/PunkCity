import Phaser from 'phaser';
import './style.css';
import { BootScene } from './phaser/scenes/BootScene';
import { MenuScene } from './phaser/scenes/MenuScene';
import { BattleScene } from './phaser/scenes/BattleScene';

const app = document.getElementById('app');

if (!app) {
  throw new Error('Missing #app root');
}

app.innerHTML = `
  <div class="site-shell">
    <header class="site-header">
      <div class="site-kicker">abcollective.punkcity.ai</div>
      <h1 class="site-title">A.B. Collective: Neon Nocturne</h1>
      <p class="site-subtitle">A browser-native 1980s side-scrolling beat 'em up about reclaiming venues, blocks, and neighborhood noise.</p>
    </header>
    <main class="stage-shell">
      <div class="stage-frame">
        <div id="game-root" class="game-root"></div>
        <div id="hud-root" class="hud-root"></div>
      </div>
    </main>
    <footer class="site-footer">
      <span>Phaser + TypeScript + Vite</span>
      <span>Static build ready for Cloudflare Pages</span>
      <span>Keyboard-first vertical slice</span>
    </footer>
  </div>
`;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-root',
  backgroundColor: '#140f16',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, BattleScene],
};

new Phaser.Game(config);
