///////////////////////////////////////////////////////////
// PICKUP ENTITY
///////////////////////////////////////////////////////////

/** Class representing a pickup that can be spawned in the game scene. */
class Pickup 
{
  errors;
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
    this.errors = 
    {
      dataNotFoundError: 'Pickup Error: No data found for pickup.',
      dataTypeError: 'Pickup Error: Expected type object for data.',
      deltaTypeError: 'Pickup Error: Expected type number for delta.',
      heightTypeError: 'Pickup Error: Expected type number for height.',
      nameTypeError: 'Pickup Error: Expected type string for name.',
      sceneError: 'Pickup Error: A valid phaser scene is required.',
      scoreTypeError: 'Pickup Error: Expected type number for score.',
      soundEffectTypeError: 'Pickup Error: Expected type object for soundEffect.',
      speedTypeError: 'Pickup Error: Expected type number for speed.',
      spriteTypeError: 'Pickup Error: Expected type string for sprite.',
      typeTypeError: 'Pickup Error: Expected type string for type.',
      xTypeError: 'Pickup Error: Expected type number for x.',
      yTypeError: 'Pickup Error: Expected type number for y.'
    };

    if(!scene) console.error(this.errors.sceneError);
    if(!typeChecker.check({ type: 'object', value: data })) console.error(this.errors.dataTypeError);
    if(!typeChecker.check({ type: 'string', value: type })) console.error(this.errors.typeTypeError);
    if(!typeChecker.check({ type: 'number', value: x })) console.error(this.errors.xTypeError);
    if(!typeChecker.check({ type: 'number', value: y })) console.error(this.errors.yTypeError);

    this.scene = scene;
    let pickupData = data.pickups.find(p => p.name === type);
    if(!pickupData) console.error(this.errors.dataNotFoundError);

    if(!typeChecker.check({ type: 'string', value: pickupData.name })) console.error(this.errors.nameTypeError);
    if(!typeChecker.check({ type: 'string', value: pickupData.sprite })) console.error(this.errors.spriteTypeError);
    if(!typeChecker.check({ type: 'number', value: pickupData.height })) console.error(this.errors.heightTypeError);
    if(!typeChecker.check({ type: 'number', value: pickupData.speed })) console.error(this.errors.speedTypeError);
    if(!typeChecker.check({ type: 'number', value: pickupData.score })) console.error(this.errors.scoreTypeError);
    if(!typeChecker.check({ type: 'object', value: pickupData.soundEffect })) console.error(this.errors.soundEffectTypeError);
   
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