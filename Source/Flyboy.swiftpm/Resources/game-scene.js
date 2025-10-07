///////////////////////////////////////////////////////////
// GAME SCENE
///////////////////////////////////////////////////////////

/** Class representing the game scene of Flyboy. */
class GameScene extends Phaser.Scene 
{
  background1;
  background2;
  elapsedTime;
  enemies;
  enemyData;
  enemyProjectiles;
  enemySpawnQueue;
  hud;
  levelComplete;
  matchingProjectiles;
  pickups;
  pickupData;
  pickupSpawnQueue;
  plane;
  planeType;
  projectiles;
  selectedPlane;
  score;

  /** Creates the game scene object. */
  constructor() 
  {
    super('GameScene');

    this.errors = 
    {
      amountTypeError: 'Game Scene Error: Expected type number for amount.',
      deltaTypeError: 'Game Scene Error: Expected type number for delta.',
      stateTypeError: 'Game Scene Error: Expected type string for state.'
    }; 
  }

  /** Public method called to check if all the conditions are right for the level to be marked as complete, before deciding failure or not. */
  checkForLevelComplete() 
  {
    let queuesEmpty = this.enemySpawnQueue.length === 0 && this.pickupSpawnQueue.length === 0;
    let noEnemiesLeft = this.enemies.countActive(true) === 0;
    let noPickupsLeft = this.pickups.countActive(true) === 0;
    let planeAlive = this.plane.currentAnimation !== this.plane.deathAnimation;
    if(queuesEmpty && noEnemiesLeft && noPickupsLeft && planeAlive) return true;
    return false;
  }

  /** Public method called to check if all the conditions are right the plane to be dead or not. */
  checkForPlaneDeath()
  {
    if(this.plane.numberOfHits === this.plane.maxNumberOfHits) this.gameOver({ state: 'death' });
    else
    {
      if(this.plane.isInvincible !== true) 
      {
        this.sound.play(this.plane.hitSoundEffect.key, { volume: this.plane.hitSoundEffect.volume, loop: this.plane.hitSoundEffect.loop });
        this.plane.sprite.setTint(0xff0000);
        this.time.delayedCall(100, () => { this.plane.sprite.clearTint(); });
      }
    }
  }

  /** Public method called to create logic and assets for the scene. */
  create() 
  {
    this.input.addPointer(2);

    this.background1 = this.add.image(0, 0, 'background');
    this.background2 = this.add.image(0, 0, 'background');
    this.background1.setDisplaySize(device.screenHeight, device.screenWidth);
    this.background2.setDisplaySize(device.screenHeight, device.screenWidth);
    this.background1.setOrigin(0, 0);
    this.background2.setOrigin(0, 0);
    this.background1.setPosition(0, 0);
    this.background2.setPosition(device.screenHeight-2, 0);

    this.pickupSpawnQueue = [];
    this.enemySpawnQueue = [];
    this.elapsedTime = 0;
    this.score = 0;
    this.levelComplete = false;

    this.loadEnemyAnimations();
    this.loadPlaneAnimations();
    this.loadPickupAnimations();
    this.loadEffectsAnimations();

    this.enemies = this.physics.add.group();
    this.pickups = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    this.enemyProjectiles = this.physics.add.group();
  
    this.enemySpawnQueue = [...levels.currentLevel.enemies].sort((a, b) => a.spawnTime - b.spawnTime);
    this.pickupSpawnQueue = [...levels.currentLevel.pickups].sort((a, b) => a.spawnTime - b.spawnTime);
    
    this.plane = new Plane({ scene: this, data: this.planeData, type: this.planeType });
    this.plane.setPosition({ x: 20 + (this.plane.sprite.displayWidth / 2), y: (device.screenWidth / 2) - (device.screenWidth / 12) });
    this.sound.play(this.plane.idleSoundEffect.key, { volume: this.plane.idleSoundEffect.volume, loop: this.plane.idleSoundEffect.loop });
    this.sound.play('background-music', { volume: 0.1, loop: true });

    this.levelfailedAlert = new LevelFailedDialog({ scene: this.scene });
    this.hud = new HUD({ scene: this, joystick: new Joystick({ scene: this }), shootButton: new ShootButton({ scene: this, plane: this.plane, projectileTypes: this.matchingProjectiles }), plane: this.plane });

    this.setPlaneEnemyCollision();
    this.setPlanePickupCollision();
    this.setProjectileEnemyCollision();
    this.setEnemyProjectilePlaneCollision();
  }

