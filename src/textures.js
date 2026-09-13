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
  g.lineStyle(3, COLORS.neon, 0.8);
  g.strokeEllipse(90, 45, 150, 66);
  g.lineStyle(6, COLORS.neonSoft, 0.22);
  g.strokeEllipse(90, 45, 168, 82);
  g.generateTexture('halo', 180, 90);

  g.destroy();
}
