///////////////////////////////////////////////////////////
// SCENES
///////////////////////////////////////////////////////////

/** Class representing the splash scene of Flyboy. */
class SplashScene extends Phaser.Scene 
{
  /** Creates the splash scene object. */
  constructor() 
  {
    super('SplashScene');
  }

  /** Public method called to create logic and assets for the scene. */
  create() 
  {
    this.cameras.main.setBackgroundColor('#F0DB4F');

    let settings = saveData.getSettings();
    if(settings.soundOn === true) this.sound.mute = false;
    else this.sound.mute = true;

    if(app.isFirstLaunch === true) 
    {
      saveData.addLevelProgress({ id: 1, stars: 0, unlocked: true, score: 0 });
      saveData.addSettings({ soundOn: true });
    }

    let logo = this.add.image(this.scale.width / 2, this.scale.height / 2, 'logo');
    logo.setScale(Math.min(this.scale.width * 0.4 / logo.width, 1));
    logo.setOrigin(0.5);

    this.tweens.add({ targets: logo, alpha: 0, duration: 2000, delay: 1000, ease: 'Linear' });
    setTimeout(() => { this.scene.start('MainMenuScene'); }, 3000);
  }

  /** Public method called to pre-load any assets for the scene or upcoming scenes. */
  preload()
  {
    let font = new FontFace('BulgariaDreams', 'url("Bulgaria Dreams Regular.ttf")');
    font.load().then((loadedFace) => { document.fonts.add(loadedFace);})
    .catch((err) => { console.warn('Font failed to load', err); });

    this.load.audio('menu-music', 'menu-music.mp3');
    this.load.image('logo', 'scriptit-logo.png');
    this.load.json('levels', `levels.json?v=${Date.now()}`);
  }
}

/////////////////////////////////////////////////

/** Class representing the level select scene of Flyboy. */
class LevelSelectScene extends Phaser.Scene 
{
  /** Creates the level select scene object. */
  constructor() 
  {
    super('LevelSelectScene');
  }

  /** Public method called to create logic and assets for the scene. */
  create() 
  {
    this.background = this.add.image(0, 0, 'main-menu-background');
    this.background.setOrigin(0, 0);
    this.background.setDisplaySize(device.screenHeight, device.screenWidth);

    this.add.text(this.scale.width / 2, this.scale.height / 8, 'Select A Level ', 
    {
      fontFamily: 'BulgariaDreams',
      fontSize: `${device.screenWidth / 10}px`,
      color: '#000000',
      align: 'center'
    }).setOrigin(0.5);

    let data = this.cache.json.get('levels');
    let levelData = data.levels;
    levels.load({ levels: levelData });

    let blockSize = device.screenWidth / 8;
    let spacing = blockSize * 0.5;
    let columns = Math.floor((device.screenWidth - spacing) / (blockSize + spacing));
    let startX = spacing;
    let startY = this.scale.height / 4;

    levelData.forEach((level, index) => 
    {
      let col = index % columns;
      let row = Math.floor(index / columns);

      let x = startX + col * (blockSize + spacing) + blockSize / 2;
      let y = startY + row * (blockSize + spacing);

      let unlocked = saveData.isLevelUnlocked({ id: level.id });
      if(unlocked === true) 
      {
        let block = new LevelSelectBlock({ scene: this, x, y, level: level.id, starCount: saveData.getStarsForLevel({ id: level.id }) || 0 });
        block.setInteractive({ useHandCursor: true }).on('pointerup', () => 
        {
          levels.selectLevel({ id: level.id });
          this.scene.start('LoadingScene');
        });
      } 
      else 
      {
        let lock = this.add.image(x, y, 'lock');
        lock.setDisplaySize(blockSize, blockSize);
        lock.setOrigin(0.5);
        lock.setInteractive({ useHandCursor: true });
        lock.on('pointerup', () => 
        {

        });
      }
    });

    let menuMusic = this.sound.get('menu-music');
    if(menuMusic && !menuMusic.isPlaying) menuMusic.play();

    let backButton = this.add.image(20 + (device.screenWidth / 12) / 2, this.scale.height - 20 - (device.screenWidth / 12) / 2, 'back-button');
    backButton.setDisplaySize((device.screenWidth / 12), (device.screenWidth / 12));
    backButton.setOrigin(0.5);
    backButton.setInteractive({ useHandCursor: true });
    backButton.on('pointerup', () => { this.scene.start('MainMenuScene'); });
  }

  /** Public method called to pre-load any assets for the scene or upcoming scenes. */
  preload()
  {
    this.load.image('block', 'block.png');
    this.load.image('star-gold', 'star-gold.png');
    this.load.image('star-silver', 'star-silver.png');
    this.load.image('lock', 'lock.png');
    this.load.image('back-button', 'back-button.png');
  }
}

/////////////////////////////////////////////////

/** Class representing the main menu scene of Flyboy. */
class MainMenuScene extends Phaser.Scene 
{
  settingsTapped;

  /** Creates the main menu scene object. */
  constructor() 
  {
    super('MainMenuScene');
  }

  /** Public method called to create logic and assets for the scene. */
  create() 
  {
    this.background = this.add.image(0, 0, 'main-menu-background');
    this.background.setOrigin(0, 0);
    this.background.setDisplaySize(device.screenHeight, device.screenWidth);

    this.time.delayedCall(1, () => 
    {
      this.add.text(this.scale.width / 2, this.scale.height / 4, 'Flyboy', 
      {
        fontFamily: 'BulgariaDreams',
        fontSize: `${device.screenWidth / 3.5}px`,
        color: '#000000',
        align: 'center'
      }).setOrigin(0.5);
    });

    this.startButton = this.add.image(0, 0, 'start-button');
    this.startButton.setScale((device.screenWidth / 8) / this.startButton.height);
    this.startButton.setPosition(this.cameras.main.centerX, this.cameras.main.height * 0.55);
    this.startButton.setInteractive();
    this.startButton.on('pointerdown', () => { this.scene.start('LevelSelectScene'); });

    this.settingsTapped = false;
    this.settingsDialog = new ui.Dialog({ id: 'settings-dialog', width: `400px`, height: `200px` });
    this.settingsDialog.cancelable = false;
    this.settingsDialog.addEventListener({ event: 'posthide', handler: () => 
    {
      this.settingsTapped = false;
      this.toggleInteractive({ enable: true });
    }});

    this.settingsButton = this.add.image(this.scale.width - 20, this.scale.height - 20, 'settings-button');
    this.settingsButton.setOrigin(1, 1);
    this.settingsButton.setScale((device.screenWidth / 10) / this.settingsButton.height);
    this.settingsButton.setInteractive();
    this.settingsButton.on('pointerdown', () => 
    {
      if(this.settingsTapped === false) 
      {
        this.settingsTapped = true;
        this.toggleInteractive({ enable: false });
        this.settingsDialog.present({ root: new SettingsPage({ sound: this.sound }) });
      }
    });

    if(!this.sound.get('menu-music')) 
    {
      this.menuMusic = this.sound.add('menu-music', { loop: true, volume: 0.5 });
      this.menuMusic.play();
    } 
    else 
    {
      this.menuMusic = this.sound.get('menu-music');
      if(!this.menuMusic.isPlaying) this.menuMusic.play();
    }
  }

