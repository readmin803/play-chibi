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
  g.lineStyle(6, COLORS.feather, 0.95);
  g.strokeCircle(64, 64, 48);
  g.lineStyle(12, COLORS.featherSoft, 0.45);
  g.strokeCircle(64, 64, 56);
  g.lineStyle(2, 0xd8fbff, 0.6);
  g.strokeCircle(64, 64, 48);
  g.generateTexture('halo', 128, 128);

  g.destroy();
}
