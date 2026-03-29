import type { InputState } from '../../input/actions';
import { stageBounds } from '../../content/encounters/theStrip';
import {
  clampToStage,
  createEnemyState,
  type EnemyState,
  type EncounterRuntime,
  type Facing,
  type FrameEvent,
  type GameState,
} from '../state';

const PLAYER_BASE_SPEED = 226;
const PLAYER_DODGE_SPEED = 364;
const LANE_SPEED_MOD = 0.8;
const COMBO_TIMEOUT = 1.45;

interface AttackProfile {
  damage: number;
  rangeX: number;
  rangeY: number;
  knockback: number;
  cooldown: number;
  hypeGain: number;
}

const lightAttack: AttackProfile = {
  damage: 12,
  rangeX: 82,
  rangeY: 60,
  knockback: 46,
  cooldown: 0.22,
  hypeGain: 8,
};

const heavyAttack: AttackProfile = {
  damage: 22,
  rangeX: 104,
  rangeY: 66,
  knockback: 72,
  cooldown: 0.38,
  hypeGain: 12,
};

const jumpAttack: AttackProfile = {
  damage: 16,
  rangeX: 88,
  rangeY: 74,
  knockback: 60,
  cooldown: 0.48,
  hypeGain: 10,
};

const setMessage = (state: GameState, message: string, timer = 2.6) => {
  state.message = message;
  state.messageTimer = timer;
};

const pushEvent = (state: GameState, event: FrameEvent) => {
  state.frameEvents.push(event);
};

const getFacing = (value: number, fallback: Facing): Facing => {
  if (value > 0.01) {
    return 1;
  }

  if (value < -0.01) {
    return -1;
  }

  return fallback;
};

const removeComboIfExpired = (state: GameState, deltaSeconds: number) => {
  state.player.comboTimer = Math.max(0, state.player.comboTimer - deltaSeconds);
  if (state.player.comboTimer === 0) {
    state.player.combo = 0;
  }
};

const getLiveEncounterEnemies = (state: GameState, encounter: EncounterRuntime) =>
  state.enemies.filter((enemy) => enemy.alive && enemy.encounterId === encounter.def.id);

const spawnEncounter = (state: GameState, encounterIndex: number) => {
  const encounter = state.encounters[encounterIndex];
  if (encounter.spawned) {
    return;
  }

  encounter.spawned = true;
  state.activeEncounterIndex = encounterIndex;
  state.currentObjective = encounter.def.objective;
  state.cameraLock = {
    left: encounter.def.xStart - 100,
    right: encounter.def.xEnd + 100,
  };
  state.enemies.push(
    ...encounter.def.enemies.map((spawn) =>
      createEnemyState(encounter.def.id, spawn.id, spawn.kind, spawn.x, spawn.y),
    ),
  );
  setMessage(state, `${encounter.def.title}: ${encounter.def.objective}`, 3.4);
};

const applyDamageToEnemy = (
  state: GameState,
  enemy: EnemyState,
  damage: number,
  knockback: number,
  sourceFacing: Facing,
) => {
  enemy.hp = Math.max(0, enemy.hp - damage);
  enemy.stunTimer = 0.22;
  enemy.hitFlashTimer = 0.14;
  enemy.x += knockback * sourceFacing;
  pushEvent(state, { type: 'enemy-hit', enemyId: enemy.id, damage, x: enemy.x, y: enemy.y - 48 });

  state.player.combo += 1;
  state.player.comboTimer = COMBO_TIMEOUT;
  state.player.hype = Math.min(state.player.maxHype, state.player.hype + 10);
  state.score += damage * 8;

  if (enemy.hp === 0) {
    enemy.alive = false;
    state.player.hype = Math.min(state.player.maxHype, state.player.hype + 8);
    state.score += enemy.scoreValue;
    pushEvent(state, { type: 'enemy-defeated', enemyId: enemy.id, x: enemy.x, y: enemy.y - 52 });
  }
};

const tryPlayerAttack = (state: GameState, profile: AttackProfile) => {
  const { player } = state;
  const attackOriginX = player.x + player.facing * 48;
  const candidates = state.enemies.filter((enemy) => {
    if (!enemy.alive) {
      return false;
    }

    const deltaX = enemy.x - attackOriginX;
    const sameSide = player.facing === 1 ? deltaX >= -12 : deltaX <= 12;

    return sameSide && Math.abs(deltaX) <= profile.rangeX && Math.abs(enemy.y - player.y) <= profile.rangeY;
  });

  if (candidates.length === 0) {
    player.attackCooldown = Math.max(player.attackCooldown, profile.cooldown * 0.8);
    return;
  }

  player.attackCooldown = profile.cooldown;
  player.hype = Math.min(player.maxHype, player.hype + profile.hypeGain);

  for (const enemy of candidates) {
    applyDamageToEnemy(state, enemy, profile.damage, profile.knockback, player.facing);
  }
};

