import * as Phaser from 'phaser';
import { COLORS } from '../config.js';
import { input } from '../input.js';
import { bus } from '../events.js';
import { getSafeArea } from '../safeArea.js';

const JOYSTICK_RADIUS = 56;

export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create(data) {
    this.level = data.level || 1;
    this.safe = getSafeArea();
    input.stick.x = 0;
    input.stick.y = 0;
    input.stick.active = false;

    this.fragmentText = this.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#7af7e3',
    });

    this.timeText = this.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(1, 0);

    this.healthText = this.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ff5a6e',
    });

    this.objectiveText = this.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ff4fd8',
    }).setOrigin(0.5, 0);

    this.levelText = this.add.text(0, 0, `NIVEL ${this.level}`, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#8888aa',
    }).setOrigin(0.5, 0);

    this.createJoystick();
    this.layout();

    this.scale.on('resize', this.layout, this);
    this.events.on('shutdown', () => this.scale.off('resize', this.layout, this));

    bus.on('ui-update', this.onUIUpdate, this);
    this.events.on('shutdown', () => bus.off('ui-update', this.onUIUpdate, this));

    const gameScene = this.scene.get('GameScene');
    if (gameScene && gameScene.pushUI) gameScene.pushUI();
  }

  layout() {
    const w = this.scale.width;
    const h = this.scale.height;
    const pad = 14;
    const top = this.safe.top + pad;
    const bottom = h - this.safe.bottom - pad;
    const left = this.safe.left + pad;
    const right = w - this.safe.right - pad;

    this.fragmentText.setPosition(left, top);
    this.timeText.setPosition(right, top);
    this.healthText.setPosition(left, top + 34);
    this.objectiveText.setPosition(w / 2, top);
    this.levelText.setPosition(w / 2, top + 26);

    this.joyRestX = left + JOYSTICK_RADIUS + 12;
    this.joyRestY = bottom - JOYSTICK_RADIUS - 12;
    this.joystickBase.setPosition(this.joyRestX, this.joyRestY);
    this.joystickThumb.setPosition(this.joyRestX, this.joyRestY);
    this.joystickHint.setPosition(this.joyRestX, this.joyRestY + JOYSTICK_RADIUS + 16);
  }

  createJoystick() {
    this.joystickBase = this.add
      .circle(0, 0, JOYSTICK_RADIUS, 0xffffff, 0.06)
      .setStrokeStyle(2, COLORS.neon, 0.6)
      .setAlpha(0.9)
      .setDepth(50);

    this.joystickThumb = this.add
      .circle(0, 0, 28, COLORS.neon, 0.5)
      .setStrokeStyle(2, COLORS.neonSoft, 0.9)
      .setAlpha(0.9)
      .setDepth(51);

    this.joystickHint = this.add
      .text(0, 0, 'MOVER', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#7af7e3',
      })
      .setOrigin(0.5)
      .setAlpha(0.5)
      .setDepth(50);

    this.joystickPointer = null;

    this.input.on('pointerdown', (pointer) => {
      if (pointer.x > this.scale.width * 0.6) return;
      this.joystickPointer = pointer;
      this.joystickBase.setPosition(pointer.x, pointer.y).setAlpha(1);
      this.joystickThumb.setPosition(pointer.x, pointer.y).setAlpha(1);
      this.joystickHint.setAlpha(0);
      this.updateStick(pointer);
    });

    this.input.on('pointermove', (pointer) => {
      if (pointer !== this.joystickPointer) return;
      this.updateStick(pointer);
    });

    this.input.on('pointerup', (pointer) => {
      if (pointer !== this.joystickPointer) return;
      this.resetJoystick();
    });
  }

  updateStick(pointer) {
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
  }

  resetJoystick() {
    this.joystickPointer = null;
    this.joystickBase.setPosition(this.joyRestX, this.joyRestY).setAlpha(0.9);
    this.joystickThumb.setPosition(this.joyRestX, this.joyRestY).setAlpha(0.9);
    this.joystickHint.setAlpha(0.5);
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