  /** Public method called when the game is over. */
  gameOver({ state } = {})
  {
    if(!typechecker.check({ type: 'string', value: state })) console.error(this.errors.stateTypeError);
    if(state === 'death')
    {
      this.plane?.setAnimation({ name: this.plane.deathAnimation });
      this.time.delayedCall(100, () => 
      { 
        let planeIdleSoundEffect = this.sound.get(this.plane.idleSoundEffect.key);
        if(planeIdleSoundEffect)
        {
          planeIdleSoundEffect.stop();
          planeIdleSoundEffect.destroy();
        } 

        let backgroundMusic = this.sound.get('background-music');
        if(backgroundMusic)
        {
          backgroundMusic.stop();
          backgroundMusic.destroy();
        } 

        this.sound.play(this.plane.deathSoundEffect.key, { volume: this.plane.deathSoundEffect.volume, loop: this.plane.deathSoundEffect.loop });
        this.scene.pause();
        this.levelfailedAlert.present();
        this.sound.play('level-failed', { volume: 0.7, loop: false });
      });
    }
    else if(state === 'alive')
    {
      this.levelComplete = true;
      this.time.delayedCall(2000, () => 
      { 
        this.scene.pause();

        let planeIdleSoundEffect = this.sound.get(this.plane.idleSoundEffect.key);
        if(planeIdleSoundEffect)
        {
          planeIdleSoundEffect.stop();
          planeIdleSoundEffect.destroy();
        }

        let backgroundMusic = this.sound.get('background-music');
        if(backgroundMusic)
        {
          backgroundMusic.stop();
          backgroundMusic.destroy();
        } 
          
        let starCount = 0;
        if(this.score >= levels.currentLevel.threeStarScore) starCount = 3;
        else if(this.score >= levels.currentLevel.twoStarScore) starCount = 2;
        else if(this.score >= levels.currentLevel.oneStarScore) starCount = 1;
        else starCount = 0;

        if(starCount === 0)
        {
          this.levelfailedAlert.present();
          this.sound.play('level-failed', { volume: 0.7, loop: false });
        }
        else
        {
          this.sound.play('level-complete', { volume: 0.7, loop: false });
          let levelCompleteAlert = new LevelCompleteDialog({ scene: this.scene, score: this.score, starCount: starCount });
          levelCompleteAlert.present();
          confetti.start();
          levels.addLevelProgress({ id: levels.currentLevel.id, stars: starCount, unlocked: true, score: this.score });

          let levelCount = levels.levelCount;
          let nextLevelId = levels.currentLevel.id + 1;
          if(levelCount && nextLevelId <= levelCount) levels.addLevelProgress({ id: nextLevelId, stars: 0, completed: false, unlocked: true, score: 0 });
        }
      });
    }
  }

  /** Public method called to pre-load any assets for the scene or upcoming scenes. */
  preload() 
  {
    this.planeType = 'green-plane';
    this.planeData = this.cache.json.get('planes');
    this.enemyData = this.cache.json.get('enemies');
    this.pickupData = this.cache.json.get('pickups');
    this.projectileData = this.cache.json.get('projectiles');
    this.effectsData = this.cache.json.get('effects');

    this.load.image('background', levels.currentLevel.background);
    this.load.image('joystick-base', 'joystick-base.png');
    this.load.image('joystick', 'joystick.png');
    this.load.image('shoot-button', 'shoot-button.png');
    this.load.image('pause-button', 'pause-button.png');
    this.load.image('heart', 'heart.png'); 

    this.loadEnemyImages();
    this.loadPlaneImages();
    this.loadPickupImages();
    this.loadProjectileImages();
    this.loadEffectsImages();

    this.loadEnemySounds();
    this.loadPlaneSounds();
    this.loadPickupSounds();

    this.load.audio('level-failed', 'level-failed.mp3');
    this.load.audio('level-complete', 'level-complete.mp3');
    this.load.audio('background-music', levels.currentLevel.backgroundMusic);
  }

