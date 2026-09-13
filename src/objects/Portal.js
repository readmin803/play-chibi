import * as Phaser from 'phaser';
import { COLORS } from '../config.js';

const PARTICLE_COUNT = 26;

export default class Portal extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'portal');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setVisible(false);
    this.body.setCircle(66, 0, 0);
    this.active = false;

    this.buildVortex();
  }

  buildVortex() {
    this.container = this.scene.add.container(this.x, this.y).setDepth(5);

    this.rings = [];
    const ringDefs = [
      { w: 210, h: 82, color: COLORS.neon, alpha: 0.45, lw: 3, speed: 0.9, segments: 5 },
      { w: 156, h: 52, color: COLORS.neonSoft, alpha: 0.6, lw: 3, speed: -1.3, segments: 4 },
      { w: 104, h: 30, color: COLORS.accent, alpha: 0.5, lw: 2, speed: 1.8, segments: 3 },
    ];

    ringDefs.forEach((def) => {
      const g = this.scene.add.graphics();
      g.lineStyle(def.lw, def.color, def.alpha);
      const seg = (Math.PI * 2) / def.segments;
      const gap = 0.5;
      for (let i = 0; i < def.segments; i++) {
        const start = i * seg;
        g.beginPath();
        g.arc(0, 0, def.w / 2, start + gap / 2, start + seg - gap / 2, false);
        g.strokePath();
      }
      g.setScale(1, def.h / def.w);
      g.setBlendMode(Phaser.BlendModes.ADD);
      this.container.add(g);
      this.rings.push({ g, speed: def.speed, angle: Phaser.Math.FloatBetween(0, Math.PI * 2) });
    });

    this.coreHole = this.scene.add.graphics();
    this.coreHole.fillStyle(0x000000, 0.92);
    this.coreHole.fillCircle(0, 0, 24);
    this.container.add(this.coreHole);

    this.coreRim = this.scene.add.graphics().setBlendMode(Phaser.BlendModes.ADD);
    this.coreRim.lineStyle(4, COLORS.neonSoft, 0.9);
    this.coreRim.strokeCircle(0, 0, 28);
    this.coreRim.lineStyle(2, 0xffffff, 0.7);
    this.coreRim.strokeCircle(0, 0, 32);
    this.container.add(this.coreRim);

    this.particleLayer = this.scene.add.graphics().setBlendMode(Phaser.BlendModes.ADD);
    this.container.add(this.particleLayer);

    this.particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      this.particles.push({
        angle: Phaser.Math.FloatBetween(0, Math.PI * 2),
        radius: Phaser.Math.FloatBetween(30, 95),
        spin: Phaser.Math.FloatBetween(0.002, 0.004),
        inward: Phaser.Math.FloatBetween(0.02, 0.045),
        size: Phaser.Math.FloatBetween(1.5, 3.5),
      });
    }

    this.container.setAlpha(0.32);
  }

  activate() {
    this.active = true;
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 500,
      ease: 'Sine.easeOut',
    });
    this.scene.tweens.add({
      targets: this.container,
      scale: { from: 0.85, to: 1.15 },
      duration: 500,
      ease: 'Back.easeOut',
    });
  }

  update(time, delta) {
    const speedMul = this.active ? 1 : 0.2;

    this.rings.forEach((r) => {
      r.angle += r.speed * delta * 0.001 * speedMul;
      r.g.setAngle(r.angle);
    });

    const pulse = 1 + Math.sin(time * 0.005) * 0.08;
    this.coreHole.setScale(pulse);
    this.coreRim.setScale(pulse);

    const layer = this.particleLayer;
    layer.clear();
    layer.fillStyle(COLORS.neonSoft, 0.9);
    this.particles.forEach((p) => {
      p.angle += p.spin * delta * speedMul;
      p.radius -= p.inward * delta * speedMul;
      if (p.radius < 8) {
        p.radius = Phaser.Math.FloatBetween(70, 95);
        p.angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      }
      const px = Math.cos(p.angle) * p.radius;
      const py = Math.sin(p.angle) * p.radius * 0.42;
      layer.fillCircle(px, py, p.size);
    });
  }
}
