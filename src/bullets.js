class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "bullet");
    this.bulletSpeed = 150;
  }

  fire(x, y, facing) {
    this.body.reset(x, y);
    this.body.setAllowGravity(false);
    this.body.setSize(6, 4);
    this.setActive(true);
    this.setVisible(true);
    this.setVelocityX(this.bulletSpeed * facing);
    this.setCollideWorldBounds(false);
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
  }

  dead() {
    this.disableBody(true, true);
    this.setActive(false);
    this.setVisible(false);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (this.x <= 0 || this.x >= 1536) {
      this.dead();
    }
  }
}

class Bullets extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene);

    this.createMultiple({
      frameQuantity: 5,
      key: "bullet",
      active: false,
      visible: false,
      classType: Bullet
    });
  }

  fireBullet(x, y, facing) {
    let bullet = this.getFirstDead(false);

    if (bullet) {
      bullet.fire(x, y, facing);
    }
  }
}

export { Bullet, Bullets };