const trySpecial = (state: GameState) => {
  const { player } = state;
  if (player.hype < 40) {
    setMessage(state, 'Need more Hype for Crowd Surge.', 1.3);
    return;
  }

  player.hype = Math.max(0, player.hype - 40);
  player.specialCooldown = 0.9;
  state.score += 250;

  for (const enemy of state.enemies) {
    if (!enemy.alive) {
      continue;
    }

    if (Math.abs(enemy.x - player.x) <= 160 && Math.abs(enemy.y - player.y) <= 120) {
      applyDamageToEnemy(state, enemy, 28, 96, player.facing);
    }
  }

  pushEvent(state, { type: 'special', x: player.x, y: player.y });
  setMessage(state, 'Crowd Surge! The block pushes back.', 1.5);
};

const maybeCollectPickups = (state: GameState) => {
  for (const pickup of state.pickups) {
    if (pickup.collected) {
      continue;
    }

    if (Math.abs(pickup.x - state.player.x) <= 44 && Math.abs(pickup.y - state.player.y) <= 56) {
      pickup.collected = true;
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + pickup.value);
      pushEvent(state, { type: 'pickup', x: pickup.x, y: pickup.y - 24, value: pickup.value });
      setMessage(state, 'Street food and aspirin. Back in it.', 1.5);
    }
  }
};

const clampPlayerToEncounter = (state: GameState) => {
  if (!state.cameraLock) {
    return;
  }

  const left = state.cameraLock.left + 42;
  const right = state.cameraLock.right - 42;
  state.player.x = Math.max(left, Math.min(right, state.player.x));
};

const updatePlayer = (state: GameState, input: InputState, deltaSeconds: number) => {
  const { player } = state;
  player.attackCooldown = Math.max(0, player.attackCooldown - deltaSeconds);
  player.dodgeCooldown = Math.max(0, player.dodgeCooldown - deltaSeconds);
  player.dodgeTimer = Math.max(0, player.dodgeTimer - deltaSeconds);
  player.specialCooldown = Math.max(0, player.specialCooldown - deltaSeconds);
  player.invulnerableTimer = Math.max(0, player.invulnerableTimer - deltaSeconds);
  player.hitFlashTimer = Math.max(0, player.hitFlashTimer - deltaSeconds);

  const moveLength = Math.hypot(input.moveX, input.moveY) || 1;
  const moveX = input.moveX / moveLength;
  const moveY = input.moveY / moveLength;
  const moveFacing = getFacing(input.moveX, player.facing);
  player.facing = moveFacing;

  if (input.dodgePressed && player.dodgeCooldown === 0) {
    player.dodgeTimer = 0.2;
    player.dodgeCooldown = 0.7;
    player.invulnerableTimer = 0.28;
  }

  const speed = player.dodgeTimer > 0 ? PLAYER_DODGE_SPEED : PLAYER_BASE_SPEED;
  player.x += moveX * speed * deltaSeconds;
  player.y += moveY * speed * LANE_SPEED_MOD * deltaSeconds;

  if (input.lightPressed && player.attackCooldown === 0) {
    tryPlayerAttack(state, lightAttack);
  }

  if (input.heavyPressed && player.attackCooldown === 0) {
    tryPlayerAttack(state, heavyAttack);
  }

  if (input.jumpPressed && player.attackCooldown === 0) {
    tryPlayerAttack(state, jumpAttack);
  }

  if (input.specialPressed && player.specialCooldown === 0) {
    trySpecial(state);
  }

  const clamped = clampToStage(state.player.x, state.player.y);
  state.player.x = clamped.x;
  state.player.y = clamped.y;
  clampPlayerToEncounter(state);
};

