export type EnemyKind = 'runner' | 'bouncer' | 'chain' | 'boss';

export interface EnemySpawn {
  id: string;
  kind: EnemyKind;
  x: number;
  y: number;
}

export interface EncounterDefinition {
  id: string;
  title: string;
  objective: string;
  xStart: number;
  xEnd: number;
  backgroundLabel: string;
  palette: {
    sky: number;
    accent: number;
    ground: number;
  };
  enemies: EnemySpawn[];
  dropFood?: boolean;
}

export const theStripEncounters: EncounterDefinition[] = [
  {
    id: 'flyer-row',
    title: 'The Strip',
    objective: 'Push through the bottle line and keep the block open.',
    xStart: 220,
    xEnd: 1080,
    backgroundLabel: 'FLYER ROW',
    palette: {
      sky: 0x211726,
      accent: 0xff6b35,
      ground: 0x34212d,
    },
    enemies: [
      { id: 'runner-1', kind: 'runner', x: 700, y: 320 },
      { id: 'runner-2', kind: 'runner', x: 860, y: 400 },
      { id: 'chain-1', kind: 'chain', x: 980, y: 330 },
    ],
  },
  {
    id: 'generator-alley',
    title: 'Generator Alley',
    objective: 'Protect the sound rig while the crew brings the power back online.',
    xStart: 1160,
    xEnd: 2020,
    backgroundLabel: 'GENERATOR ALLEY',
    palette: {
      sky: 0x16232a,
      accent: 0xe9c46a,
      ground: 0x20353d,
    },
    enemies: [
      { id: 'bouncer-1', kind: 'bouncer', x: 1440, y: 350 },
      { id: 'runner-3', kind: 'runner', x: 1600, y: 300 },
      { id: 'chain-2', kind: 'chain', x: 1760, y: 420 },
      { id: 'runner-4', kind: 'runner', x: 1860, y: 360 },
    ],
    dropFood: true,
  },
  {
    id: 'marquee-finale',
    title: 'Marquee Finale',
    objective: 'Drop the promoter and reclaim the venue entrance.',
    xStart: 2100,
    xEnd: 3060,
    backgroundLabel: 'MARQUEE FINALE',
    palette: {
      sky: 0x271319,
      accent: 0xf94144,
      ground: 0x381d24,
    },
    enemies: [
      { id: 'runner-5', kind: 'runner', x: 2380, y: 320 },
      { id: 'boss-1', kind: 'boss', x: 2700, y: 360 },
      { id: 'chain-3', kind: 'chain', x: 2480, y: 430 },
    ],
  },
];

export const stageBounds = {
  minX: 80,
  maxX: 3180,
  minY: 214,
  maxY: 520,
};
