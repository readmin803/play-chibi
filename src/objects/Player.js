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

    this.halo = scene.add.image(x, y, 'halo').setBlendMode(Phaser.BlendModes.ADD).setDepth(0);

    this.health = PLAYER.maxHealth;
    this.invincibleUntil = 0;
    this.glowLevel = 0;
  }

  setGlowLevel(level) {
    this.glowLevel = Phaser.Math.Clamp(level, 0, 1);
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

    const haloY = this.y;
    const breathe = 1 + Math.sin(time * 0.003) * 0.06;
    const alpha = 0.56 + this.glowLevel * 0.44;
    this.halo
      .setPosition(this.x, haloY)
      .setScale(breathe * (1.2 + this.glowLevel * 1.0))
      .setAlpha(alpha)
      .setRotation(Math.sin(time * 0.002) * 0.08);

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