  /** Public method called to load needed effects animations in the game scene. */
  loadEffectsAnimations()
  {
    this.effectsData.effects.forEach(effect => 
    {
      if(effect.frames !== null)
      {
        let frames = effect.frames.map(frame => ({ key: frame.key }));
        if(frames !== null)
        {
          if(!this.anims.exists(effect.key)) 
          {
            this.anims.create({
              key: effect.key,
              frames: frames,
              frameRate: effect.frameRate,
              repeat: effect.repeat
            });
          }
        }
      }
    });
  }

  /** Public method called to load needed effects images in the game scene. */
  loadEffectsImages()
  {
    this.effectsData.effects.forEach(effect => 
    {
      this.load.image(effect.name, effect.sprite);
      if(effect.frames !== null)
      {
        effect.frames.forEach(frame => 
        {
          this.load.image(frame.key, frame.sprite);
        });
      }
    });
  }

  /** Public method called to load needed enemy animations in the game scene. */
  loadEnemyAnimations()
  {
    this.enemyData.enemies
    .filter(enemy => this.enemyTypes.includes(enemy.name))
    .forEach(enemy => 
    {
      if(enemy.animations) 
      {
        enemy.animations.forEach(animation => 
        {
          let frames = animation.frames.map(frame => ({ key: frame.key }));
          if(!this.anims.exists(animation.key)) 
          {
            this.anims.create({
              key: animation.key,
              frames: frames,
              frameRate: animation.frameRate,
              repeat: animation.repeat
            });
          }
        });
      }
    });
  }

  /** Public method called to load needed enemy images in the game scene. */
  loadEnemyImages() 
  {
    this.enemyTypes = [...new Set((levels.currentLevel?.enemies || []).map(e => e.type))];
    this.enemyData.enemies
    .filter(enemy => this.enemyTypes.includes(enemy.name))
    .forEach(enemy => 
    {
      if(enemy.name && enemy.sprite && enemy.animations) 
      {
        this.load.image(enemy.name, enemy.sprite);
        enemy.animations.forEach(animation => 
        {
          animation.frames.forEach(frame => 
          {
            this.load.image(frame.key, frame.sprite);
          });
        });
      }
    });
  }

  /** Public method called to load needed enemy sounds in the game scene. */
  loadEnemySounds()
  {
    this.enemyData.enemies
    .filter(enemy => this.enemyTypes.includes(enemy.name))
    .forEach(enemy => 
    { 
      enemy.soundEffects.forEach(effect =>
      {
        this.load.audio(effect.key, effect.sound); 
      });
    });
  }

  /** Public method called to load needed pickup animations in the game scene. */
  loadPickupAnimations() 
  {
    this.pickupData.pickups
    .filter(pickup => this.pickupTypes.includes(pickup.name))
    .forEach(pickup => 
    {
      if(pickup.animations && Array.isArray(pickup.animations)) 
      {
        pickup.animations.forEach(animation => 
        {
          let frames = animation.frames.map(frame => ({ key: frame.key }));
          if(!this.anims.exists(animation.key)) 
          {
            this.anims.create({
              key: animation.key,
              frames: frames,
              frameRate: animation.frameRate || 12,
              repeat: animation.repeat ?? -1
            });
          }
        });
      }
    });
  }

  /** Public method called to load needed pickup images in the game scene. */
  loadPickupImages() 
  {
    this.pickupTypes = [...new Set((levels.currentLevel?.pickups || []).map(p => p.type))];
    this.pickupData.pickups
    .filter(pickup => this.pickupTypes.includes(pickup.name))
    .forEach(pickup => { if(pickup.name && pickup.sprite) this.load.image(pickup.name, pickup.sprite); });
  }

  /** Public method called to load needed pickup sounds in the game scene. */
  loadPickupSounds()
  {
    this.pickupData.pickups
    .filter(pickup => this.pickupTypes.includes(pickup.name))
    .forEach(pickup => { this.load.audio(pickup.soundEffect.key, pickup.soundEffect.sound); });
  }

