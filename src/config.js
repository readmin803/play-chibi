export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const WORLD_WIDTH = 1200;
export const WORLD_HEIGHT = 1200;

export const COLORS = {
  background: 0x0a0a14,
  neon: 0x29f2d0,
  neonSoft: 0x7af7e3,
  accent: 0xff4fd8,
  danger: 0xff5a6e,
  glow: 0x2b1b3d,
  feather: 0x00c8e8,
  featherSoft: 0x66e8f7,
};

export const PLAYER = {
  speed: 420,
  scale: 0.28,
  maxHealth: 3,
};

export const ENEMY = {
  speed: 224,
  stepSize: 90,
  scale: 0.3,
  damage: 1,
  knockback: 320,
};

export const MISSIONS = [
  { fragments: 2, enemies: 2, timeLimit: 90 },
  { fragments: 3, enemies: 6, timeLimit: 55 },
  { fragments: 4, enemies: 8, timeLimit: 50 },
  { fragments: 5, enemies: 10, timeLimit: 45 },
];
