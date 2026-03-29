import type { GameState } from '../../game/simulation/state';

export interface HudController {
  destroy(): void;
  setVisible(visible: boolean): void;
  update(state: GameState): void;
}

export const createHud = (root: HTMLElement): HudController => {
  root.innerHTML = `
    <div class="hud-shell is-hidden">
      <div class="hud-row hud-row-top">
        <section class="hud-card hud-player-card">
          <div class="hud-label">Crew</div>
          <div class="hud-name">Riot</div>
          <div class="hud-meter">
            <div class="hud-meter-fill health-fill"></div>
          </div>
          <div class="hud-meta">
            <span data-role="health-text">100 / 100 HP</span>
            <span data-role="combo-text">Combo 0</span>
          </div>
        </section>
        <section class="hud-card hud-objective-card">
          <div class="hud-label">Objective</div>
          <div class="hud-objective" data-role="objective-title">Push east.</div>
          <div class="hud-subtext" data-role="objective-subtext">Keep the venue alive.</div>
        </section>
        <section class="hud-card hud-score-card">
          <div class="hud-label">Hype</div>
          <div class="hud-meter hype-meter">
            <div class="hud-meter-fill hype-fill"></div>
          </div>
          <div class="hud-meta hud-meta-split">
            <span data-role="hype-text">0 / 100</span>
            <span data-role="score-text">000000</span>
          </div>
        </section>
      </div>
      <div class="hud-center" data-role="message"></div>
      <div class="hud-row hud-row-bottom">
        <section class="hud-card hud-controls-card">
          <div class="hud-label">Controls</div>
          <div class="hud-controls">Move A/D/W/S  Attack J  Heavy K  Special L  Dodge Shift  Flying Kick Space</div>
        </section>
        <section class="hud-card hud-status-card">
          <div class="hud-label">Run</div>
          <div class="hud-meta hud-meta-split">
            <span data-role="district-text">The Strip</span>
            <span data-role="time-text">00:00</span>
          </div>
        </section>
      </div>
      <div class="hud-overlay" data-role="overlay">
        <div class="hud-overlay-card">
          <div class="hud-overlay-label" data-role="overlay-label">Venue Reclaimed</div>
          <div class="hud-overlay-rank" data-role="overlay-rank">A</div>
          <div class="hud-overlay-stats" data-role="overlay-stats"></div>
          <div class="hud-overlay-hint">Press Enter to run it again or Esc for the marquee.</div>
        </div>
      </div>
    </div>
  `;

  const shell = root.querySelector('.hud-shell') as HTMLElement;
  const healthFill = root.querySelector('.health-fill') as HTMLElement;
  const hypeFill = root.querySelector('.hype-fill') as HTMLElement;
  const healthText = root.querySelector('[data-role="health-text"]') as HTMLElement;
  const comboText = root.querySelector('[data-role="combo-text"]') as HTMLElement;
  const objectiveTitle = root.querySelector('[data-role="objective-title"]') as HTMLElement;
  const objectiveSubtext = root.querySelector('[data-role="objective-subtext"]') as HTMLElement;
  const hypeText = root.querySelector('[data-role="hype-text"]') as HTMLElement;
  const scoreText = root.querySelector('[data-role="score-text"]') as HTMLElement;
  const districtText = root.querySelector('[data-role="district-text"]') as HTMLElement;
  const timeText = root.querySelector('[data-role="time-text"]') as HTMLElement;
  const message = root.querySelector('[data-role="message"]') as HTMLElement;
  const overlay = root.querySelector('[data-role="overlay"]') as HTMLElement;
  const overlayLabel = root.querySelector('[data-role="overlay-label"]') as HTMLElement;
  const overlayRank = root.querySelector('[data-role="overlay-rank"]') as HTMLElement;
  const overlayStats = root.querySelector('[data-role="overlay-stats"]') as HTMLElement;

  const formatTime = (seconds: number) => {
    const total = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(total / 60)
      .toString()
      .padStart(2, '0');
    const remainder = (total % 60).toString().padStart(2, '0');
    return `${minutes}:${remainder}`;
  };

  return {
    destroy() {
      root.innerHTML = '';
    },
    setVisible(visible: boolean) {
      shell.classList.toggle('is-hidden', !visible);
    },
    update(state: GameState) {
      const healthPercent = (state.player.hp / state.player.maxHp) * 100;
      const hypePercent = (state.player.hype / state.player.maxHype) * 100;
      healthFill.style.width = `${healthPercent}%`;
      hypeFill.style.width = `${hypePercent}%`;
      healthText.textContent = `${state.player.hp} / ${state.player.maxHp} HP`;
      comboText.textContent = state.player.combo > 1 ? `Combo ${state.player.combo}` : 'Combo ready';
      objectiveTitle.textContent = state.activeEncounterIndex === null ? 'Advance' : state.encounters[state.activeEncounterIndex].def.title;
      objectiveSubtext.textContent = state.currentObjective;
      hypeText.textContent = `${state.player.hype} / ${state.player.maxHype}`;
      scoreText.textContent = state.score.toString().padStart(6, '0');
      districtText.textContent = state.phase === 'playing' ? 'The Strip Run' : 'After Hours';
      timeText.textContent = formatTime(state.totalTime);
      message.textContent = state.message;
      message.classList.toggle('is-active', state.message.length > 0);

      const showOverlay = state.phase === 'victory' || state.phase === 'defeat';
      overlay.classList.toggle('is-visible', showOverlay);
      if (showOverlay) {
        overlayLabel.textContent = state.phase === 'victory' ? 'Venue Reclaimed' : 'Run Failed';
        overlayRank.textContent = state.rank;
        overlayStats.textContent = `Score ${state.score.toString().padStart(6, '0')}  |  Time ${formatTime(state.totalTime)}  |  HP ${state.player.hp}`;
      }
    },
  };
};