    /** Public method called to load needed plane animations in the game scene. */
  loadPlaneAnimations() 
  {
    let selectedPlane = this.planeData.planes.find(plane => plane.name === this.planeType);
    if(selectedPlane && selectedPlane.animations) 
    {
      selectedPlane.animations.forEach(animation => 
      {
        let frames = animation.frames.map(frame => ({ key: frame.key }));
        if(!this.anims.exists(animation.key)) 
        {
          this.anims.create({
            key: animation.key,
            frames: frames,
            frameRate: animation.frameRate,
            repeat: animation.repeat
          });
        }
      });
    }
  }

  /** Public method called to load needed effects images in the game scene. */
  loadPlaneImages() 
  {
    this.selectedPlane = this.planeData.planes.find(plane => plane.name === this.planeType);
    this.load.image(this.selectedPlane.name, this.selectedPlane.sprite);
    this.selectedPlane.animations.forEach(animation => 
    {
      animation.frames.forEach(frame => 
      {
        this.load.image(frame.key, frame.sprite);
      });
    });
  }

  /** Public method called to load needed plane sounds in the game scene. */
  loadPlaneSounds()
  {
    let selectedPlane = this.planeData.planes.find(plane => plane.name === this.planeType);
    selectedPlane.soundEffects.forEach(effect => { this.load.audio(effect.key, effect.sound); });
    this.load.audio('clock', 'clock.mp3');
  }

  /** Public method called to load needed projectile images in the game scene. */
  loadProjectileImages() 
  {
    this.matchingProjectiles = this.projectileData.projectiles.filter(
      proj => proj.name === this.selectedPlane.projectile
    );

    this.enemyTypes = [...new Set((levels.currentLevel?.enemies || []).map(e => e.type))];
    let enemyProjectiles = this.enemyData.enemies
      .filter(enemy => this.enemyTypes.includes(enemy.name))
      .map(enemy => enemy.projectile)
      .filter(Boolean);

    let enemyMatchingProjectiles = this.projectileData.projectiles.filter(
      proj => enemyProjectiles.includes(proj.name)
    );
    this.matchingProjectiles = [
      ...this.matchingProjectiles,
      ...enemyMatchingProjectiles
    ];
    this.matchingProjectiles.forEach(proj => {
      this.load.image(proj.name, proj.sprite);
    });
  }

  /** Public method called to set the physics for the enemy projectiles and the plane currently in the game scene. */
  setEnemyProjectilePlaneCollision()
  {
    this.physics.add.overlap(this.enemyProjectiles, this.plane.sprite, (projectileSprite, planeSprite) => 
    {
      planeSprite.destroy();
      this.enemyProjectiles.remove(planeSprite, true, true);

      if(this.plane.isInvincible !== true) this.plane.numberOfHits += 1;
      this.hud.updateHearts();
      this.checkForPlaneDeath();
    });
  }

  /** Public method called to set the physics for the plane and enemies for the game scene. */
  setPlaneEnemyCollision()
  {
    this.physics.add.overlap(this.plane.sprite, this.enemies, (planeSprite, enemySprite) => 
    {
      if(this.plane.isInvincible !== true) this.plane.numberOfHits += 1;
      let enemy = enemySprite.__enemy;
      let { x, y, displayHeight } = enemySprite;
      enemy.destroy({ shootTimer: enemy.shootTimer });
      this.enemies.remove(enemy.sprite, true, true);
      let deathEffect = new Effect({ scene: this, data: this.effectsData, type: enemy.deathAnimation, x: x, y: y, height: displayHeight * 1.5 });
      deathEffect.onAnimationComplete(effect => { effect.destroy(); });
      this.sound.play(enemy.hitSoundEffect.key, { volume: enemy.hitSoundEffect.volume });
      this.checkForPlaneDeath();
      this.hud.updateHearts();
    });
  }