const updateEnemy = (state: GameState, enemy: EnemyState, deltaSeconds: number) => {
  enemy.attackCooldown = Math.max(0, enemy.attackCooldown - deltaSeconds);
  enemy.stunTimer = Math.max(0, enemy.stunTimer - deltaSeconds);
  enemy.hitFlashTimer = Math.max(0, enemy.hitFlashTimer - deltaSeconds);

  if (!enemy.alive || enemy.stunTimer > 0) {
    return;
  }

  const deltaX = state.player.x - enemy.x;
  const deltaY = state.player.y - enemy.y;
  enemy.facing = getFacing(deltaX, enemy.facing);

  const desiredX = enemy.kind === 'chain' ? enemy.attackRange - 18 : enemy.attackRange - 8;
  if (Math.abs(deltaX) > desiredX) {
    enemy.x += Math.sign(deltaX) * enemy.speed * deltaSeconds;
  }

  if (Math.abs(deltaY) > 14) {
    enemy.y += Math.sign(deltaY) * enemy.speed * 0.7 * deltaSeconds;
  }

  if (
    enemy.attackCooldown === 0 &&
    Math.abs(deltaX) <= enemy.attackRange &&
    Math.abs(deltaY) <= 56 &&
    state.player.invulnerableTimer === 0
  ) {
    state.player.hp = Math.max(0, state.player.hp - enemy.damage);
    state.player.invulnerableTimer = 0.62;
    state.player.hitFlashTimer = 0.16;
    state.player.combo = 0;
    state.player.comboTimer = 0;
    state.player.hype = Math.max(0, state.player.hype - 6);
    state.damageTaken += enemy.damage;
    enemy.attackCooldown = enemy.kind === 'boss' ? 0.9 : 0.75;
    pushEvent(state, { type: 'player-hit', damage: enemy.damage });
    setMessage(state, `${enemy.kind === 'boss' ? 'Promoter' : 'Enforcer'} lands a shot.`, 0.8);
  }

  enemy.x = Math.max(stageBounds.minX, Math.min(stageBounds.maxX, enemy.x));
  enemy.y = Math.max(stageBounds.minY, Math.min(stageBounds.maxY, enemy.y));
};

const maybeStartEncounter = (state: GameState) => {
  for (let index = 0; index < state.encounters.length; index += 1) {
    const encounter = state.encounters[index];
    if (encounter.cleared) {
      continue;
    }

    if (!encounter.spawned && state.player.x >= encounter.def.xStart - 120) {
      spawnEncounter(state, index);
      return;
    }

    if (encounter.spawned) {
      state.currentObjective = encounter.def.objective;
      return;
    }
  }
}

const computeRank = (state: GameState) => {
  const timeBonus = Math.max(0, 240 - state.totalTime);
  const ratingScore = state.score + timeBonus * 12 + state.player.hp * 15 - state.damageTaken * 4;

  if (ratingScore >= 7200) {
    return 'S';
  }

  if (ratingScore >= 5600) {
    return 'A';
  }

  if (ratingScore >= 4200) {
    return 'B';
  }

  return 'C';
};

const maybeResolveEncounter = (state: GameState) => {
  for (let index = 0; index < state.encounters.length; index += 1) {
    const encounter = state.encounters[index];
    if (!encounter.spawned || encounter.cleared) {
      continue;
    }

    const liveEnemies = getLiveEncounterEnemies(state, encounter);
    state.activeEncounterIndex = index;
    state.cameraLock = {
      left: encounter.def.xStart - 100,
      right: encounter.def.xEnd + 100,
    };

    if (liveEnemies.length > 0) {
      return;
    }

    encounter.cleared = true;
    state.activeEncounterIndex = null;
    state.cameraLock = null;
    state.score += 650;
    pushEvent(state, { type: 'wave-clear', title: encounter.def.title });

    if (encounter.def.dropFood) {
      state.pickups.push({
        id: `${encounter.def.id}-food`,
        kind: 'food',
        x: encounter.def.xEnd - 90,
        y: 360,
        value: 24,
        collected: false,
      });
    }

    const remaining = state.encounters.some((nextEncounter) => !nextEncounter.cleared);
    if (remaining) {
      setMessage(state, `${encounter.def.title} cleared. Push to the next block.`, 2.6);
      state.currentObjective = 'Move east to trigger the next block.';
      return;
    }

    state.phase = 'victory';
    state.rank = computeRank(state);
    state.currentObjective = 'Venue reclaimed.';
    state.cameraLock = null;
    setMessage(state, 'Venue reclaimed. The block is ours tonight.', 6);
    pushEvent(state, { type: 'victory' });
    return;
  }

  state.activeEncounterIndex = null;
  state.cameraLock = null;
  state.currentObjective = 'Push east to start the next encounter.';
};

export const updateWorld = (state: GameState, input: InputState, deltaSeconds: number) => {
  const dt = Math.min(deltaSeconds, 1 / 20);
  state.frameEvents = [];
  state.totalTime += dt;

  if (state.messageTimer > 0) {
    state.messageTimer = Math.max(0, state.messageTimer - dt);
    if (state.messageTimer === 0 && state.phase === 'playing') {
      state.message = '';
    }
  }

  removeComboIfExpired(state, dt);

  if (state.phase === 'victory' || state.phase === 'defeat') {
    return;
  }

  maybeStartEncounter(state);
  updatePlayer(state, input, dt);
  maybeCollectPickups(state);

  for (const enemy of state.enemies) {
    updateEnemy(state, enemy, dt);
  }

  maybeResolveEncounter(state);

  if (state.player.hp === 0) {
    state.phase = 'defeat';
    state.rank = computeRank(state);
    setMessage(state, 'The block folds. Regroup and hit it again.', 6);
    pushEvent(state, { type: 'defeat' });
  }
};
