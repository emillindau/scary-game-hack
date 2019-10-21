class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "bullet");
  }

  fire(x, y) {
    this.body.reset(x, y);
    this.body.setAllowGravity(false);
    this.body.customBoundsRectangle = new Phaser.Geom.Rectangle(0, 0, 4, 4);
    this.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 0, 4, 4));
    this.setActive(true);
    this.setVisible(true);
    this.setVelocityX(20);
    this.setCollideWorldBounds(false);
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (this.x <= 0 || this.x >= 512) {
      this.setActive(false);
      this.setVisible(false);
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

  fireBullet(x, y) {
    let bullet = this.getFirstDead(false);

    if (bullet) {
      bullet.fire(x, y);
    }
  }
}

export { Bullet, Bullets };
