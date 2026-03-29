import { stageBounds, theStripEncounters, type EnemyKind, type EncounterDefinition } from '../content/encounters/theStrip';

export type Facing = -1 | 1;
export type Phase = 'playing' | 'victory' | 'defeat';
export type PickupKind = 'food';

export interface CameraLock {
  left: number;
  right: number;
}

export interface PlayerState {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  hype: number;
  maxHype: number;
  facing: Facing;
  combo: number;
  comboTimer: number;
  attackCooldown: number;
  dodgeCooldown: number;
  dodgeTimer: number;
  specialCooldown: number;
  invulnerableTimer: number;
  hitFlashTimer: number;
}

export interface EnemyState {
  id: string;
  encounterId: string;
  kind: EnemyKind;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  attackRange: number;
  scoreValue: number;
  facing: Facing;
  alive: boolean;
  attackCooldown: number;
  stunTimer: number;
  hitFlashTimer: number;
}

export interface PickupState {
  id: string;
  kind: PickupKind;
  x: number;
  y: number;
  value: number;
  collected: boolean;
}

export interface EncounterRuntime {
  def: EncounterDefinition;
  spawned: boolean;
  cleared: boolean;
}

export type FrameEvent =
  | { type: 'enemy-hit'; enemyId: string; damage: number; x: number; y: number }
  | { type: 'enemy-defeated'; enemyId: string; x: number; y: number }
  | { type: 'player-hit'; damage: number }
  | { type: 'special'; x: number; y: number }
  | { type: 'pickup'; x: number; y: number; value: number }
  | { type: 'wave-clear'; title: string }
  | { type: 'victory' }
  | { type: 'defeat' };

export interface GameState {
  phase: Phase;
  totalTime: number;
  score: number;
  message: string;
  messageTimer: number;
  currentObjective: string;
  rank: string;
  damageTaken: number;
  player: PlayerState;
  enemies: EnemyState[];
  pickups: PickupState[];
  encounters: EncounterRuntime[];
  activeEncounterIndex: number | null;
  cameraLock: CameraLock | null;
  frameEvents: FrameEvent[];
}

const enemyDefaults: Record<EnemyKind, Omit<EnemyState, 'id' | 'encounterId' | 'x' | 'y' | 'facing' | 'alive' | 'attackCooldown' | 'stunTimer' | 'hitFlashTimer'>> = {
  runner: {
    kind: 'runner',
    hp: 24,
    maxHp: 24,
    speed: 118,
    damage: 8,
    attackRange: 52,
    scoreValue: 250,
  },
  bouncer: {
    kind: 'bouncer',
    hp: 54,
    maxHp: 54,
    speed: 62,
    damage: 14,
    attackRange: 62,
    scoreValue: 450,
  },
  chain: {
    kind: 'chain',
    hp: 36,
    maxHp: 36,
    speed: 82,
    damage: 11,
    attackRange: 98,
    scoreValue: 380,
  },
  boss: {
    kind: 'boss',
    hp: 120,
    maxHp: 120,
    speed: 86,
    damage: 18,
    attackRange: 92,
    scoreValue: 1600,
  },
};

export const createEnemyState = (
  encounterId: string,
  id: string,
  kind: EnemyKind,
  x: number,
  y: number,
): EnemyState => {
  const defaults = enemyDefaults[kind];

  return {
    id,
    encounterId,
    kind,
    x,
    y,
    hp: defaults.hp,
    maxHp: defaults.maxHp,
    speed: defaults.speed,
    damage: defaults.damage,
    attackRange: defaults.attackRange,
    scoreValue: defaults.scoreValue,
    facing: -1,
    alive: true,
    attackCooldown: 0,
    stunTimer: 0,
    hitFlashTimer: 0,
  };
};

export const createInitialGameState = (): GameState => ({
  phase: 'playing',
  totalTime: 0,
  score: 0,
  message: 'Hold the block. Push east and reclaim the venue.',
  messageTimer: 4,
  currentObjective: theStripEncounters[0].objective,
  rank: '-',
  damageTaken: 0,
  player: {
    x: 120,
    y: 360,
    hp: 100,
    maxHp: 100,
    hype: 0,
    maxHype: 100,
    facing: 1,
    combo: 0,
    comboTimer: 0,
    attackCooldown: 0,
    dodgeCooldown: 0,
    dodgeTimer: 0,
    specialCooldown: 0,
    invulnerableTimer: 0,
    hitFlashTimer: 0,
  },
  enemies: [],
  pickups: [],
  encounters: theStripEncounters.map((def) => ({
    def,
    spawned: false,
    cleared: false,
  })),
  activeEncounterIndex: null,
  cameraLock: null,
  frameEvents: [],
});

export const clampToStage = (x: number, y: number) => ({
  x: Math.max(stageBounds.minX, Math.min(stageBounds.maxX, x)),
  y: Math.max(stageBounds.minY, Math.min(stageBounds.maxY, y)),
});
