///////////////////////////////////////////////////////////
// PROJECTILE ENTITY
///////////////////////////////////////////////////////////

/** Class representing a projectle that can be spawned in the game scene, either from the plane or by an enemy. */
class Projectile
{
  errors;
  direction;
  scene;
  speed;
  sprite;

  /**
   * Creates and spawns the projectile object. 
   * @param {Phaser.Scene} scene - Scene instance.
   * @param {number} x - X-coordinate postion.
   * @param {number} y - Y-coordinate postion.
   * @param {array} data - Data array loaded from projectiles.json.
   * @param {string} type - Unique projectle type to be filtered from the data.
   * @param {string} direction - Horizontal direction the projectile should fly.
   */
  constructor({ scene, data, type, x, y, direction } = {}) 
  {
    this.errors = 
    {
      directionTypeError: 'Projectile Error: Expected type string for type.',
      dataNotFoundError: 'Projectile Error: No data found for projectile.',
      dataTypeError: 'Projectile Error: Expected type array for data.',
      heightTypeError: 'Projectile Error: Expected type number for height.',
      nameTypeError: 'Projectile Error: Expected type string for name.',
      sceneError: 'Projectile Error: A valid phaser scene is required.',
      speedTypeError: 'Projectile Error: Expected type number for speed.',
      spriteTypeError: 'Projectile Error: Expected type string for sprite.',
      typeTypeError: 'Projectile Error: Expected type string for type.',
      xTypeError: 'Projectile Error: Expected type number for x.',
      yTypeError: 'Projectile Error: Expected type number for y.'
    };

    if(!scene) console.error(this.errors.sceneError);
    if(!typeChecker.check({ type: 'array', value: data })) console.error(this.errors.dataTypeError);
    if(!typeChecker.check({ type: 'string', value: type })) console.error(this.errors.typeTypeError);
    if(!typeChecker.check({ type: 'number', value: x })) console.error(this.errors.xTypeError);
    if(!typeChecker.check({ type: 'number', value: y })) console.error(this.errors.yTypeError);
    if(!typeChecker.check({ type: 'string', value: type })) console.error(this.errors.directionTypeError);

    this.scene = scene;
    let projectileData = data.find(p => p.name === type);
    if(!projectileData) console.error(this.errors.dataNotFoundError);

    if(!typeChecker.check({ type: 'string', value: projectileData.name })) console.error(this.errors.nameTypeError);
    if(!typeChecker.check({ type: 'string', value: projectileData.sprite })) console.error(this.errors.spriteTypeError);
    if(!typeChecker.check({ type: 'number', value: projectileData.height })) console.error(this.errors.heightTypeError);
    if(!typeChecker.check({ type: 'number', value: projectileData.speed })) console.error(this.errors.speedTypeError);

    this.name = projectileData.name;
    this.sprite = scene.add.sprite(x, y, projectileData.name);
    this.sprite.setScale((device.screenWidth / projectileData.height) / this.sprite.height);
    this.sprite.setFlipX(projectileData.flipX);
    this.speed = device.screenWidth / projectileData.speed;
    this.direction = direction;
    this.sprite.__projectile = this;
  }

  /** Public method to destroy the projectiles sprite. */
  destroy() 
  {
    this.sprite.destroy();
  }

  /**
   * Public method to return if the projectle is currently off screen or not. 
   * @param {string} direction - Horizontal direction that determines which bound to check for if the projectle is off screen yet or not.
   * @returns {boolean} Returns true or false if the projectle is off screen or not.
   */
  isOffScreen({ direction } = {}) 
  {
    if(direction === 'right') return this.sprite.x > device.screenHeight + this.sprite.displayWidth;
    else return this.sprite.x < -this.sprite.displayWidth;
  }

  /**
   * Public method to update the projectile in the main game scene update loop. 
   * @param {number} delta - Time passed since last frame.
   * @param {number} speed - The speed value the projectle should fly.
   * @param {string} direction - Horizontal direction the projectile should fly.
   */
  update({ delta, speed, direction } = {}) 
  {
    if(!typeChecker.check({ type: 'number', value: delta })) console.error(this.errors.deltaTypeError);
    if(direction === 'right') this.sprite.x += ((speed * delta) / 1000);
    else this.sprite.x -= ((speed * delta) / 1000);
  }
}

///////////////////////////////////////////////////////////