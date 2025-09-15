///////////////////////////////////////////////////////////
// ENEMY ENTITY
///////////////////////////////////////////////////////////

/** Class representing an enemy that can be spawned in the game scene. */
class Enemy
{
  deathAnimation;
  deathSprite;
  deathSoundEffect;
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
    this.scene = scene;
    let enemyData = data.enemies.find(e => e.name === type);
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
    this.hitSoundEffect = this.soundEffects.find(obj => obj.key.includes('hit'));
    this.shootingSoundEffect = this.soundEffects.find(obj => obj.key.includes('shoot'));
    this.deathSoundEffect = this.soundEffects.find(obj => obj.key.includes('death'));

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
    if(this.deathSoundEffect !== null)
    {
      this.scene.sound.play(this.deathSoundEffect.key, 
      { 
        volume: this.deathSoundEffect.volume, 
        loop: this.deathSoundEffect.loop 
      });
    }
  }

  /** Public method to fire a projectile if the enemy supports it. */
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
    if(this.shootingSoundEffect !== null)
    {
      this.scene.sound.play(this.shootingSoundEffect.key, 
      { 
        volume: this.shootingSoundEffect.volume, 
        loop: this.shootingSoundEffect.loop 
      });
    }
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
    if(!typechecker.check({ type: 'number', value: delta })) console.error(this.errors.deltaTypeError);
    this.sprite.x -= (this.speed * delta) / 1000;
  }
}

///////////////////////////////////////////////////////////