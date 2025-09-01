///////////////////////////////////////////////////////////
// ENEMY ENTITY
///////////////////////////////////////////////////////////

/** Class representing an enemy that can be spawned in the game scene. */
class Enemy
{
  deathAnimation;
  deathSprite;
  errors;
  hitSoundEffect;
  maxNumberOfHits;
  name;
  numberOfHits;
  scene;
  score;
  soundEffects;
  shootingSoundEffect;
  startingAnimation;

  /**
   * Creates and spawns the enemy object. 
   * @param {Phaser.Scene} scene - Scene instance.
   * @param {object} data - Data object loaded from enemies.json.
   * @param {string} type - Unique enemy type to be filtered from the data.
   * @param {number} x - X-coordinate postion.
   * @param {number} y - Y-coordinate postion.
   */
  constructor({ scene, data, type, x, y }) 
  {
    this.errors = 
    {
      animationsTypeError: 'Enemy Error: Expected type array for animations.',
      deathAnimationTypeError: 'Enemy Error: Expected type string for deathAnimation.',
      dataNotFoundError: 'Enemy Error: No data found for enemy.',
      dataTypeError: 'Enemy Error: Expected type object for data.',
      deltaTypeError: 'Enemy Error: Expected type number for delta.',
      flipXTypeError: 'Enemy Error: Expected type boolean for flipX.',
      heightTypeError: 'Enemy Error: Expected type number for height.',
      maxNumberOfHitsTypeError: 'Enemy Error: Expected type number for maxNumberOfHits.',
      nameTypeError: 'Enemy Error: Expected type string for name.',
      sceneError: 'Enemy Error: A valid phaser scene is required.',
      scoreTypeError: 'Enemy Error: Expected type number for score.',
      soundEffectsTypeError: 'Enemy Error: Expected type array for soundEffects.',
      speedTypeError: 'Enemy Error: Expected type number for speed.',
      spriteTypeError: 'Enemy Error: Expected type string for sprite.',
      startingAnimationTypeError: 'Enemy Error: Expected type string for startingAnimation.',
      typeTypeError: 'Enemy Error: Expected type string for type.',
      xTypeError: 'Enemy Error: Expected type number for x.',
      yTypeError: 'Enemy Error: Expected type number for y.'
    };

    if(!scene) console.error(this.errors.sceneError);
    if(!typeChecker.check({ type: 'object', value: data })) console.error(this.errors.dataTypeError);
    if(!typeChecker.check({ type: 'string', value: type })) console.error(this.errors.typeTypeError);
    if(!typeChecker.check({ type: 'number', value: x })) console.error(this.errors.xTypeError);
    if(!typeChecker.check({ type: 'number', value: y })) console.error(this.errors.yTypeError);

    this.scene = scene;
    let enemyData = data.enemies.find(e => e.name === type);
    if(!enemyData) console.error(this.errors.dataNotFoundError);

    if(!typeChecker.check({ type: 'string', value: enemyData.name })) console.error(this.errors.nameTypeError);
    if(!typeChecker.check({ type: 'string', value: enemyData.sprite })) console.error(this.errors.spriteTypeError);
    if(!typeChecker.check({ type: 'number', value: enemyData.height })) console.error(this.errors.heightTypeError);
    if(!typeChecker.check({ type: 'boolean', value: enemyData.flipX })) console.error(this.errors.flipXTypeError);
    if(!typeChecker.check({ type: 'array', value: enemyData.animations })) console.error(this.errors.animationsTypeError);
    if(!typeChecker.check({ type: 'string', value: enemyData.startingAnimation })) console.error(this.errors.startingAnimationTypeError);
    if(!typeChecker.check({ type: 'string', value: enemyData.deathAnimation })) console.error(this.errors.deathAnimationTypeError);
    if(!typeChecker.check({ type: 'number', value: enemyData.speed })) console.error(this.errors.speedTypeError);
    if(!typeChecker.check({ type: 'number', value: enemyData.maxNumberOfHits })) console.error(this.errors.maxNumberOfHitsTypeError);
    if(!typeChecker.check({ type: 'number', value: enemyData.score })) console.error(this.errors.scoreTypeError);
    if(!typeChecker.check({ type: 'array', value: enemyData.soundEffects })) console.error(this.errors.soundEffectsTypeError);
  
    this.name = enemyData.name;
    this.sprite = scene.add.sprite(x, y, this.name);
    this.sprite.setScale((device.screenWidth / enemyData.height) / this.sprite.height);
    this.startingAnimation = enemyData.startingAnimation;
    this.shootingAnimation = enemyData.shootingAnimation;
    this.deathAnimation = enemyData.deathAnimation;
    this.deathSprite = enemyData.deathSprite;
    this.sprite.play(enemyData.startingAnimation);
    this.sprite.setFlipX(enemyData.flipX);
    this.speed = device.screenWidth / enemyData.speed;
    this.maxNumberOfHits = enemyData.maxNumberOfHits;
    this.projectile = enemyData.projectile;
    this.shootingRate = enemyData.shootingRate;
    this.numberOfHits = 0;
    this.score = enemyData.score;
    this.soundEffects = enemyData.soundEffects;
    this.hitSoundEffect = this.soundEffects.find(obj => obj.key.includes("hit"));
    this.shootingSoundEffect = this.soundEffects.find(obj => obj.key.includes("shoot"));

    if(this.projectile !== null && this.shootingRate !== null)
    {
      this.shootTimer = this.scene.time.addEvent({
      delay: this.shootingRate,
      callback: this.fireProjectile,
      callbackScope: this,
      loop: true
    });
    }
  }

  /** Public method to destroy the enemies sprite. */
  destroy({ shootTimer } = {}) 
  {
    if(shootTimer) this.shootTimer.remove();
    this.sprite.destroy();
  }

  fireProjectile() 
  {
    if(!this.sprite.active) return;
    this.sprite.play(this.shootingAnimation);
    this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim, frame) => 
    {
      if(anim.key === this.shootingAnimation) 
      {
        this.sprite.play(this.startingAnimation);
      }
    });

    let x = this.sprite.x - this.sprite.displayWidth / 2;
    let y = this.sprite.y;

    let projectile = new Projectile({
      scene: this.scene,
      data: this.scene.matchingProjectiles,
      type: this.projectile,
      x: x,
      y: y,
      direction: 'left'
    });

    this.scene.physics.add.existing(projectile.sprite);
    this.scene.enemyProjectiles.add(projectile.sprite);
    this.scene.sound.play(this.shootingSoundEffect.key, { volume: this.shootingSoundEffect.volume, loop: this.shootingSoundEffect.loop });
  }

  /** 
   * Public method to return if the enemy is currently off screen or not.
   * @returns {boolean} Returns true or false if the enemy is off screen or not. 
   */
  isOffScreen() 
  {
    return this.sprite.x < -this.sprite.displayWidth;
  }

  /**
   * Public method to update the enemy in the main game scene update loop. 
   * @param {number} delta - Time passed since last frame.
   */
  update({ delta } = {}) 
  {
    if(!typeChecker.check({ type: 'number', value: delta })) console.error(this.errors.deltaTypeError);
    this.sprite.x -= (this.speed * delta) / 1000;
  }
}

///////////////////////////////////////////////////////////