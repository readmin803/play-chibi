import * as Phaser from 'phaser';
import { ENEMY } from '../config.js';

const KNIGHT_MOVES = [
  [2, 1], [2, -1], [-2, 1], [-2, -1],
  [1, 2], [1, -2], [-1, 2], [-1, -2],
];

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'monster');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(ENEMY.scale);
    this.setCollideWorldBounds(true);
    this.body.setCircle(140, 0, 0);

    this.speed = ENEMY.speed;
    this.stepSize = ENEMY.stepSize;

    this.segments = [];
    this.segmentTimer = 0;
    this.idleTimer = Phaser.Math.Between(300, 900);
    this.setVelocity(0, 0);
  }

  queueLMove() {
    const m = KNIGHT_MOVES[Phaser.Math.Between(0, KNIGHT_MOVES.length - 1)];
    const segs = [];
    if (m[0] !== 0) {
      segs.push({
        vx: Math.sign(m[0]) * this.speed,
        vy: 0,
        duration: (Math.abs(m[0]) * this.stepSize / this.speed) * 1000,
      });
    }
    if (m[1] !== 0) {
      segs.push({
        vx: 0,
        vy: Math.sign(m[1]) * this.speed,
        duration: (Math.abs(m[1]) * this.stepSize / this.speed) * 1000,
      });
    }
    this.segments = segs;
    this.startSegment();
  }

  startSegment() {
    const seg = this.segments.shift();
    if (!seg) {
      this.setVelocity(0, 0);
      this.idleTimer = Phaser.Math.Between(300, 900);
      return;
    }
    this.segmentTimer = seg.duration;
    this.setVelocity(seg.vx, seg.vy);
  }

  update(time, delta) {
    if (this.segments.length > 0 || this.segmentTimer > 0) {
      this.segmentTimer -= delta;
      if (this.segmentTimer <= 0) {
        this.startSegment();
      }
    } else {
      this.idleTimer -= delta;
      if (this.idleTimer <= 0) {
        this.queueLMove();
      }
    }

    if (this.body.velocity.x < -5) this.setFlipX(true);
    else if (this.body.velocity.x > 5) this.setFlipX(false);

    this.setRotation(Math.sin(time * 0.004) * 0.06);
  }
}
