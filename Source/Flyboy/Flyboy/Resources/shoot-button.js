///////////////////////////////////////////////////////////
// SHHOT BUTTON ENTITY
///////////////////////////////////////////////////////////

/** Class representing the shoot button in the HUD of the game scene. */
class ShootButton 
{
  errors;
  isHeld;
  plane;
  projectileTypes;
  scene;
  sprite;
  
  /**
   * Creates the shoot button object. 
   * @param {Phaser.Scene} scene - Scene instance.
   * @param {Plane} plane - Plane instance.
   * @param {array} projectileTypes - Array of available prpjectile types.
   */
  constructor({ scene, plane, projectileTypes } = {}) 
  {
    this.errors = 
    {
      deltaTypeError: 'Shoot Button Error: Expected type number for delta',
      planeTypeError: 'Shoot Button Erorr: Expected type Plane for plane.',
      projectileTypesTypeError: 'Shoot Button Erorr: Expected type array for projectileTypes.',
      sceneError: 'Shoot Button Error: A valid phaser scene is required.'
    };

    if(!scene) console.error(this.errors.sceneError);
    if(!typeChecker.check({ type: 'plane', value: plane })) console.error(this.errors.planeTypeError);
    if(!typeChecker.check({ type: 'array', value: projectileTypes })) console.error(this.errors.projectileTypesTypeError);

    this.scene = scene;
    this.plane = plane;
    this.isHeld = false;
    this.shootCooldown = this.plane.shootingRate;
    this.elapsed = 0;
    this.projectileTypes = projectileTypes;
  
    this.sprite = scene.add.image(0, 0, 'shoot-button');
    this.sprite.setScale((device.screenWidth / 5) / (this.sprite.height));
    this.sprite.setPosition(device.screenHeight - 20 - (this.sprite.displayWidth / 2), device.screenWidth - 20 - (this.sprite.displayHeight / 2));
    this.sprite.setInteractive();
    this.sprite.setOrigin(0.5);
    this.sprite.on('pointerdown', () => 
    {
      if(!this.isHeld) 
      {
        this.isHeld = true;
        this.plane?.setAnimation({ name: this.plane.shootingAnimation });
        let x = this.plane.sprite.x + this.plane.sprite.displayWidth / 2;
        let y = this.plane.sprite.y + this.plane.sprite.displayHeight / 4;
        let projectile = new Projectile({ scene: this.scene, data: this.projectileTypes, type: this.plane.projectile, x: x, y: y, direction: 'right' });
        this.scene.physics.add.existing(projectile.sprite);
        this.scene.projectiles.add(projectile.sprite);
        this.scene.sound.play(this.plane.shootingSoundEffect.key, { volume: this.plane.shootingSoundEffect.volume })
        this.elapsed = -this.shootCooldown / 2;
      }
    });

    this.stopShooting = this.stopShooting.bind(this);
    this.sprite.on('pointerup', this.stopShooting);
    this.sprite.on('pointerout', this.stopShooting);
    this.sprite.on('pointerupoutside', this.stopShooting);
  }

  /** Public method to be called when the user is done holding or tapping the shoot button. */
  stopShooting()
  {
    if(this.isHeld) 
    {
      this.isHeld = false;
      this.plane?.setAnimation({ name: this.plane.idleAnimation });
    }
  }

  /**
   * Public method to update the shoot button in the game scene update loop. 
   * @param {number} delta - Time passed since last frame.
   */
  update({ delta } = {}) 
  {
    if(!typeChecker.check({ type: 'number', value: delta })) console.error(this.errors.deltaTypeError);
    if(!this.isHeld) return;
    this.elapsed += delta;
    if(this.elapsed >= this.shootCooldown) 
    {
      this.elapsed = 0;
      let x = this.plane.sprite.x + this.plane.sprite.displayWidth / 2;
      let y = this.plane.sprite.y + this.plane.sprite.displayHeight / 4;
      let projectile = new Projectile({ scene: this.scene, data: this.projectileTypes, type: this.plane.projectile, x: x, y: y, direction: 'right' });
      this.scene.projectiles.add(projectile.sprite);
      this.scene.sound.play(this.plane.shootingSoundEffect.key, { volume: this.plane.shootingSoundEffect.volume });
      this.scene.physics.add.existing(projectile.sprite);
    }
  }
}

///////////////////////////////////////////////////////////