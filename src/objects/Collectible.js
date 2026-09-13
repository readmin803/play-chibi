import * as Phaser from 'phaser';
import { bus } from '../events.js';

export default class Collectible extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'fragment');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setCircle(22, 0, 0);
    this.baseY = y;
    this.phase = Phaser.Math.FloatBetween(0, Math.PI * 2);
  }

  update(time) {
    this.y = this.baseY + Math.sin(time * 0.004 + this.phase) * 6;
    this.setRotation(Math.sin(time * 0.002 + this.phase) * 0.4);
  }

  collect() {
    this.disableBody(true, true);
    bus.emit('fragment-collected');
  }
}