  /** Public method called to pre-load any assets for the scene or upcoming scenes. */
  preload()
  {
    this.load.image('main-menu-background', 'blue-sky-clear.png');
    this.load.image('start-button', 'start-button.png');
    this.load.image('settings-button', 'settings-button.png');
  }

  /**
   * Public method called to toggle the interactive events of buttons in the scene. This is so no touch events in a dialog bleed into the scene touches. 
   * * @param {boolean} enable - Value determining if the buttons in main menu scene should be interactive or not.
   */
  toggleInteractive({ enable } = {}) 
  {
    if(enable === true) 
    {
      this.startButton.setInteractive();
      this.settingsButton.setInteractive();
    } 
    else 
    {
      this.startButton.disableInteractive();
      this.settingsButton.disableInteractive();
    }
  }
}

/////////////////////////////////////////////////

/** Class representing the loading scene of Flyboy. */
class LoadingScene extends Phaser.Scene 
{

  /** Creates the loading scene object. */
  constructor() 
  {
    super('LoadingScene');
  }

  /** Public method called to create logic and assets for the scene. */
  create() 
  {
    this.cameras.main.setBackgroundColor('#000000');
    this.time.delayedCall(1, () => 
    {
      let loadingText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Loading', 
      {
        fontFamily: 'BulgariaDreams',
        fontSize: `${device.screenWidth / 4}px`,
        color: '#ffffff'
      }).setOrigin(0.5);

      let dots = ['', '.', '..', '...'];
      let dotIndex = 0;
      let interval = this.time.addEvent({ delay: 400, loop: true,
      callback: () => 
      {
        loadingText.setText('Loading' + dots[dotIndex]);
        dotIndex = (dotIndex + 1) % dots.length;
      }});

      this.time.delayedCall(3500, () => 
      {
        interval.remove(false);
        loadingText.setText('Start ');
        loadingText.setInteractive({ useHandCursor: true });
        loadingText.on('pointerdown', () => { this.scene.start('GameScene'); });
      });
    });

    let menuMusic = this.sound.get('menu-music');
    if(menuMusic) menuMusic.stop();
  }

  /** Public method called to pre-load any assets for the scene or upcoming scenes. */
  preload() 
  {
    this.load.json('planes', `planes.json?v=${Date.now()}`);
    this.load.json('pickups', `pickups.json?v=${Date.now()}`);
    this.load.json('enemies', `enemies.json?v=${Date.now()}`);
  } 
}

/////////////////////////////////////////////////

class GameScene extends Phaser.Scene 
{
  background1;
  background2;
  bullets;
  bulletTimer;
  elapsedTime;
  enemies;
  enemyData;
  enemySpawnQueue;
  joystick;
  levelComplete;
  pauseButton;
  pickups;
  pickupData;
  pickupSpawnQueue;
  plane;
  planeType;
  score;
  shootButton;

  constructor() 
  {
    super('GameScene');

    this.errors = 
    {
      amountTypeError: 'Game Scene Error: Expected type number for amount.',
      deltaTypeError: 'Game Scene Error: Expected type number for delta.'
    }; 
  }

  preload() 
  {
    this.load.image('background', levels.currentLevel.background);
    this.load.image('joystick-base', 'joystick-base.png');
    this.load.image('joystick', 'joystick.png');
    this.load.image('shoot-button', 'shoot-button.png');
    this.load.image('bullet-1', 'bullet-1.png');
    this.load.image('bullet-2', 'bullet-2.png');
    this.load.image('bullet-3', 'bullet-3.png');
    this.load.image('bullet-4', 'bullet-4.png');
    this.load.image('bullet-5', 'bullet-5.png');
    this.load.image('pause-button', 'pause-button.png');

    this.load.image('explosion-1', 'explosion-1.png');
    this.load.image('explosion-2', 'explosion-2.png');
    this.load.image('explosion-3', 'explosion-3.png');
    this.load.image('explosion-4', 'explosion-4.png');
    this.load.image('explosion-5', 'explosion-5.png');

    this.load.image('poof', 'poof.png'); 
    this.load.image('sparkle', 'sparkle.png'); 
    this.load.image('heart', 'heart.png'); 

    this.loadEnemyImages();
    this.loadPlaneImages();
    this.loadPickupImages();

    this.loadEnemySounds();
    this.loadPlaneSounds();
    this.loadPickupSounds();

    this.load.audio('level-failed', 'level-failed.mp3');
    this.load.audio('level-complete', 'level-complete.mp3');
    this.load.audio('background-music', levels.currentLevel.backgroundMusic);
  }

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

    this.sound.play('background-music', { volume: 0.1, loop: true });

    if(!this.anims.exists('bullet-anim')) 
    {
      this.anims.create({
        key: 'bullet-anim',
        frames: [
          { key: 'bullet-1' },
          { key: 'bullet-2' },
          { key: 'bullet-3' },
          { key: 'bullet-4' },
          { key: 'bullet-5' }
        ],
        frameRate: 20,
        repeat: -1
      });
    };

    if(!this.anims.exists('explosion-anim')) 
    {
      this.anims.create({
        key: 'explosion-anim',
        frames: [
          { key: 'explosion-1' },
          { key: 'explosion-2' },
          { key: 'explosion-3' },
          { key: 'explosion-4' },
          { key: 'explosion-5' }
        ],
        frameRate: 35
      });
    };

    this.pickupSpawnQueue = [];
    this.enemySpawnQueue = [];
    this.elapsedTime = 0;
    this.score = 0;
    this.levelComplete = false;

    this.loadEnemyAnimations();
    this.loadPlaneAnimations();
    this.loadPickupAnimations();

    this.enemies = this.physics.add.group();
    this.pickups = this.physics.add.group();
  
    this.enemySpawnQueue = [...levels.currentLevel.enemies].sort((a, b) => a.spawnTime - b.spawnTime);
    this.pickupSpawnQueue = [...levels.currentLevel.pickups].sort((a, b) => a.spawnTime - b.spawnTime);
    
    this.plane = new Plane({ scene: this, data: this.planeData, type: this.planeType });
    this.plane.setPosition({ x: 20 + (this.plane.sprite.displayWidth / 2), y: (device.screenWidth / 2) - (device.screenWidth / 12) });

    this.sound.play(this.plane.idleSoundEffect.key, { volume: this.plane.idleSoundEffect.volume, loop: this.plane.idleSoundEffect.loop });

    this.joystick = new Joystick({ scene: this });
    this.shootButton = new ShootButton({ scene: this, plane: this.plane });

    this.bullets = this.physics.add.group();
    this.bulletTimer = 0;

    this.pauseAlert = new PauseAlertDialog({ scene: this });
    this.levelfailedAlert = new LevelFailedDialog({ scene: this.scene });

