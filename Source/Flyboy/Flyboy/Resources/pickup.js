///////////////////////////////////////////////////////////
// PICKUP ENTITY
///////////////////////////////////////////////////////////

/** Class representing a pickup that can be spawned in the game scene. */
class Pickup 
{
  name;
  scene;
  score;
  soundEffect;
  speed;
  
  /**
   * Creates and spawns the pickup object. 
   * @param {Phaser.Scene} scene - Scene instance.
   * @param {object} data - Data object loaded from pickups.json.
   * @param {string} type - Unique pickup type to be filtered from the data.
   * @param {number} x - X-coordinate postion.
   * @param {number} y - Y-coordinate postion.
   */
  constructor({ scene, data, type, x, y }) 
  {
    this.scene = scene;
    let pickupData = data.pickups.find(p => p.name === type);
    if(!pickupData) console.error(this.errors.dataNotFoundError);

    this.name = pickupData.name;
    this.sprite = scene.add.sprite(x, y, this.name);
    this.sprite.setScale((device.screenWidth / pickupData.height) / this.sprite.height);
    this.speed = device.screenWidth / pickupData.speed;
    this.score = pickupData.score;
    this.soundEffect = pickupData.soundEffect;
    this.animationEffect = pickupData.animationEffect;
  }

  /** Public method to destroy the pickups sprite. */
  destroy() 
  {
    this.sprite.destroy();
  }

  /** 
   * Public method to return if the pickup is currently off screen or not.
   * @returns {boolean} Returns true or false if the pickup is off screen or not. 
   */
  isOffScreen() 
  {
    return this.sprite.x < -this.sprite.displayWidth;
  }

  /**
   * Public method to update the pickup in the main game scene update loop. 
   * @param {number} delta - Time passed since last frame.
   */
  update({ delta } = {}) 
  {
    if(!typeChecker.check({ type: 'number', value: delta })) console.error(this.errors.deltaTypeError);
    this.sprite.x -= (this.speed * delta) / 1000;
  }
}

///////////////////////////////////////////////////////////