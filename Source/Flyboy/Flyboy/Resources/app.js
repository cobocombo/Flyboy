///////////////////////////////////////////////////////////
// SCENES
///////////////////////////////////////////////////////////

class SplashScene extends Phaser.Scene 
{
  constructor() 
  {
    super('SplashScene');
  }

  preload()
  {
    
  }

  create() 
  {
    setTimeout(() => { this.scene.start('MainMenuScene'); }, 1000);
  }
}

/////////////////////////////////////////////////

class LevelSelectScene extends Phaser.Scene 
{
  constructor() 
  {
    super('LevelSelectScene');
  }

  preload()
  {
    this.load.image('background', 'blue-sky-clear.png');
    this.load.json('levels', `levels.json?v=${Date.now()}`);
    this.load.image('block', 'block.png');
    this.load.image('star', 'star.png');
    this.load.image('star-filled', 'star-filled.png');
  }

  create() 
  {
    this.background = this.add.image(0, 0, 'background');
    this.background.setOrigin(0, 0);
    this.background.setDisplaySize(device.screenHeight, device.screenWidth);

    const data = this.cache.json.get('levels');
    levels.load({ levels: data.levels });
    levels.selectLevel({ id: 1 });

    let block = new LevelSelectBlock(this, this.cameras.main.centerX, this.cameras.main.centerY, 1);
    setTimeout(() => { this.scene.start('LoadingScene'); }, 3000);
  }
}

/////////////////////////////////////////////////

class MainMenuScene extends Phaser.Scene 
{
  constructor() 
  {
    super('MainMenuScene');
  }

  preload()
  {
    this.load.image('background', 'blue-sky-clear.png');
    this.load.image('start-button', 'start-button.png');
  }

  create() 
  {
    this.background = this.add.image(0, 0, 'background');
    this.background.setOrigin(0, 0);
    this.background.setDisplaySize(device.screenHeight, device.screenWidth);

    setTimeout(() => 
    {
      this.add.text(this.scale.width / 2, this.scale.height / 4, 'Flyboy', 
      {
        fontFamily: 'BulgariaDreams',
        fontSize: `${device.screenWidth / 3.5}px`,
        color: '#000000',
        align: 'center'
      }).setOrigin(0.5);
    },1);

    const startButton = this.add.image(0, 0, 'start-button');
    const targetHeight = device.screenWidth / 8;
    const scale = targetHeight / startButton.height;
    startButton.setScale(scale);

    const x = this.cameras.main.centerX;
    const y = this.cameras.main.height * 0.75;
    startButton.setPosition(x, y);

    startButton.setInteractive();
    startButton.on('pointerdown', () => {
      this.scene.start('LevelSelectScene');
    });
  }
}

/////////////////////////////////////////////////

class LoadingScene extends Phaser.Scene 
{
  constructor() 
  {
    super('LoadingScene');
  }

  preload() 
  {
    this.load.json('planes', `planes.json?v=${Date.now()}`);
    this.load.json('pickups', `pickups.json?v=${Date.now()}`);
    this.load.json('enemies', `enemies.json?v=${Date.now()}`);
  }

  create() 
  {
    this.cameras.main.setBackgroundColor('#000000');
    setTimeout(() => 
    {
      let loadingText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Loading', 
      {
        fontFamily: 'BulgariaDreams',
        fontSize: `${device.screenWidth / 4}px`,
        color: '#ffffff'
      }).setOrigin(0.5);

      let dots = ['', '.', '..', '...'];
      let dotIndex = 0;
      let interval = this.time.addEvent({
        delay: 400,
        loop: true,
        callback: () => 
        {
          loadingText.setText('Loading' + dots[dotIndex]);
          dotIndex = (dotIndex + 1) % dots.length;
        }
      });

      this.time.delayedCall(3500, () => 
      {
        interval.remove(false);
        loadingText.setText('Start ');
        loadingText.setInteractive({ useHandCursor: true });
        loadingText.on('pointerdown', () => { this.scene.start('GameScene'); });
      });
    },1);
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