  /** Public method called to set the physics for the plane and pickups for the game scene. */
  setPlanePickupCollision()
  {
    this.physics.add.overlap(this.plane.sprite, this.pickups, (planeSprite, pickupSprite) => 
    {
      let pickup = pickupSprite.__pickup;
      let { x, y, displayHeight } = pickupSprite;
      pickup.destroy();
      this.pickups.remove(pickup.sprite, true, true);
      this.updateScore({ amount: pickup.score });
      if(pickup.name == 'heal')
      {
        if(this.plane.numberOfHits !== 0) this.plane.numberOfHits -=1;
        this.hud.updateHearts();
      }
      if(pickup.name == 'invincible') this.plane.startInvincibility();
      this.sound.play(pickup.soundEffect.key, { volume: pickup.soundEffect.volume });
      let pickupEffect = new Effect({ scene: this, data: this.effectsData, type: pickup.animationEffect, x: x, y: y, height: displayHeight * 1.5 });
      pickupEffect.onAnimationComplete(effect => { effect.destroy(); });
    });
  }

  /** Public method called to set the physics for the projectiles and the enemies currently in the game scene. */
  setProjectileEnemyCollision()
  {
    this.physics.add.overlap(this.projectiles, this.enemies, (projectileSprite, enemySprite) => 
    {
      let enemyData = enemySprite.__enemy;
      enemyData.numberOfHits += 1;
      projectileSprite.destroy();
      this.projectiles.remove(projectileSprite, true, true);
      this.sound.play(enemyData.hitSoundEffect.key, { volume: enemyData.hitSoundEffect.volume });

      if(enemyData.numberOfHits === enemyData.maxNumberOfHits)
      {
        enemyData.destroy();
        this.enemies.remove(enemySprite, true, true);
        let { x, y, displayHeight } = enemySprite;
        let deathEffect = new Effect({ scene: this, data: this.effectsData, type: enemySprite.__enemy.deathAnimation, x: x, y: y, height: displayHeight * 1.5 });
        deathEffect.onAnimationComplete(effect => 
        {
          effect.destroy();
          this.updateScore({ amount: enemySprite.__enemy.score });
        });
      }
      else
      {
        enemySprite.setTint(0xff0000);
        this.time.delayedCall(100, () => { enemySprite.clearTint(); });
      }
    });
  }

  /** Public method called to spawn a new enemy into the Game Scene when needed. */
  spawnEnemy()
  {
    let enemyData = this.enemySpawnQueue.shift();
    let spawnX = device.screenHeight;
    let spawnPosition = 0.5;

    if(enemyData.spawnPosition === -1) spawnPosition = Math.floor((Math.random() * (0.75 - 0.2) + 0.2) * 100) / 100;
    else spawnPosition = enemyData.spawnPosition;
    let spawnY = device.screenWidth * spawnPosition;
    
    let enemy = new Enemy({ scene: this, data: this.enemyData, type: enemyData.type, x: spawnX, y: spawnY });
    this.enemies.add(enemy.sprite);
    enemy.sprite.__enemy = enemy;
    this.physics.add.existing(enemy.sprite);
  }

  /** Public method called to spawn a new enemy into the Game Scene when needed. */
  spawnPickup()
  {
    let pickupData = this.pickupSpawnQueue.shift();
    let spawnX = device.screenHeight;
    let spawnPosition = 0.5;

    if(pickupData.spawnPosition === -1) spawnPosition = Math.floor((Math.random() * (0.75 - 0.2) + 0.2) * 100) / 100;
    else spawnPosition = pickupData.spawnPosition;
    let spawnY = device.screenWidth * spawnPosition;

    let pickup = new Pickup({ scene: this, data: this.pickupData, type: pickupData.type, x: spawnX, y: spawnY });
    this.pickups.add(pickup.sprite);
    pickup.sprite.__pickup = pickup;

    this.physics.add.existing(pickup.sprite);
  }

  /** Main phaser update loop for the game scene. */
  update(_time, delta) 
  {
    if(!typechecker.check({ type: 'number', value: delta })) console.error(this.errors.deltaTypeError);
    this.elapsedTime += delta;

    this.updateBackground({ delta: delta });
    this.plane.update({ joystick: this.hud.joystick, delta: delta });
    this.hud.shootButton.update({ delta: delta });

    this.updateEnemies({ delta: delta });
    this.updatePickups({ delta: delta });
    this.updateProjectiles({ delta: delta });

    if(this.checkForLevelComplete() === true && this.levelComplete === false) this.gameOver({ state: 'alive' })
  }

