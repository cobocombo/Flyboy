///////////////////////////////////////////////////////////
// PLANE ENTITY
///////////////////////////////////////////////////////////

/** Class representing the plane object for the game scene. */
class Plane 
{
  baseY;
  bobTween;
  currentAnimation;
  deathAnimation;
  deathSoundEffect;
  hitSoundEffect;
  idleAnimation;
  idleSoundEffect;
  invincibilityDuration;
  invincibilitySoundEffect;
  maxNumberOfHits;
  name;
  numberOfHits;
  projectile;
  scene;
  shootingAnimation;
  shootingRate;
  shootingSoundEffect;
  startingAnimation;
  soundEffects;
  sprite;
  
  /**
   * Creates and spawns the plane object. 
   * @param {Phaser.Scene} scene - Scene instance.
   * @param {object} data - Data object loaded from planes.json.
   * @param {string} type - Unique plane type to be filtered from the data.
   */
  constructor({ scene, data, type } = {}) 
  {
    this.scene = scene;
    let planeData = data.planes.find(p => p.name === type);
    if(!planeData) console.error(`Plane Error: No pickup definition found for type "${type}".`);

    this.name = planeData.name;
    this.sprite = scene.add.sprite(0, 0, planeData.name);
    this.sprite.setScale((device.screenWidth / planeData.height) / (this.sprite.height));
    this.sprite.setFlipX(planeData.flipX);
    this.sprite.play(planeData.startingAnimation);
    this.scene.physics.add.existing(this.sprite);
    this.startingAnimation = planeData.startingAnimation;
    this.idleAnimation = planeData.idleAnimation;
    this.shootingAnimation = planeData.shootingAnimation;
    this.deathAnimation = planeData.deathAnimation;
    this.currentAnimation = this.startingAnimation;
    this.maxNumberOfHits = planeData.maxNumberOfHits;
    this.numberOfHits = 0;
    this.shootingRate = planeData.shootingRate;
    this.projectile = planeData.projectile;
    this.isInvincible = false;
    this.invincibilityDuration = planeData.invincibilityDuration;
    this.soundEffects = planeData.soundEffects;
    this.idleSoundEffect = this.soundEffects.find(obj => obj.key.includes("idle"));
    this.shootingSoundEffect = this.soundEffects.find(obj => obj.key.includes("shoot"));
    this.hitSoundEffect = this.soundEffects.find(obj => obj.key.includes("hit"));
    this.deathSoundEffect = this.soundEffects.find(obj => obj.key.includes("death"));
    this.invincibilitySoundEffect = this.scene.sound.add('clock', { volume: 0.5, loop: true });
  }

  /** 
   * Public method to set the animation of the plane.
   * @param {string} name - Name of the animation to change to. 
   */
  setAnimation({ name } = {}) 
  {
    if(!typechecker.check({ type: 'string', value: name })) console.error(this.errors.nameTypeError);
    if(this.currentAnimation !== name) 
    {
      this.sprite.play(name);
      this.currentAnimation = name;
    }
  }

  /** 
   * Public method to set the position of the plane.
   * @param {number} x - X-coordinate positon. 
   * @param {number} y - Y-coordinate positon. 
   */
  setPosition({ x, y } = {}) 
  {
    if(!typechecker.check({ type: 'number', value: x })) console.error(this.errors.xTypeError);
    if(!typechecker.check({ type: 'number', value: y })) console.error(this.errors.yTypeError);
    this.sprite.setPosition(x, y);
    this.baseY = y;
  }

  /** Public method to start the bobbing animation of the plane. */
  startBobbing() 
  {
    if(this.bobTween) return;
    let bobAmount = this.sprite.displayHeight / 12;
    this.bobTween = this.scene.tweens.add({
      targets: this.sprite,
      y: this.baseY - bobAmount,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  /** Public method to start the invincibility animation of the plane. */
  startInvincibility()
  {
    let cycleDuration = 50 * 2; 
    let repeatCount = Math.floor(this.invincibilityDuration / cycleDuration) - 1;
    this.isInvincible = true;
    this.scene.tweens.add({
      targets: this.sprite,
      tint: { from: 0xFFFFFF, to: 0xFFD700 },
      ease: 'Linear',
      duration: 50,
      yoyo: true,
      repeat: repeatCount,
      onComplete: () => { this.stopInvincibility() }
    });
    if(!this.invincibilitySoundEffect.isPlaying) this.invincibilitySoundEffect.play();
  }

  /** Public method to stop the bobbing naimation of the plane. */
  stopBobbing() 
  {
    if(this.bobTween) 
    {
      this.bobTween.stop();
      this.bobTween = null;
      this.sprite.setY(this.baseY);
    }
  }

  /** Public method to stop the invincibility animation of the plane. */
  stopInvincibility()
  {
    this.sprite.clearTint();
    this.isInvincible = false;
    if(this.invincibilitySoundEffect.isPlaying) this.invincibilitySoundEffect.stop();
  }

  /** 
   * Public method to update the plane in the main game scene update loop.
   * @param {jostick} jostick - Joystick instance.
   * @param {number} delta - Time passed since last frame. 
   */
  update({ joystick, delta } = {})
  {
    if(!typechecker.check({ type: 'joystick', value: joystick })) console.error(this.errors.joystickTypeError);
    if(!typechecker.check({ type: 'number', value: delta })) console.error(this.errors.deltaTypeError);

    let verticalSpeed = ((device.screenWidth / 3) * delta) / 1000;
    if(joystick.currentState === 'up') 
    {
      this.sprite.y -= verticalSpeed;
      this.stopBobbing();
    } 
    else if(joystick.currentState === 'down') 
    {
      this.sprite.y += verticalSpeed;
      this.stopBobbing();
    } 
    else this.startBobbing();

    let planeTopBound = 5 + (this.sprite.displayHeight / 2);
    let planeBottomBound = joystick.base.y - joystick.base.displayHeight / 1.15;
    this.sprite.y = Phaser.Math.Clamp(this.sprite.y, planeTopBound, planeBottomBound);
    if(joystick.currentState === 'up' || joystick.currentState === 'down') this.setPosition({ x: this.sprite.x, y: this.sprite.y });
  }
}

///////////////////////////////////////////////////////////