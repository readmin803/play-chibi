import * as Phaser from 'phaser';
import { COLORS } from './config.js';

export function generateTextures(scene) {
  if (scene.textures.exists('fragment')) return;

  const g = scene.make.graphics({ add: false });

  g.clear();
  g.fillStyle(COLORS.neon, 0.14);
  g.fillCircle(32, 32, 32);
  g.fillStyle(COLORS.neon, 0.35);
  g.fillCircle(32, 32, 20);
  g.fillStyle(COLORS.neonSoft, 0.9);
  g.fillCircle(32, 32, 11);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(32, 32, 4);
  g.generateTexture('fragment', 64, 64);

  g.clear();
  g.fillStyle(COLORS.neon, 0.12);
  g.fillCircle(64, 64, 40);
  g.lineStyle(6, COLORS.neon, 1);
  g.strokeCircle(64, 64, 42);
  g.lineStyle(12, COLORS.neonSoft, 0.35);
  g.strokeCircle(64, 64, 50);
  g.generateTexture('portal', 128, 128);

  g.clear();
  g.fillStyle(COLORS.neon, 0.10);
  g.fillCircle(64, 64, 64);
  g.fillStyle(COLORS.neon, 0.18);
  g.fillCircle(64, 64, 44);
  g.fillStyle(COLORS.neon, 0.28);
  g.fillCircle(64, 64, 26);
  g.generateTexture('glow', 128, 128);

  g.destroy();
}