  /** Public method called during the update loop of the game scene to update the moving background. */
  updateBackground({ delta } = {})
  {
    if(!typechecker.check({ type: 'number', value: delta })) console.error(this.errors.deltaTypeError);
    let backgroundScrollSpeed = device.screenHeight / 8;
    this.background1.x -= (backgroundScrollSpeed * delta) / 1000;
    this.background2.x -= (backgroundScrollSpeed * delta) / 1000;
    if(this.background1.x <= -device.screenHeight) this.background1.x = (this.background2.x + device.screenHeight)-2;
    if(this.background2.x <= -device.screenHeight) this.background2.x = (this.background1.x + device.screenHeight)-2;
  }

  /** Public method called during the update loop of the game scene to update all current enemies. Handles enemy to plane collision. */
  updateEnemies({ delta } = {})
  {
    if(!typechecker.check({ type: 'number', value: delta })) console.error(this.errors.deltaTypeError);
    while(this.enemySpawnQueue.length > 0 && this.elapsedTime >= this.enemySpawnQueue[0].spawnTime) this.spawnEnemy();
    Phaser.Actions.Call(this.enemies.getChildren(), sprite => 
    {
      let enemy = sprite.__enemy;
      if(!enemy) return;
      enemy.update({ delta: delta });
      if(enemy.isOffScreen()) 
      {
        enemy.destroy({ shootTimer: enemy.shootTimer });
        this.enemies.remove(sprite, true, true);
      }
    });
  }

  /** Public method called during the update loop of the game scene to update all current pickups. Handles pickup to plane collision. */
  updatePickups({ delta } = {})
  {
    if(!typechecker.check({ type: 'number', value: delta })) console.error(this.errors.deltaTypeError);
    while(this.pickupSpawnQueue.length > 0 && this.elapsedTime >= this.pickupSpawnQueue[0].spawnTime) this.spawnPickup();
    Phaser.Actions.Call(this.pickups.getChildren(), sprite => 
    {
      let pickup = sprite.__pickup;
      if(!pickup) return;
      pickup.update({ delta: delta });
      if(pickup.isOffScreen()) 
      {
        pickup.destroy();
        this.pickups.remove(sprite, true, true);
      }
    });
  }

  /** Public method called during the game scene periodically when the user's score needs to be updated. */
  updateScore({ amount } = {})
  {
    if(!typechecker.check({ type: 'number', value: amount })) console.error(this.errors.amountTypeError);
    this.score += amount;
    this.hud.scoreText.setText(`Score: ${this.score}`);
  }

  /** Public method called during the update loop of the game scene to update all current projectiles. */
  updateProjectiles({ delta } = {})
  {
    if(!typechecker.check({ type: 'number', value: delta })) console.error(this.errors.deltaTypeError);

    Phaser.Actions.Call(this.projectiles.getChildren(), projectileSprite => 
    {
      let projectile = { sprite: projectileSprite };
      projectile.update = Projectile.prototype.update;
      projectile.isOffScreen = Projectile.prototype.isOffScreen;
      projectile.destroy = Projectile.prototype.destroy;

      projectile.update({ delta: delta, speed: projectileSprite.__projectile.speed, direction: projectileSprite.__projectile.direction });
      if(projectile.isOffScreen({ direction: projectileSprite.__projectile.direction})) 
      {
        projectile.destroy();
        this.projectiles.remove(projectileSprite, true, true);
      }
    });
    
    Phaser.Actions.Call(this.enemyProjectiles.getChildren(), projectileSprite => 
    {
      let projectile = { sprite: projectileSprite };
      projectile.update = Projectile.prototype.update;
      projectile.isOffScreen = Projectile.prototype.isOffScreen;
      projectile.destroy = Projectile.prototype.destroy;

      projectile.update({ delta: delta, speed: projectileSprite.__projectile.speed, direction: projectileSprite.__projectile.direction });
      if(projectile.isOffScreen({ direction: projectileSprite.__projectile.direction})) 
      {
        projectile.destroy();
        this.enemyProjectiles.remove(projectileSprite, true, true);
      }
    }); 
  }
}

///////////////////////////////////////////////////////////