    this.pauseButton = this.add.image(0, 0, 'pause-button');
    this.pauseButton.setScale((device.screenWidth / 8) / this.pauseButton.height);
    this.pauseButton.setPosition((this.joystick.base.x + this.shootButton.sprite.x) / 2, (this.joystick.base.y + this.shootButton.sprite.y) / 2);
    this.pauseButton.setInteractive();
    this.pauseButton.setOrigin(0.5);
    this.pauseButton.on('pointerdown', () => 
    {
      let planeIdleSoundEffect = this.sound.get(this.plane.idleSoundEffect.key);
      if(planeIdleSoundEffect) planeIdleSoundEffect.stop();
      let backgroundMusic = this.sound.get('background-music');
      if(backgroundMusic) backgroundMusic.stop();
      this.scene.pause();
      this.pauseAlert.present();
    });

    this.scoreText = this.add.text(0, 0, `Score: ${this.score}`, { fontSize: `${device.screenWidth / 12}px`, fill: '#000000', fontFamily: 'BulgariaDreams', align: 'center' });
    this.scoreText.setOrigin(0.5);
    this.scoreText.setPosition((this.pauseButton.x + this.joystick.base.x) / 2, this.pauseButton.y);

    this.heartsGroup = this.add.group();

    this.updateHeartsHUD = () => 
    {
      const maxHits = this.plane.maxNumberOfHits;
      const hitsTaken = this.plane.numberOfHits;
      const heartsLeft = maxHits - hitsTaken;

      this.heartsGroup.getChildren().forEach((heart, i) => {
        if(i < heartsLeft) {
          heart.clearTint();
          heart.setAlpha(1);
        } else {
          heart.setTint(0x555555);
          heart.setAlpha(0.5);
        }
      });
    };

    const createHearts = () => 
    {
      this.heartsGroup.clear(true, true);

      const maxHits = this.plane.maxNumberOfHits;

      const leftX = this.pauseButton.x + (this.pauseButton.displayWidth / 2);
      const rightX = this.shootButton.sprite.x - (this.shootButton.sprite.displayWidth / 2);
      const availableWidth = rightX - leftX;

      const maxHeartSize = device.screenWidth / 20;
      const totalSpacing = maxHits > 1 ? availableWidth / (maxHits - 1) : 0;
      const heartSpacing = Math.min(totalSpacing, maxHeartSize * 1.2);
      const heartSize = Math.min(maxHeartSize, heartSpacing);

      const totalHeartsWidth = heartSize + (maxHits - 1) * heartSpacing;
      const midX = (leftX + rightX) / 2;
      const horizontalPadding = device.screenWidth / 25;
      let startX = midX - (totalHeartsWidth / 2) + horizontalPadding;

      const heartY = this.pauseButton.y;

      for(let i = 0; i < maxHits; i++) 
      {
        const heart = this.add.image(startX + i * heartSpacing, heartY, 'heart');
        heart.setDisplaySize(heartSize, heartSize);
        heart.setOrigin(0.5);

        // Initially, all hearts are fully visible (alpha=1)
        heart.clearTint();
        heart.setAlpha(1);

        this.heartsGroup.add(heart);
      }
    };

    createHearts();
    this.updateHeartsHUD();

