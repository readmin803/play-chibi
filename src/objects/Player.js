import * as Phaser from 'phaser';
import { PLAYER } from '../config.js';
import { input } from '../input.js';
import { bus } from '../events.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'pluma');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(PLAYER.scale);
    this.setCollideWorldBounds(true);
    this.body.setCircle(80, 0, 0);

    this.halo = scene.add.image(x, y, 'glow').setBlendMode(Phaser.BlendModes.ADD).setDepth(0);

    this.health = PLAYER.maxHealth;
    this.invincibleUntil = 0;
  }

  update(time) {
    const { keys, stick } = input;
    let dx = stick.active ? stick.x : keys.x;
    let dy = stick.active ? stick.y : keys.y;
    const len = Math.hypot(dx, dy);
    if (len > 1) {
      dx /= len;
      dy /= len;
    }

    this.setVelocity(dx * PLAYER.speed, dy * PLAYER.speed);

    if (dx < -0.05) this.setFlipX(true);
    else if (dx > 0.05) this.setFlipX(false);

    const pulse = 1 + Math.sin(time * 0.006) * 0.08;
    this.halo.setPosition(this.x, this.y).setScale(pulse);

    if (this.invincibleUntil > 0 && time >= this.invincibleUntil) {
      this.setAlpha(1);
    }
  }

  takeDamage(amount, source) {
    if (this.scene.time.now < this.invincibleUntil) return;

    this.health -= amount;
    this.invincibleUntil = this.scene.time.now + 1000;
    this.setAlpha(0.4);

    const knockX = this.x < source.x ? -1 : 1;
    const knockY = this.y < source.y ? -1 : 1;
    this.setVelocity(knockX * 320, knockY * 320);

    if (this.health <= 0) {
      bus.emit('player-died');
    }
  }
}
