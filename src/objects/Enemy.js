import * as Phaser from 'phaser';
import { ENEMY } from '../config.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'monster');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(ENEMY.scale);
    this.setCollideWorldBounds(true);
    this.body.setCircle(140, 0, 0);

    this.wanderTimer = 0;
    this.wanderDuration = Phaser.Math.Between(1000, 2600);
    this.setRandomDirection();
  }

  setRandomDirection() {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.direction = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle));
    this.setVelocity(this.direction.x * ENEMY.speed, this.direction.y * ENEMY.speed);
  }

  update(time, delta) {
    this.wanderTimer += delta;
    if (this.wanderTimer >= this.wanderDuration) {
      this.wanderTimer = 0;
      this.wanderDuration = Phaser.Math.Between(1000, 2600);
      this.setRandomDirection();
    }

    if (this.body.velocity.x < -5) this.setFlipX(true);
    else if (this.body.velocity.x > 5) this.setFlipX(false);

    this.setRotation(Math.sin(time * 0.004) * 0.06);
  }
}
