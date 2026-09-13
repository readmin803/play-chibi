import * as Phaser from 'phaser';

export default class Portal extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'portal');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setCircle(44, 0, 0);
    this.active = false;
    this.setAlpha(0.35);
    this.setScale(0.85);
  }

  activate() {
    this.active = true;
    this.setAlpha(1);
    this.setScale(1);
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 1, to: 0.55 },
      duration: 420,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
