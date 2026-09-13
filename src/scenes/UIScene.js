import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config.js';
import { input } from '../input.js';
import { bus } from '../events.js';

const JOYSTICK_RADIUS = 58;

export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create(data) {
    this.level = data.level || 1;
    input.stick.x = 0;
    input.stick.y = 0;
    input.stick.active = false;

    this.fragmentText = this.add.text(20, 18, '', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#7af7e3',
    });

    this.timeText = this.add.text(GAME_WIDTH - 20, 18, '', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(1, 0);

    this.healthText = this.add.text(20, GAME_HEIGHT - 34, '', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ff5a6e',
    });

    this.objectiveText = this.add.text(GAME_WIDTH / 2, 18, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ff4fd8',
    }).setOrigin(0.5, 0);

    this.levelText = this.add.text(GAME_WIDTH / 2, 46, `NIVEL ${this.level}`, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#8888aa',
    }).setOrigin(0.5, 0);

    this.createJoystick();

    bus.on('ui-update', this.onUIUpdate, this);
    this.events.on('shutdown', () => bus.off('ui-update', this.onUIUpdate, this));

    const gameScene = this.scene.get('GameScene');
    if (gameScene && gameScene.pushUI) gameScene.pushUI();
  }

  createJoystick() {
    this.joystickBase = this.add
      .circle(0, 0, JOYSTICK_RADIUS, 0xffffff, 0.05)
      .setStrokeStyle(2, COLORS.neon, 0.5)
      .setVisible(false)
      .setDepth(50);

    this.joystickThumb = this.add
      .circle(0, 0, 26, COLORS.neon, 0.5)
      .setStrokeStyle(2, COLORS.neonSoft, 0.9)
      .setVisible(false)
      .setDepth(51);

    this.joystickPointer = null;

    this.input.on('pointerdown', (pointer) => {
      if (pointer.x > GAME_WIDTH * 0.55) return;
      this.joystickPointer = pointer;
      this.joystickBase.setPosition(pointer.x, pointer.y).setVisible(true);
      this.joystickThumb.setPosition(pointer.x, pointer.y).setVisible(true);
    });

    this.input.on('pointermove', (pointer) => {
      if (pointer !== this.joystickPointer) return;
      const dx = pointer.x - this.joystickBase.x;
      const dy = pointer.y - this.joystickBase.y;
      const dist = Math.hypot(dx, dy);
      const clamped = Math.min(dist, JOYSTICK_RADIUS);
      const nx = dist === 0 ? 0 : dx / dist;
      const ny = dist === 0 ? 0 : dy / dist;
      this.joystickThumb.setPosition(
        this.joystickBase.x + nx * clamped,
        this.joystickBase.y + ny * clamped
      );
      input.stick.x = nx * (clamped / JOYSTICK_RADIUS);
      input.stick.y = ny * (clamped / JOYSTICK_RADIUS);
      input.stick.active = true;
    });

    this.input.on('pointerup', (pointer) => {
      if (pointer !== this.joystickPointer) return;
      this.resetJoystick();
    });
  }

  resetJoystick() {
    this.joystickPointer = null;
    this.joystickBase.setVisible(false);
    this.joystickThumb.setVisible(false);
    input.stick.x = 0;
    input.stick.y = 0;
    input.stick.active = false;
  }

  onUIUpdate(state) {
    this.fragmentText.setText(`◈ Eco ${state.fragments}/${state.total}`);
    this.timeText.setText(`⏱ ${state.time}`);
    this.healthText.setText('♥'.repeat(Math.max(0, state.health)));
    this.objectiveText.setText(
      state.objectiveDone ? '¡SALIDA ABIERTA! Huye al portal' : 'Recolecta los fragmentos de eco'
    );
  }
}
