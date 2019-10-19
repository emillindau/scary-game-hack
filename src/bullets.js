class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "bullet");
  }

  fire(x, y) {
    this.body.reset(x, y);
    this.body.allowGravity = false;
    this.setActive(true);
    this.setVisible(true);
    this.setVelocityX(200);
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

  fireBullet(x, y, zombies, hitCb, scene) {
    let bullet = this.getFirstDead(false);

    if (bullet) {
      bullet.fire(x, y);

      scene.physics.add.collider(bullet, zombies);
      scene.physics.add.overlap(
        bullet,
        zombies,
        function() {
          console.log("hit!");
        },
        null,
        this
      );
    }
  }
}

export { Bullet, Bullets };