    this.physics.add.overlap(this.bullets, this.enemies, (bulletSprite, enemySprite) => 
    {
      let enemyData = enemySprite.__enemy;

      enemyData.numberOfHits += 1;

      bulletSprite.destroy();
      this.bullets.remove(bulletSprite, true, true);

      this.sound.play(enemyData.hitSoundEffect.key, { volume: enemyData.hitSoundEffect.volume });

      if(enemyData.numberOfHits === enemyData.maxNumberOfHits)
      {
        enemySprite.destroy();
        this.enemies.remove(enemySprite, true, true);

        let { x, y, displayHeight } = enemySprite;
        let explosion = this.add.sprite(x, y, 'explosion-1');
        explosion.setScale(displayHeight / (explosion.height / 2));
        explosion.setDepth(10);
        explosion.play('explosion-anim');
        explosion.on('animationcomplete', (animation, frame) => 
        {
          if(animation.key === 'explosion-anim') explosion.destroy();
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

  checkForLevelComplete() 
  {
    let queuesEmpty = this.enemySpawnQueue.length === 0 && this.pickupSpawnQueue.length === 0;
    let noEnemiesLeft = this.enemies.countActive(true) === 0;
    let noPickupsLeft = this.pickups.countActive(true) === 0;
    let planeAlive = this.plane.currentAnimation !== this.plane.deathAnimation;
    if(queuesEmpty && noEnemiesLeft && noPickupsLeft && planeAlive) return true;
    return false;
  }

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

  loadEnemyImages() 
  {
    this.enemyTypes = [...new Set((levels.currentLevel?.enemies || []).map(e => e.type))];
    this.enemyData = this.cache.json.get('enemies');
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

  loadPlaneImages() 
  {
    this.planeType = 'green-plane';
    this.planeData = this.cache.json.get('planes');
    let selectedPlane = this.planeData.planes.find(plane => plane.name === this.planeType);
    if(selectedPlane && selectedPlane.name && selectedPlane.sprite && selectedPlane.animations) 
    {
      this.load.image(selectedPlane.name, selectedPlane.sprite);
      selectedPlane.animations.forEach(animation => 
      {
        animation.frames.forEach(frame => 
        {
          this.load.image(frame.key, frame.sprite);
        });
      });
    }
  }

  loadPlaneSounds()
  {
    let selectedPlane = this.planeData.planes.find(plane => plane.name === this.planeType);
    selectedPlane.soundEffects.forEach(effect => 
    {
      this.load.audio(effect.key, effect.sound);
    });
  }

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

  loadPickupImages() 
  {
    this.pickupData = this.cache.json.get('pickups');
    this.pickupTypes = [...new Set((levels.currentLevel?.pickups || []).map(p => p.type))];
    this.pickupData.pickups
    .filter(pickup => this.pickupTypes.includes(pickup.name))
    .forEach(pickup => { if(pickup.name && pickup.sprite) this.load.image(pickup.name, pickup.sprite); });
  }

  loadPickupSounds()
  {
    this.pickupData.pickups
    .filter(pickup => this.pickupTypes.includes(pickup.name))
    .forEach(pickup => { this.load.audio(pickup.soundEffect.key, pickup.soundEffect.sound); });
  }

  update(_time, delta) 
  {
    if(!typeChecker.check({ type: 'number', value: delta })) console.error(this.errors.deltaTypeError);
    this.elapsedTime += delta;

    this.updateBackground({ delta: delta });
    this.plane.update({ joystick: this.joystick, delta: delta });
    this.shootButton.update({ delta: delta });

    this.updateBullets({ delta: delta });
    this.updateEnemies({ delta: delta });
    this.updatePickups({ delta: delta });

    if(this.checkForLevelComplete() === true && this.levelComplete === false)
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
          saveData.addLevelProgress({ id: levels.currentLevel.id, stars: starCount, unlocked: true, score: this.score });

          let levelCount = levels.levelCount;
          let nextLevelId = levels.currentLevel.id + 1;
          if(levelCount && nextLevelId <= levelCount) saveData.addLevelProgress({ id: nextLevelId, stars: 0, completed: false, unlocked: true, score: 0 });
        }
      });
    }
  }

  updateBackground({ delta } = {})
  {
    if(!typeChecker.check({ type: 'number', value: delta })) console.error(this.errors.deltaTypeError);
    let backgroundScrollSpeed = device.screenHeight / 8;
    this.background1.x -= (backgroundScrollSpeed * delta) / 1000;
    this.background2.x -= (backgroundScrollSpeed * delta) / 1000;
    if(this.background1.x <= -device.screenHeight) this.background1.x = (this.background2.x + device.screenHeight)-2;
    if(this.background2.x <= -device.screenHeight) this.background2.x = (this.background1.x + device.screenHeight)-2;
  }

  updateBullets({ delta } = {})
  {
    if(!typeChecker.check({ type: 'number', value: delta })) console.error(this.errors.deltaTypeError);

    Phaser.Actions.Call(this.bullets.getChildren(), bulletSprite => 
    {
      if(!bulletSprite || !bulletSprite.active) return;

      let bullet = { sprite: bulletSprite };
      bullet.update = Bullet.prototype.update;
      bullet.isOffScreen = Bullet.prototype.isOffScreen;
      bullet.destroy = Bullet.prototype.destroy;

      bullet.update({ delta: delta });
      if(bullet.isOffScreen()) 
      {
        bullet.destroy();
        this.bullets.remove(bulletSprite, true, true);
      }
    }); 
  }

  updateEnemies({ delta } = {})
  {
    if(!typeChecker.check({ type: 'number', value: delta })) console.error(this.errors.deltaTypeError);

    while(this.enemySpawnQueue.length > 0 && this.elapsedTime >= this.enemySpawnQueue[0].spawnTime) 
    {
      let enemyData = this.enemySpawnQueue.shift();
      let spawnX = device.screenHeight;
      let spawnPosition = 0.5;

      if(enemyData.spawnPosition === -1) spawnPosition = Math.floor((Math.random() * (0.75 - 0.1) + 0.1) * 100) / 100;
      else spawnPosition = enemyData.spawnPosition;
      let spawnY = device.screenWidth * spawnPosition;
      
      let enemy = new Enemy({ scene: this, data: this.enemyData, type: enemyData.type, x: spawnX, y: spawnY });
      this.enemies.add(enemy.sprite);
      enemy.sprite.__enemy = enemy;
      this.physics.add.existing(enemy.sprite);

      this.physics.add.overlap(this.plane.sprite, enemy.sprite, () => 
      {
        this.plane.numberOfHits += 1;

        const { x, y, displayHeight } = enemy.sprite;
        enemy.destroy();
        this.enemies.remove(enemy.sprite, true, true);

        let explosion = this.add.sprite(x, y, 'explosion-1');
        explosion.setScale(displayHeight / (explosion.height / 2));
        explosion.setDepth(10);
        explosion.play('explosion-anim');
        explosion.on('animationcomplete', (animation, frame) => 
        {
          if(animation.key === 'explosion-anim') explosion.destroy();
        });

        this.sound.play(enemy.hitSoundEffect.key, { volume: enemy.hitSoundEffect.volume });
        this.updateHeartsHUD();

        if(this.plane.numberOfHits === this.plane.maxNumberOfHits)
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
        else
        {
          this.plane.sprite.setTint(0xff0000);
          this.time.delayedCall(100, () => { this.plane.sprite.clearTint(); });
        }
      });
    }

    Phaser.Actions.Call(this.enemies.getChildren(), sprite => 
    {
      let enemy = sprite.__enemy;
      if(!enemy) return;
      enemy.update({ delta: delta });

      if(enemy.isOffScreen()) 
      {
        enemy.destroy();
        this.enemies.remove(sprite, true, true);
      }
    });
  }

  updatePickups({ delta } = {})
  {
    if(!typeChecker.check({ type: 'number', value: delta })) console.error(this.errors.deltaTypeError);

    while(this.pickupSpawnQueue.length > 0 && this.elapsedTime >= this.pickupSpawnQueue[0].spawnTime) 
    {
      let pickupData = this.pickupSpawnQueue.shift();
      let spawnX = device.screenHeight;
      let spawnPosition = 0.5;

      if(pickupData.spawnPosition === -1) spawnPosition = Math.floor((Math.random() * (0.75 - 0.1) + 0.1) * 100) / 100;
      else spawnPosition = pickupData.spawnPosition;
      let spawnY = device.screenWidth * spawnPosition;

      let pickup = new Pickup({ scene: this, data: this.pickupData, type: pickupData.type, x: spawnX, y: spawnY });
      this.pickups.add(pickup.sprite);
      pickup.sprite.__pickup = pickup;

      this.physics.add.existing(pickup.sprite);
      this.physics.add.overlap(this.plane.sprite, pickup.sprite, () => 
      {
        const { x, y, displayHeight } = pickup.sprite;

        pickup.destroy();
        this.pickups.remove(pickup.sprite, true, true);

        this.updateScore({ amount: pickup.score });

        this.sound.play(pickup.soundEffect.key, { volume: pickup.soundEffect.volume });

        let sparkle = this.add.sprite(x, y, 'sparkle');
        sparkle.setScale(displayHeight / (sparkle.height / 6));
        sparkle.setDepth(10);

        this.tweens.add
        ({
          targets: sparkle,
          alpha: 0,
          scaleX: 0,
          scaleY: 0,
          duration: 1000,
          ease: 'Power1',
          onComplete: () => { sparkle.destroy(); }
        });
      });
    }

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

  updateScore({ amount } = {})
  {
    if(!typeChecker.check({ type: 'number', value: amount })) console.error(this.errors.amountTypeError);
    this.score += amount;
    this.scoreText.setText(`Score: ${this.score}`);
  }
}

///////////////////////////////////////////////////////////
// DIALOGS
///////////////////////////////////////////////////////////

/** Class representing the dialog shown when the game scene is paused. */
class PauseAlertDialog extends ui.AlertDialog
{
  /**
   * Creates the pause alert dialog object. 
   * @param {Phaser.Scene} scene - Scene instance.
   */
  constructor({ scene } = {})
  {
    super();

    this.cancelable = false;
    this.rowfooter = false;

    this.title = 'Game Paused';
    this.addComponents({ components: [ new ui.Text({ text: 'Select an option to continue' }) ] });

    let resumeButton = new ui.AlertDialogButton({ text: 'Resume', onTap: () => 
    { 
      let planeIdleSoundEffect = scene.sound.get('idle');
      if(planeIdleSoundEffect) planeIdleSoundEffect.play();

      let backgroundMusic = scene.sound.get('background-music');
      if(backgroundMusic) backgroundMusic.play();

      scene.scene.resume(); 
    }});

    let quitButton = new ui.AlertDialogButton({ text: 'Quit', textColor: 'red', onTap: () => 
    { 
      scene.scene.stop('GameScene');
      scene.scene.start('MainMenuScene'); 
    }});

    this.buttons = [ resumeButton, quitButton ];
  }
}

/////////////////////////////////////////////////

/** Class representing the dialog shown when the user failed the level. */
class LevelFailedDialog extends ui.AlertDialog
{
  /**
   * Creates the level failed dialog object. 
   * @param {Phaser.Scene} scene - Scene instance.
   */
  constructor({ scene } = {})
  {
    super();

    if(!scene) console.error('Level Failed Dialog Error: A valid phaser scene is required.');

    this.cancelable = false;
    this.rowfooter = false;

    this.title = 'Level Failed';
    this.addComponents({ components: [ new ui.Text({ text: 'Try better next time!' }) ] });
    this.addComponents({ components: [ new ImageV2({ source: 'x.png', width: '50px', height: '50px' }) ] });

    let mainMenuButton = new ui.AlertDialogButton({ text: 'Main Menu', onTap: () => 
    { 
      scene.stop('GameScene');
      scene.start('MainMenuScene'); 
    }});

    let replayButton = new ui.AlertDialogButton({ text: 'Replay', onTap: () => 
    { 
      scene.stop('GameScene');
      scene.start('LoadingScene'); 
    }});

    this.buttons = [ mainMenuButton, replayButton ];
  }
}

/////////////////////////////////////////////////

/** Class representing the dialog shown when the user completed the level. */
class LevelCompleteDialog extends ui.AlertDialog
{
  errors;

  /**
   * Creates the level completed dialog object. 
   * @param {Phaser.Scene} scene - Scene instance.
   * @param {number} score - Score from the completed level.
   * @param {number} startCount - The number of stars earned from the level, and that should be shown in the dialog.
   */
  constructor({ scene, score, starCount = 0 } = {})
  {
    super();

    this.errors = 
    {
      sceneError: 'Level Complete Dialog Error: A valid phaser scene is required.',
      scoreTypeError: 'Level Complete Dialog Error: Expected type number for score.',
      starCountTypeError: 'Level Complete Dialog Error: Expected type number for starCount.'
    };

    if(!scene) console.error(this.errors.sceneError);
    if(!typeChecker.check({ type: 'number', value: score })) console.error(this.errors.scoreTypeError);
    if(!typeChecker.check({ type: 'number', value: starCount })) console.error(this.errors.starCountTypeError);

    this.cancelable = false;
    this.rowfooter = false;

    this.title = 'Level Complete!';
    this.addComponents({ components: [ new ui.Text({ text: `Score: ${score}` }) ] });

    for(let i = 0; i < 3; i++) 
    {
      let starKey = i < starCount ? 'star-gold.png' : 'star-silver.png';
      let star = new ImageV2({ source: starKey, width: '44px', height: '44px' })
      this.addComponents({ components: [ star ] });
    }

    let newLevelButton = new ui.AlertDialogButton({ text: 'New Level', onTap: () => 
    { 
      scene.stop('GameScene');
      scene.start('LevelSelectScene');
      confetti.remove(); 
    }});

    let mainMenuButton = new ui.AlertDialogButton({ text: 'Main Menu', onTap: () => 
    { 
      scene.stop('GameScene');
      scene.start('MainMenuScene');
      confetti.remove();   
    }});

    let replayButton = new ui.AlertDialogButton({ text: 'Replay', onTap: () => 
    { 
      scene.stop('GameScene');
      scene.start('LoadingScene');
      confetti.remove(); 
    }});

    this.buttons = [ newLevelButton, mainMenuButton, replayButton ];
  }
}

///////////////////////////////////////////////////////////
// ENTITIES
///////////////////////////////////////////////////////////

class Plane 
{
  baseY;
  bobTween;
  currentAnimation;
  deathAnimation;
  deathSoundEffect;
  errors;
  idleAnimation;
  idleSoundEffect;
  maxNumberOfHits;
  numberOfHits;
  scene;
  shootingAnimation;
  shootingRate;
  shootingSoundEffect;
  soundEffects;
  sprite;
  
  constructor({ scene, data, type } = {}) 
  {
    this.errors = 
    {
      deltaTypeError: 'Plane Error: Expected type number for delta',
      joystickTypeError: 'Plane Error: Expected type Joystick for joystick.',
      nameTypeError: 'Expected type string for name.',
      sceneError: 'Plane Error: A valid phaser scene is required.',
      xTypeError: 'Plane Error: Expected type number for x when setting position of plane.',
      yTypeError: 'Plane Error: Expected type number for y when setting position of plane.'
    };

    if(!scene) console.error(this.errors.sceneError);

    let planeDef = data.planes.find(p => p.name === type);
    if(!planeDef) console.error(`Plane Error: No pickup definition found for type "${type}".`);
  
    this.scene = scene;
    this.sprite = scene.add.sprite(0, 0, planeDef.name);
    this.sprite.setScale((device.screenWidth / planeDef.heightScale) / (this.sprite.height));
    this.sprite.play(planeDef.startingAnimation);
    this.scene.physics.add.existing(this.sprite);
    
    this.currentAnimation = planeDef.startingAnimation;
    this.idleAnimation = planeDef.idleAnimation;
    this.shootingAnimation = planeDef.shootingAnimation;
    this.deathAnimation = planeDef.deathAnimation;
    this.numberOfHits = 0;
    this.maxNumberOfHits = planeDef.maxNumberOfHits;

    this.soundEffects = planeDef.soundEffects;
    this.idleSoundEffect = this.soundEffects.find(obj => obj.key === "idle");
    this.shootingSoundEffect = this.soundEffects.find(obj => obj.key === "shoot");
    this.deathSoundEffect = this.soundEffects.find(obj => obj.key === "death");

    this.shootingRate = planeDef.shootingRate;
  }

  setPosition({ x, y } = {}) 
  {
    if(!typeChecker.check({ type: 'number', value: x })) console.error(this.errors.xTypeError);
    if(!typeChecker.check({ type: 'number', value: y })) console.error(this.errors.yTypeError);
    this.sprite.setPosition(x, y);
    this.baseY = y;
  }

  setAnimation({ name } = {}) 
  {
    if(!typeChecker.check({ type: 'string', value: name })) console.error(this.errors.nameTypeError);
    if(this.currentAnimation !== name) 
    {
      this.sprite.play(name);
      this.currentAnimation = name;
    }
  }

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

  stopBobbing() 
  {
    if(this.bobTween) 
    {
      this.bobTween.stop();
      this.bobTween = null;
      this.sprite.setY(this.baseY);
    }
  }

  update({ joystick, delta } = {})
  {
    if(!typeChecker.check({ type: 'joystick', value: joystick })) console.error(this.errors.joystickTypeError);
    if(!typeChecker.check({ type: 'number', value: delta })) console.error(this.errors.deltaTypeError);

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

/////////////////////////////////////////////////

class Joystick 
{
  base;
  centerY;
  currentState;
  dragRange;
  errors;
  scene;
  stick;

  constructor({ scene } = {}) 
  {
    this.errors = 
    {
      sceneError: 'Joystick Error: A valid phaser scene is required.'
    };

    this.states = 
    {
      idle: 'idle',
      up: 'up',
      down: 'down'
    }

    if(!scene) 
    {
      console.error(this.errors.sceneError);
      return;
    }

    this.scene = scene;
    this.currentState = this.states.idle;

    const targetHeight = device.screenWidth / 5;
    this.base = scene.add.image(0, 0, 'joystick-base');
    const baseScale = targetHeight / this.base.height;
    this.base.setScale(baseScale);

    this.stick = scene.add.image(0, 0, 'joystick');
    this.stick.setScale(baseScale);
    this.stick.setInteractive();
    this.scene.input.setDraggable(this.stick);

    const padding = 20;
    const baseDisplayWidth = this.base.displayWidth;
    const baseDisplayHeight = this.base.displayHeight;

    const x = padding + baseDisplayWidth / 2;
    const y = device.screenWidth - padding - baseDisplayHeight / 2;
    this.base.setPosition(x, y);
    this.stick.setPosition(x, y);

    this.centerY = y;
    this.dragRange = baseDisplayHeight / 4;

    this.stick.on('drag', (pointer, dragX, dragY) => 
    {
      const clampedY = Phaser.Math.Clamp(dragY, this.centerY - this.dragRange, this.centerY + this.dragRange);
      this.stick.setPosition(x, clampedY);

      const deltaY = clampedY - this.centerY;

      let newState = this.states.idle;
      if(deltaY < -10) newState = this.states.up;
      else if(deltaY > 10) newState = this.states.down;

      if(newState !== this.currentState) 
      {
        this.currentState = newState;
      }
    });

    this.stick.on('dragend', () => 
    {
      this.stick.setPosition(x, this.centerY);
      if(this.currentState !== this.states.idle) 
      {
        this.currentState = this.states.idle;
      }
    });
  }
}

/////////////////////////////////////////////////

class ShootButton 
{
  errors;
  isHeld;
  plane;
  scene;
  sprite;
  
  constructor({ scene, plane } = {}) 
  {
    this.errors = 
    {
      deltaTypeError: 'Shoot Button Error: Expected type number for delta',
      planeTypeError: 'Shoot Button Erorr: Expected type Plane for plane.',
      sceneError: 'Shoot Button Error: A valid phaser scene is required.'
    };

    if(!scene) console.error(this.errors.sceneError);
    if(!typeChecker.check({ type: 'plane', value: plane })) console.error(this.errors.planeTypeError);

    this.scene = scene;
    this.plane = plane;
    this.isHeld = false;

    this.sprite = scene.add.image(0, 0, 'shoot-button');
    this.sprite.setScale((device.screenWidth / 5) / (this.sprite.height));
    this.sprite.setOrigin(0.5);

    this.shootCooldown = this.plane.shootingRate;
    this.elapsed = 0;

    let x = device.screenHeight - 20 - (this.sprite.displayWidth / 2);
    let y = device.screenWidth - 20 - (this.sprite.displayHeight / 2);
    this.sprite.setPosition(x, y);
    this.sprite.setInteractive();

    this.sprite.on('pointerdown', () => 
    {
      if(!this.isHeld) 
      {
        this.isHeld = true;
        this.plane?.setAnimation({ name: this.plane.shootingAnimation });

        const x = this.plane.sprite.x + this.plane.sprite.displayWidth / 2;
        const y = this.plane.sprite.y + this.plane.sprite.displayHeight / 4;
        let bullet = new Bullet({ scene: this.scene, x, y });
        this.scene.physics.add.existing(bullet.sprite);
        this.scene.sound.play(this.plane.shootingSoundEffect.key, { volume: this.plane.shootingSoundEffect.volume })
        this.elapsed = -this.shootCooldown / 2;
      }
    });

    let stopShooting = () => 
    {
      if(this.isHeld) 
      {
        this.isHeld = false;
        this.plane?.setAnimation({ name: this.plane.idleAnimation });
      }
    };

    this.sprite.on('pointerup', stopShooting);
    this.sprite.on('pointerout', stopShooting);
    this.sprite.on('pointerupoutside', stopShooting);
  }

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
      let bullet = new Bullet({ scene: this.scene, x, y });
      this.scene.sound.play(this.plane.shootingSoundEffect.key, { volume: this.plane.shootingSoundEffect.volume });
      this.scene.physics.add.existing(bullet.sprite);
    }
  }
}

/////////////////////////////////////////////////

class Bullet 
{
  errors;
  scene;
  sprite;

  constructor({ scene, x, y }) 
  {
    this.errors = 
    {
      deltaTypeError: 'Bullet Error: Expected type number for delta',
      sceneError: 'Bullet Error: A valid phaser scene is required.'
    };

    this.scene = scene;

    this.sprite = scene.add.sprite(x, y, 'bullet-1');
    this.sprite.play('bullet-anim');
    this.sprite.setScale((device.screenWidth / 18) / this.sprite.height);

    scene.bullets.add(this.sprite);
  }

  update({ delta } = {}) 
  {
    if(!typeChecker.check({ type: 'number', value: delta })) console.error(this.errors.deltaTypeError);
    let speed = device.screenWidth * 0.75;
    this.sprite.x += (speed * delta) / 1000;
  }

  isOffScreen() 
  {
    return this.sprite.x > device.screenHeight + this.sprite.displayWidth;
  }

  destroy() 
  {
    this.sprite.destroy();
  }
}

/////////////////////////////////////////////////

class Pickup 
{
  errors;
  name;
  scene;
  score;
  soundEffect;
  speed;
  
  constructor({ scene, data, type, x, y }) 
  {
    let pickupDef = data.pickups.find(p => p.name === type);
    if(!pickupDef) console.error(`Pickup Error: No pickup definition found for type "${type}".`);
   
    this.scene = scene;
    this.sprite = scene.add.sprite(x, y, pickupDef.name);
    this.sprite.setScale((device.screenWidth / pickupDef.heightScale) / this.sprite.height);

    this.name = pickupDef.name;
    this.score = pickupDef.score;
    this.soundEffect = pickupDef.soundEffect;

    this.speed = device.screenWidth / pickupDef.speed;
  }

  update({ delta } = {}) 
  {
    this.sprite.x -= (this.speed * delta) / 1000;
  }

  isOffScreen() 
  {
    return this.sprite.x < -this.sprite.displayWidth;
  }

  destroy() 
  {
    this.sprite.destroy();
  }
}

/////////////////////////////////////////////////

/** Class representing an enemy that can be spawned in the game scene. */
class Enemy
{
  errors;
  hitSoundEffect;
  maxNumberOfHits;
  name;
  numberOfHits;
  scene;
  score;
  soundEffects;

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
    if(!typeChecker.check({ type: 'number', value: enemyData.speed })) console.error(this.errors.speedTypeError);
    if(!typeChecker.check({ type: 'number', value: enemyData.maxNumberOfHits })) console.error(this.errors.maxNumberOfHitsTypeError);
    if(!typeChecker.check({ type: 'number', value: enemyData.score })) console.error(this.errors.scoreTypeError);
    if(!typeChecker.check({ type: 'array', value: enemyData.soundEffects })) console.error(this.errors.soundEffectsTypeError);
  
    this.name = enemyData.name;
    this.sprite = scene.add.sprite(x, y, enemyData.name);
    this.sprite.setScale((device.screenWidth / enemyData.height) / this.sprite.height);
    this.sprite.play(enemyData.startingAnimation);
    this.sprite.setFlipX(enemyData.flipX);
    this.speed = device.screenWidth / enemyData.speed;
    this.maxNumberOfHits = enemyData.maxNumberOfHits;
    this.numberOfHits = 0;
    this.score = enemyData.score;
    this.soundEffects = enemyData.soundEffects;
    this.hitSoundEffect = this.soundEffects.find(obj => obj.key === "hit");
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

  /** 
   * Public method to return if the enemy is currently off screen or not.
   * @returns {boolean} Returns true or false if the enemy is off screen or not. 
   */
  isOffScreen() 
  {
    return this.sprite.x < -this.sprite.displayWidth;
  }

  /** Public method to destroy the enemies sprite. */
  destroy() 
  {
    this.sprite.destroy();
  }
} 

/////////////////////////////////////////////////

/** Class representing a level select block object. */
class LevelSelectBlock extends Phaser.GameObjects.Container 
{
  errors;

  /**
   * Creates the level select block object. 
   * @param {Phaser.Scene} scene - Scene instance.
   * @param {number} x - X-coordinate postion.
   * @param {number} y - Y-coordinate postion.
   * @param {number} level - Level number.
   * @param {number} starCount - The number of stars earned from the level previously.
   */
  constructor({ scene, x, y, level, starCount = 0 } = {}) 
  {
    super(scene, x, y);

    this.errors = 
    {
      levelTypeError: 'Level Select Block Error: Expected type number for level.',
      sceneError: 'Level Select Block Error: A valid phaser scene is required.',
      starCountTypeError: 'Level Select Block Error: Expected type number for starCount.',
      xTypeError: 'Level Select Block Error: Expected type number for x.',
      yTypeError: 'Level Select Block Error: Expected type number for y.'
    };

    if(!scene) console.error(this.errors.sceneError);
    if(!typeChecker.check({ type: 'number', value: x })) console.error(this.errors.xTypeError);
    if(!typeChecker.check({ type: 'number', value: y })) console.error(this.errors.yTypeError);
    if(!typeChecker.check({ type: 'number', value: level })) console.error(this.errors.levelTypeError);
    if(!typeChecker.check({ type: 'number', value: starCount })) console.error(this.errors.starCountTypeError);

    let blockSize = device.screenWidth / 8;
    let block = scene.add.sprite(0, 0, 'block');
    block.setScale(blockSize / block.width);
    block.setOrigin(0.5);
    this.add(block);
    this.setSize(blockSize, blockSize);

    let textYOffset = -blockSize * 0.2;
    let levelText = scene.add.text(0, textYOffset, ` ${level} `, 
    {
      fontFamily: 'BulgariaDreams',
      fontSize: `${blockSize / 3.5}px`,
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    this.add(levelText);

    let starSize = blockSize / 5;
    let totalStarWidth = starSize * 3 + 2 * 4;
    let starYOffset = blockSize * 0.2;

    for(let i = 0; i < 3; i++) 
    {
      let starX = -totalStarWidth / 2 + i * (starSize + 4) + starSize / 2;
      let starKey = i < starCount ? 'star-gold' : 'star-silver';
      let star = scene.add.sprite(starX, starYOffset, starKey);
      let starScale = starSize / star.width;
      star.setScale(starScale);
      star.setOrigin(0.5);
      this.add(star);
    }

    scene.add.existing(this);
  }
}

///////////////////////////////////////////////////////////
// PAGES
///////////////////////////////////////////////////////////

class SettingsPage extends ui.Page
{
  sound;

  constructor({ sound } = {})
  {
    super();
    this.sound = sound;
  }

  /** Public method called when the page is initialized. */
  onInit()
  {
    let dialog = app.getComponentById({ id: 'settings-dialog' });
    this.navigationBarTitle = 'Settings';
    this.saveButton = new ui.BarButton({ text: 'Save', onTap: () => 
    { 
      this.saveSettings();
      dialog.dismiss(); 
    }});
    this.navigationBarButtonsRight = [ this.saveButton ];
    this.setupBody();
  }

  setupBody()
  {
    let settings = saveData.getSettings();
    this.soundSwitch = new ui.Switch({ checked: settings.soundOn });

    let settingsList = new ui.List();
    settingsList.addItem({ item: new ui.ListItem({ left: new ui.Icon({ icon: 'ion-ios-musical-notes', size: '32px' }), center: 'Sound', right: this.soundSwitch }) });
    settingsList.addItem({ item: new ui.ListItem({ left: new ui.Icon({ icon: 'ion-ios-information-circle', size: '30px' }), center: 'Version: 1.0' }) });
    this.addComponents({ components: [ settingsList ]});
  }

  saveSettings()
  {
    saveData.addSettings({ soundOn: this.soundSwitch.checked });

    if(this.soundSwitch.checked === true) this.sound.mute = false;
    else this.sound.mute = true;
  }
}

///////////////////////////////////////////////////////////
// LEVELS MODULE
///////////////////////////////////////////////////////////

/** Singleton class representing the global LevelManager. */
class LevelManager 
{
  #errors;
  #levels;
  #currentLevel;
  static #instance = null;

  /** Initializes the LevelManager singleton. */
  constructor() 
  {
    this.#errors = 
    {
      singleInstanceError: 'Level Manager Error: Only one LevelManager instance can exist.',
      levelsTypeError: 'Level Manager Error: Expected an array of level objects.',
      levelIdTypeError: 'Level Manager Error: Expected type number for level ID.',
      levelNotFoundError: 'Level Manager Error: No level found with the specified ID.',
      levelsNotLoadedError: 'Level Manager Error: No levels have been loaded yet.',
    };

    if(LevelManager.#instance) 
    {
      console.error(this.#errors.singleInstanceError);
      return LevelManager.#instance;
    }

    this.#levels = [];
    this.#currentLevel = null;
    LevelManager.#instance = this;
  }

  /** Returns the singleton instance. */
  static getInstance() 
  {
    if(!LevelManager.#instance) LevelManager.#instance = new LevelManager();
    return LevelManager.#instance;
  }

  /**
   * Loads level data from a JSON array.
   * @param {Array<Object>} levels - Array of raw level objects.
   */
  load({ levels } = {}) 
  {
    if(!typeChecker.check({ type: 'array', value: levels })) console.error(this.#errors.levelsTypeError);
    this.#levels = [];

    for(const rawLevel of levels) 
    {
      if(!typeChecker.check({ type: 'object', value: rawLevel })) continue;
      if(rawLevel?.id != null) this.#levels.push(rawLevel);
    }

    this.#currentLevel = null;
  }

  /**
   * Selects the current level by ID.
   * @param {number} id - ID of the level to select.
   */
  selectLevel({ id } = {}) 
  {
    if(!typeChecker.check({ type: 'number', value: id })) console.error(this.#errors.levelIdTypeError);
    let level = this.#levels.find(level => level.id === id);
    if(!level) console.error(this.#errors.levelNotFoundError);
    this.#currentLevel = level;
  }

  /**
   * Gets the currently selected level.
   * @returns {LevelData|null} The current level object.
   */
  get currentLevel() 
  {
    if(!this.#currentLevel) console.warn(this.#errors.levelsNotLoadedError);
    return this.#currentLevel;
  }

  /**
   * Gets all loaded levels.
   * @returns {Array<LevelData>} All level data.
   */
  getAllLevels() 
  {
    return this.#levels;
  }

  get levelCount()
  {
    return this.#levels.length;
  }

  /**
   * Clears all loaded levels and the current level.
   */
  clear() 
  {
    this.#levels = [];
    this.#currentLevel = null;
  }
}

///////////////////////////////////////////////////////////
// SAVE DATA MODULE
///////////////////////////////////////////////////////////

/** Singleton class representing the global SaveDataManager. */
class SaveDataManager 
{
  #storageKeys;
  #errors;
  static #instance = null;

  /** Initializes the LevelManager singleton. */
  constructor() 
  {
    this.#storageKeys = 
    {
      levelProgress: 'level-progress',
      settings: 'settings'
    };

    this.#errors = 
    {
      unlockedTypeError: 'Save Data Manager Error: Expected type boolean for unlocked',
      dataTypeError: 'Save Data Manager Error: Expected type object for data.',
      idTypeError: 'Save Data Manager Error: Expected type number for id.',
      keyTypeError: 'Save Data Manager Error: Expected type string for key.',
      loadingError: 'Save Data Manager Error: There was an issue loading data.',
      removingError: 'Save Data Manager Error: There was an issue removing data.',
      scoreTypeError: 'Save Data Manager Error: Expected type number for score.',
      singleInstanceError: 'Save Data Manager Error: Only one SaveDataManager instance can exist.',
      soundOnTypeError: 'Save Data Manager Error: Expected type boolean for soundOn.',
      starsTypeError: 'Save Data Manager Error: Expected type number for stars.',
      savingError: 'Save Data Manager Error: There was an issue saving data.',
      wrongKeyProvidedError: 'Save Data Manager Error: Wrong key was provided when attempting to retrieve stored data.'
    };

    if(SaveDataManager.#instance) 
    {
      console.error(this.#errors.singleInstanceError);
      return SaveDataManager.#instance;
    }

    SaveDataManager.#instance = this;
  }

  /** Returns the singleton instance. */
  static getInstance() 
  {
    if(!SaveDataManager.#instance) SaveDataManager.#instance = new SaveDataManager();
    return SaveDataManager.#instance;
  }

  /**
   * Add or update a level entry in the save data.
   * @param {string} key - The storage key for the save data.
   * @param {number} id - The level ID to add or update.
   * @param {number} stars - The number of stars for this level.
   * @param {boolean} unlocked - Flag status on if the level is unlocked or not.
   * @param {number} score - Highest score the user earned for the level.
   */
  addLevelProgress({ id, stars, unlocked, score } = {}) 
  {
    if(!typeChecker.check({ type: 'number', value: id })) console.error(this.#errors.idTypeError);
    if(!typeChecker.check({ type: 'number', value: stars })) console.error(this.#errors.starsTypeError);
    if(!typeChecker.check({ type: 'boolean', value: unlocked })) console.error(this.#errors.unlockedTypeError);
    if(!typeChecker.check({ type: 'number', value: score })) console.error(this.#errors.scoreTypeError);

    let data = this.load({ key: this.#storageKeys.levelProgress });
    if(!data) data = { levels: [] };

    let existingLevel = data.levels.find(level => level.id === id);
    if(existingLevel)
    {
      existingLevel.stars = Math.max(existingLevel.stars, stars);
      if(unlocked === true) existingLevel.unlocked = true;
      existingLevel.score = Math.max(existingLevel.score, score);
    } 
    else data.levels.push({ id, stars, unlocked, score });
    this.save({ key: this.#storageKeys.levelProgress, data: data });
  }

  addSettings({ soundOn } = {})
  {
    if(!typeChecker.check({ type: 'boolean', value: soundOn })) console.error(this.#errors.soundOnTypeError);
    let data = this.load({ key: this.#storageKeys.settings });
    if(!data) data = { soundOn: true };
    else data = { soundOn: soundOn };
    this.save({ key: this.#storageKeys.settings, data: data });
  }

  getSettings()
  {
    let data = this.load({ key: this.#storageKeys.settings });
    if(!data) data = { soundOn: false };
    return data;
  }

  /**
   * Check if a specific level is completed.
   * @param {number} id - The level ID to check.
   * @returns {boolean} True if completed, false otherwise.
   */
  isLevelUnlocked({ id } = {}) 
  {
    if(!typeChecker.check({ type: 'number', value: id })) console.error(this.#errors.idTypeError);
  
    let data = this.load({ key: this.#storageKeys.levelProgress });
    if(!data) return false;

    let level = data.levels.find(level => level.id === id);
    return level ? level.unlocked === true : false;
  }

  /**
   * Get the number of stars saved for a specific level.
   * @param {number} id - The level ID to query.
   * @returns {number} Number of stars for the level, or 0 if not found.
   */
  getStarsForLevel({ id } = {}) 
  {
    if(!typeChecker.check({ type: 'number', value: id })) console.error(this.#errors.idTypeError);
    let data = this.load({ key: this.#storageKeys.levelProgress });
    if (!data) return 0;
    let level = data.levels.find(level => level.id === id);
    return level ? level.stars || 0 : 0;
  }

  /**
   * Save JSON-serializable data to local storage.
   * @param {string} key - The storage key.
   * @param {object} data - The data object to store.
   */
  save({ key, data } = {}) 
  {
    if(!typeChecker.check({ type: 'string', value: key })) console.error(this.#errors.keyTypeError);
    if(!typeChecker.check({ type: 'object', value: data })) console.error(this.#errors.dataTypeError);
    try 
    {
      let json = JSON.stringify(data);
      localStorage.setItem(key, json);
    } 
    catch { console.error(this.#errors.savingError); }
  }

  /**
   * Load JSON data from local storage.
   * @param {string} key - The storage key.
   */
  load({ key } = {}) 
  {
    if(!typeChecker.check({ type: 'string', value: key })) console.error(this.#errors.keyTypeError);
    try 
    {
      let json = localStorage.getItem(key);
      if(json === null) return null;
      return JSON.parse(json);
    } 
    catch { console.error(this.#errors.loadingError); }
  }

  /**
   * Remove saved data.
   * @param {string} key - The storage key.
   */
  remove({ key } = {}) 
  {
    if(!typeChecker.check({ type: 'string', value: key })) console.error(this.#errors.keyTypeError);
    try { localStorage.removeItem(key); } 
    catch { console.error(this.#errors.removingError); }
  }
}

///////////////////////////////////////////////////////////

globalThis.levels = LevelManager.getInstance();
globalThis.saveData = SaveDataManager.getInstance();

typeChecker.register({ name: 'scene', constructor: Phaser.Scene });
typeChecker.register({ name: 'plane', constructor: Plane });
typeChecker.register({ name: 'joystick', constructor: Joystick });

const game = new ui.PhaserGame({ 
  config: 
  { 
    type: Phaser.WEBGL,
    scene: [ SplashScene, MainMenuScene, LevelSelectScene, LoadingScene, GameScene ],
    physics: 
    { 
      default: "arcade", 
      arcade: 
      { 
        debug: false
      }
    } 
  }
}); 

app.present({ root: game });

///////////////////////////////////////////////////////////