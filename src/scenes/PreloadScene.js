import * as Phaser from 'phaser';
import { COLORS } from '../config.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    const barWidth = this.scale.width * 0.5;
    const barHeight = 14;
    const x = this.scale.width / 2;
    const y = this.scale.height / 2;

    const box = this.add.graphics();
    box.fillStyle(0x1a1a2e, 1);
    box.fillRoundedRect(x - barWidth / 2 - 8, y - barHeight / 2 - 8, barWidth + 16, barHeight + 16, 8);

    const bar = this.add.graphics();

    this.load.on('progress', (value) => {
      bar.clear();
      bar.fillStyle(COLORS.neon, 1);
      bar.fillRoundedRect(x - barWidth / 2, y - barHeight / 2, barWidth * value, barHeight, 6);
    });

    this.load.on('complete', () => {
      box.destroy();
      bar.destroy();
      this.scene.start('GameScene', { level: 1 });
    });

    this.load.image('pluma', 'assets/images/pluma.png');
    this.load.image('monster', 'assets/images/moster.png');
  }
}
