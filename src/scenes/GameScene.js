import * as Phaser from 'phaser';
import Player from '../objects/Player.js';
import Enemy from '../objects/Enemy.js';
import Collectible from '../objects/Collectible.js';
import Portal from '../objects/Portal.js';
import { generateTextures } from '../textures.js';
import { bus } from '../events.js';
import { input } from '../input.js';
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  COLORS,
  MISSIONS,
  ENEMY,
} from '../config.js';

function missionFor(level) {
  if (level <= MISSIONS.length) return MISSIONS[level - 1];
  const last = MISSIONS[MISSIONS.length - 1];
  const extra = level - MISSIONS.length;
  return {
    fragments: last.fragments + extra,
    enemies: last.enemies + extra * 2,
    timeLimit: Math.max(20, last.timeLimit - extra * 5),
  };
}

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.level = data.level || 1;
    this.mission = missionFor(this.level);
    this.collected = 0;
    this.timeLeft = this.mission.timeLimit;
    this.ending = false;
  }

  create() {
    generateTextures(this);
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    this.buildBackground();
    this.setupInput();

    this.player = new Player(this, WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    this.portal = new Portal(this, WORLD_WIDTH - 120, WORLD_HEIGHT - 120);

    this.fragments = this.physics.add.group();
    this.enemies = this.physics.add.group();

    for (let i = 0; i < this.mission.fragments; i++) {
      const p = this.safePoint(220);
      this.fragments.add(new Collectible(this, p.x, p.y));
    }

    for (let i = 0; i < this.mission.enemies; i++) {
      const p = this.safePoint(320);
      this.enemies.add(new Enemy(this, p.x, p.y));
    }

    this.physics.add.overlap(this.player, this.fragments, this.onFragment, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.onEnemy, null, this);
    this.physics.add.overlap(this.player, this.portal, this.onPortal, null, this);

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.applyCameraZoom();

    this._onResize = () => this.applyCameraZoom();
    this.scale.on('resize', this._onResize);
    this.events.once('shutdown', () => this.scale.off('resize', this._onResize));

    this.timeEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.timeLeft -= 1;
        this.pushUI();
        if (this.timeLeft <= 0) this.endGame(false);
      },
    });

    this._onFragment = () => this.onFragmentCollected();
    this._onDied = () => this.endGame(false);
    bus.on('fragment-collected', this._onFragment);
    bus.on('player-died', this._onDied);
    this.events.once('shutdown', () => {
      bus.off('fragment-collected', this._onFragment);
      bus.off('player-died', this._onDied);
    });

    this.scene.launch('UIScene', { level: this.level });
    this.pushUI();
  }

  buildBackground() {
    const g = this.add.graphics();

    g.fillStyle(COLORS.glow, 1);
    g.fillEllipse(WORLD_WIDTH * 0.15, WORLD_HEIGHT * 0.12, 900, 900);
    g.fillEllipse(WORLD_WIDTH * 0.88, WORLD_HEIGHT * 0.85, 1100, 1100);
    g.fillStyle(0x141426, 1);
    g.fillEllipse(WORLD_WIDTH * 0.7, WORLD_HEIGHT * 0.2, 700, 700);

    g.lineStyle(3, COLORS.neon, 0.18);
    for (let i = 0; i < 5; i++) {
      const cx = Phaser.Math.Between(100, WORLD_WIDTH - 100);
      const cy = Phaser.Math.Between(100, WORLD_HEIGHT - 100);
      const r = Phaser.Math.Between(120, 320);
      g.strokeCircle(cx, cy, r);
    }

    g.lineStyle(2, COLORS.accent, 0.14);
    for (let i = 0; i < 4; i++) {
      const cx = Phaser.Math.Between(150, WORLD_WIDTH - 150);
      const cy = Phaser.Math.Between(150, WORLD_HEIGHT - 150);
      const rx = Phaser.Math.Between(140, 360);
      const ry = Phaser.Math.Between(60, 180);
      g.strokeEllipse(cx, cy, rx, ry);
    }
  }

  setupInput() {    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  safePoint(minDist) {
    for (let attempt = 0; attempt < 60; attempt++) {
      const x = Phaser.Math.Between(80, WORLD_WIDTH - 80);
      const y = Phaser.Math.Between(80, WORLD_HEIGHT - 80);
      if (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < minDist) continue;
      if (Phaser.Math.Distance.Between(x, y, this.portal.x, this.portal.y) < 220) continue;
      return { x, y };
    }
    return { x: 80, y: 80 };
  }

  applyCameraZoom() {
    const zoom = Phaser.Math.Clamp(this.scale.width / 900, 0.6, 1);
    this.cameras.main.setZoom(zoom);
  }

  update(time, delta) {
    if (this.ending) return;

    const { cursors, wasd } = this;
    let kx = 0;
    let ky = 0;
    if (cursors.left.isDown || wasd.left.isDown) kx -= 1;
    if (cursors.right.isDown || wasd.right.isDown) kx += 1;
    if (cursors.up.isDown || wasd.up.isDown) ky -= 1;
    if (cursors.down.isDown || wasd.down.isDown) ky += 1;
    input.keys.x = kx;
    input.keys.y = ky;

    this.player.update(time);
    this.fragments.getChildren().forEach((f) => f.update(time));
    this.enemies.getChildren().forEach((e) => e.update(time, delta));
    this.portal.update(time, delta);

    if (this.portal.active) {
      const dx = this.portal.x - this.player.x;
      const dy = this.portal.y - this.player.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 30 && dist < 300) {
        const pull = (1 - dist / 300) * 90;
        this.player.setVelocity(
          this.player.body.velocity.x + (dx / dist) * pull,
          this.player.body.velocity.y + (dy / dist) * pull
        );
      }
    }
  }

  onFragment(player, fragment) {
    fragment.collect();
  }

  onFragmentCollected() {
    this.collected += 1;
    this.player.setGlowLevel(this.collected / this.mission.fragments);
    this.pushUI();
    if (this.collected >= this.mission.fragments) {
      this.portal.activate();
      this.objectiveDone = true;
      this.pushUI();
    }
  }

  onEnemy(player, enemy) {
    player.takeDamage(ENEMY.damage, enemy);
    this.pushUI();
  }

  onPortal(player, portal) {
    if (portal.active) this.endGame(true);
  }

  pushUI() {
    bus.emit('ui-update', {
      level: this.level,
      fragments: this.collected,
      total: this.mission.fragments,
      time: Math.max(0, this.timeLeft),
      health: this.player ? this.player.health : 0,
      objectiveDone: !!this.objectiveDone,
    });
  }

  endGame(won) {
    if (this.ending) return;
    this.ending = true;
    this.physics.pause();
    this.timeEvent.remove();

    const w = this.scale.width;
    const h = this.scale.height;
    const overlay = this.add
      .rectangle(w / 2, h / 2, w, h, 0x000000, 0.55)
      .setScrollFactor(0)
      .setDepth(100);

    const title = won ? 'NIVEL COMPLETADO' : 'HAS CAÍDO';
    const sub = won ? 'La salida se abre…' : 'Inténtalo de nuevo';

    this.add
      .text(w / 2, h / 2 - 30, title, {
        fontFamily: 'monospace',
        fontSize: '48px',
        color: won ? '#7af7e3' : '#ff5a6e',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);

    this.add
      .text(w / 2, h / 2 + 30, sub, {
        fontFamily: 'monospace',
        fontSize: '22px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);

    this.time.delayedCall(2200, () => {
      const nextLevel = won ? this.level + 1 : this.level;
      this.scene.stop('UIScene');
      this.scene.restart({ level: nextLevel });
    });
  }
}