    this.loadEnemyImages();
    this.loadPlaneImages();
    this.loadPickupImages();
  }

  create() 
  {
    this.background1 = this.add.image(0, 0, 'background');
    this.background2 = this.add.image(0, 0, 'background');
    this.background1.setDisplaySize(device.screenHeight, device.screenWidth);
    this.background2.setDisplaySize(device.screenHeight, device.screenWidth);
    this.background1.setOrigin(0, 0);
    this.background2.setOrigin(0, 0);
    this.background1.setPosition(0, 0);
    this.background2.setPosition(device.screenHeight - 3, 0);

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

    this.loadEnemyAnimations();
    this.loadPlaneAnimations();
    this.loadPickupAnimations();

    this.enemies = this.physics.add.group();
    this.pickups = this.physics.add.group();
  
    this.enemySpawnQueue = [...levels.currentLevel.enemies].sort((a, b) => a.spawnTime - b.spawnTime);
    this.pickupSpawnQueue = [...levels.currentLevel.pickups].sort((a, b) => a.spawnTime - b.spawnTime);
    
    this.plane = new Plane({ scene: this, data: this.planeData, type: this.planeType });
    this.plane.setPosition({ x: 20 + (this.plane.sprite.displayWidth / 2), y: (device.screenWidth / 2) - (device.screenWidth / 12) });

    this.joystick = new Joystick({ scene: this });
    this.shootButton = new ShootButton({ scene: this, plane: this.plane });

    this.bullets = this.physics.add.group();
    this.bulletTimer = 0;

    this.pauseAlert = new PauseAlertDialog({ scene: this.scene });
    this.pauseButton = this.add.image(0, 0, 'pause-button');
    this.pauseButton.setScale((device.screenWidth / 8) / this.pauseButton.height);
    this.pauseButton.setPosition((this.joystick.base.x + this.shootButton.sprite.x) / 2, (this.joystick.base.y + this.shootButton.sprite.y) / 2);
    this.pauseButton.setInteractive();
    this.pauseButton.on('pointerdown', () => 
    {
      this.scene.pause();
      this.pauseAlert.present();
    });

    this.scoreText = this.add.text(0, 0, `Score: ${this.score}`, { fontSize: `${device.screenWidth / 12}px`, fill: '#000000', fontFamily: 'BulgariaDreams', align: 'center' });
    this.scoreText.setOrigin(0.5);
    this.scoreText.setPosition((this.pauseButton.x + this.joystick.base.x) / 2, this.pauseButton.y);

    this.physics.add.overlap(this.bullets, this.enemies, (bulletSprite, enemySprite) => 
    {
      let enemyData = enemySprite.__enemy;

      enemyData.numberOfHits += 1;

      bulletSprite.destroy();
      this.bullets.remove(bulletSprite, true, true);

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
  }

  updateBackground({ delta } = {})
  {
    if(!typeChecker.check({ type: 'number', value: delta })) console.error(this.errors.deltaTypeError);
    let backgroundScrollSpeed = device.screenHeight / 8;
    this.background1.x -= (backgroundScrollSpeed * delta) / 1000;
    this.background2.x -= (backgroundScrollSpeed * delta) / 1000;
    if(this.background1.x <= -device.screenHeight) this.background1.x = this.background2.x + device.screenHeight - 5;
    if(this.background2.x <= -device.screenHeight) this.background2.x = this.background1.x + device.screenHeight - 5;
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

        if(this.plane.numberOfHits === this.plane.maxNumberOfHits)
        {
          this.plane?.setAnimation({ name: this.plane.deathAnimation });
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

class PauseAlertDialog extends ui.AlertDialog
{
  constructor({ scene } = {})
  {
    super();
    this.cancelable = false;
    this.title = 'Game Paused';
    this.addComponents({ components: [ new ui.Text({ text: 'Select an option to continue' }) ] });

    this.rowfooter = false;
    let resumeButton = new ui.AlertDialogButton({ text: 'Resume', onTap: () => { scene.resume(); } });
    let quitButton = new ui.AlertDialogButton({ text: 'Quit', textColor: 'red', onTap: () => 
    { 
      scene.stop('GameScene');
      scene.start('MainMenuScene'); 
    }});
    this.buttons = [ resumeButton, quitButton ];
  }
}

///////////////////////////////////////////////////////////
// ENTITIES
///////////////////////////////////////////////////////////

class Plane 
{
  baseY;
  bobTween;
  currentAnim;
  deathAnim;
  errors;
  idleAnimation;
  maxNumberOfHits;
  numberOfHits;
  scene;
  shootingAnimation;
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
    
    this.currentAnim = planeDef.startingAnimation;
    this.idleAnimation = planeDef.idleAnimation;
    this.shootingAnimation = planeDef.shootingAnimation;
    this.deathAnimation = planeDef.deathAnimation;
    this.numberOfHits = 0;
    this.maxNumberOfHits = planeDef.maxNumberOfHits;
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
    if(this.currentAnim !== name) 
    {
      this.sprite.play(name);
      this.currentAnim = name;
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

    const targetHeight = device.screenWidth / 6;
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
    this.sprite.setScale((device.screenWidth / 6) / (this.sprite.height));

    this.shootCooldown = 250;
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
  scene;
  score;
  
  constructor({ scene, data, type, x, y }) 
  {
    let pickupDef = data.pickups.find(p => p.name === type);
    if(!pickupDef) console.error(`Pickup Error: No pickup definition found for type "${type}".`);
   
    this.scene = scene;
    this.sprite = scene.add.sprite(x, y, pickupDef.name);
    this.sprite.setScale((device.screenWidth / pickupDef.heightScale) / this.sprite.height);

    this.score = pickupDef.score;
  }

  update({ delta } = {}) 
  {
    let speed = device.screenWidth * 0.2;
    this.sprite.x -= (speed * delta) / 1000;
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

class Enemy
{
  errors;
  maxNumberOfHits;
  numberOfHits;
  scene;
  score;

  constructor({ scene, data, type, x, y }) 
  {
    let enemyDef = data.enemies.find(e => e.name === type);
    if(!enemyDef) console.error(`Pickup Error: No pickup definition found for type "${type}".`);
    
    this.scene = scene;
    this.sprite = scene.add.sprite(x, y, enemyDef.name);
    this.sprite.setScale((device.screenWidth / enemyDef.heightScale) / this.sprite.height);

    if(enemyDef.flipX) this.sprite.setFlipX(true);
    if(enemyDef.startingAnimation) this.sprite.play(enemyDef.startingAnimation);

    this.score = enemyDef.score;
    this.numberOfHits = 0;
    this.maxNumberOfHits = enemyDef.maxNumberOfHits;
  }

  update({ delta } = {}) 
  {
    let speed = device.screenWidth * 0.2;
    this.sprite.x -= (speed * delta) / 1000;
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

class LevelSelectBlock extends Phaser.GameObjects.Container 
{
  constructor(scene, x, y, levelNumber, starCount = 0) 
  {
    super(scene, x, y);

    let blockSize = device.screenWidth / 6;
    let block = scene.add.sprite(0, 0, 'block');
    block.setScale(blockSize / block.width);
    block.setOrigin(0.5);
    this.add(block);

    let textYOffset = -blockSize * 0.2;
    let levelText = scene.add.text(0, textYOffset, ` ${levelNumber} `, 
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
      let star = scene.add.sprite(starX, starYOffset, 'star');
      let starScale = starSize / star.width;
      star.setScale(starScale);
      star.setOrigin(0.5);
      this.add(star);
    }

    scene.add.existing(this);
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

let font = new FontFace('BulgariaDreams', 'url("Bulgaria Dreams Regular.ttf")');
font.load().then((loadedFace) => { document.fonts.add(loadedFace);})
.catch((err) => { console.warn('Font failed to load', err); });

globalThis.levels = LevelManager.getInstance();
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