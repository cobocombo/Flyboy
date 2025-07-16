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
    setTimeout(() => { this.scene.start('MainMenuScene'); }, 2000);
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
    this.load.image('background', 'background.png');
    this.load.json('levels', `levels.json?v=${Date.now()}`);
  }

  create() 
  {
    this.background = this.add.image(0, 0, 'background');
    this.background.setOrigin(0, 0);
    this.background.setDisplaySize(device.screenHeight, device.screenWidth);

    const data = this.cache.json.get('levels');
    levels.load({ levels: data.levels });
    levels.selectLevel({ id: 1 });
    setTimeout(() => { this.scene.start('LoadingScene'); }, 2000);
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
    this.load.image('background', 'background.png');
    this.load.image('start-button', 'start-button.png');
    const font = new FontFace('BulgariaDreams', 'url("Bulgaria Dreams Regular.ttf")');
    font.load().then((loadedFace) => { document.fonts.add(loadedFace);})
      .catch((err) => { console.warn('Font failed to load', err); });
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
    let font = new FontFace('BulgariaDreams', 'url("Bulgaria Dreams Regular.ttf")');
    font.load().then((loadedFace) => { document.fonts.add(loadedFace);})
      .catch((err) => { console.warn('Font failed to load', err); });

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
  shootButton;

  constructor() 
  {
    super('GameScene');

    this.errors = 
    {
      deltaTypeError: 'Game Scene Error: Expected type number for delta'
    }; 
  }

  preload() 
  {
    this.load.image('background', 'background.png');
    this.load.image('plane-fly-1', 'plane-fly-1.png');
    this.load.image('plane-fly-2', 'plane-fly-2.png');
    this.load.image('plane-shoot-1', 'plane-shoot-1.png');
    this.load.image('plane-shoot-2', 'plane-shoot-2.png');
    this.load.image('plane-shoot-3', 'plane-shoot-3.png');
    this.load.image('plane-shoot-4', 'plane-shoot-4.png');
    this.load.image('plane-shoot-5', 'plane-shoot-5.png');
    this.load.image('joystick-base', 'joystick-base.png');
    this.load.image('joystick', 'joystick.png');
    this.load.image('shoot-button', 'shoot-button.png');
    this.load.image('bullet-1', 'bullet-1.png');
    this.load.image('bullet-2', 'bullet-2.png');
    this.load.image('bullet-3', 'bullet-3.png');
    this.load.image('bullet-4', 'bullet-4.png');
    this.load.image('bullet-5', 'bullet-5.png');
    this.load.image('pause-button', 'pause-button.png');

    // Load pickups data and load all images.
    this.pickupData = this.cache.json.get('pickups');
    if(this.pickupData && typeChecker.check({ type: 'array', value: this.pickupData.pickups }))
    {
      this.pickupData.pickups.forEach(pickup => 
      {
        if(pickup.name && pickup.sprite) this.load.image(pickup.name, pickup.sprite);
      });
    }

    // Load enemy data and load all images.
    this.enemyData = this.cache.json.get('enemies');
    if(this.enemyData && typeChecker.check({ type: 'array', value: this.enemyData.enemies }))
    {
      this.enemyData.enemies.forEach(enemy => 
      {
        if(enemy.name && enemy.sprite && enemy.animations)
        {
          this.load.image(enemy.name, enemy.sprite);
          enemy.animations.forEach((animation) => 
          {
            animation.frames.forEach((frame) => 
            {
              this.load.image(frame.key, frame.sprite);
            });
          });
        }
      });
    }
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

    if(!this.anims.exists('plane-fly')) 
    {
      this.anims.create({
        key: 'plane-fly',
        frames: [
          { key: 'plane-fly-1' },
          { key: 'plane-fly-2' }
        ],
        frameRate: 12,
        repeat: -1
      });
    };

    if(!this.anims.exists('plane-shoot')) 
    {
      this.anims.create({
        key: 'plane-shoot',
        frames: [
          { key: 'plane-shoot-1' },
          { key: 'plane-shoot-2' },
          { key: 'plane-shoot-3' },
          { key: 'plane-shoot-4' },
          { key: 'plane-shoot-5' }
        ],
        frameRate: 15,
        repeat: -1
      });
    };

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

    if(this.enemyData && typeChecker.check({ type: 'array', value: this.enemyData.enemies })) 
    {
      this.enemyData.enemies.forEach(enemy => 
      {
        if(enemy.name && enemy.sprite && enemy.animations) 
        {
          enemy.animations.forEach((animation) => 
          {
            const frames = animation.frames.map((frame) => {
              return { key: frame.key };
            });

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

    this.plane = new Plane({ scene: this });
    this.plane.setPosition({ x: 20 + (this.plane.sprite.displayWidth / 2), y: (device.screenWidth / 2) - (device.screenWidth / 12) });

    this.joystick = new Joystick({ scene: this });
    this.shootButton = new ShootButton({ scene: this, plane: this.plane });

    this.bullets = this.add.group();
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

    this.elapsedTime = 0;

    this.pickups = this.add.group();
    this.pickupSpawnQueue = [];

    this.enemies = this.add.group();
    this.enemySpawnQueue = [];
    
    this.level = levels.currentLevel;
    if(this.level && this.level.pickups) this.pickupSpawnQueue = [...this.level.pickups].sort((a, b) => a.spawnTime - b.spawnTime);
    if(this.level && this.level.enemies) this.enemySpawnQueue = [...this.level.enemies].sort((a, b) => a.spawnTime - b.spawnTime);
  }

  update(_time, delta) 
  {
    if(!typeChecker.check({ type: 'number', value: delta })) console.error(this.errors.deltaTypeError);

    this.elapsedTime += delta;
    this.updateBackground({ delta: delta });
    this.plane.update({ joystick: this.joystick, delta: delta });
    this.shootButton.update({ delta: delta });

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

    while(this.pickupSpawnQueue.length > 0 && this.elapsedTime >= this.pickupSpawnQueue[0].spawnTime) 
    {
      let pickupData = this.pickupSpawnQueue.shift();
      let spawnX = device.screenHeight;
      let spawnY = device.screenWidth * pickupData.spawnPosition;
      let pickup = new Pickup({ scene: this, data: this.pickupData, type: pickupData.type, x: spawnX, y: spawnY });
      this.pickups.add(pickup.sprite);
      pickup.sprite.__pickup = pickup;
    }

    while(this.enemySpawnQueue.length > 0 && this.elapsedTime >= this.enemySpawnQueue[0].spawnTime) 
    {
      let enemyData = this.enemySpawnQueue.shift();
      let spawnX = device.screenHeight;
      let spawnY = device.screenWidth * enemyData.spawnPosition;
      let enemy = new Enemy({ scene: this, data: this.enemyData, type: enemyData.type, x: spawnX, y: spawnY });
      this.enemies.add(enemy.sprite);
      enemy.sprite.__enemy = enemy;
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

  updateBackground({ delta } = {})
  {
    if(!typeChecker.check({ type: 'number', value: delta })) console.error(this.errors.deltaTypeError);
    let backgroundScrollSpeed = device.screenWidth / 4;
    this.background1.x -= (backgroundScrollSpeed * delta) / 1000;
    this.background2.x -= (backgroundScrollSpeed * delta) / 1000;
    if(this.background1.x <= -device.screenHeight) this.background1.x = this.background2.x + device.screenHeight - 5;
    if(this.background2.x <= -device.screenHeight) this.background2.x = this.background1.x + device.screenHeight - 5;
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
    this.addComponents({ components: [ new ui.Text({ type: 'header-3', text: 'Game Paused' }) ] });

    this.rowfooter = true;
    let quitButton = new ui.AlertDialogButton({ text: 'Quit', textColor: 'red', onTap: () => 
    { 
      scene.stop('GameScene');
      scene.start('MainMenuScene'); 
    }});
    let resumeButton = new ui.AlertDialogButton({ text: 'Resume', onTap: () => { scene.resume(); } });
    this.buttons = [ quitButton, resumeButton ];
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
  errors;
  scene;
  sprite;
  
  constructor({ scene } = {}) 
  {
    this.errors = 
    {
      deltaTypeError: 'Plane Error: Expected type number for delta',
      joystickTypeError: 'Plane Error: Expected type Joystick for joystick.',
      nameTypeError: 'Expected type string for name',
      sceneError: 'Plane Error: A valid phaser scene is required.',
      xTypeError: 'Plane Error: Expected type number for x when setting position of plane.',
      yTypeError: 'Plane Error: Expected type number for y when setting position of plane.'
    };

    if(!scene) console.error(this.errors.sceneError);
  
    this.scene = scene;
    this.sprite = scene.add.sprite(0, 0, 'plane-fly-1');
    this.sprite.setScale((device.screenWidth / 6) / (this.sprite.height));
    this.sprite.play('plane-fly');
    this.currentAnim = 'plane-fly';
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
        this.plane?.setAnimation({ name: 'plane-shoot' });

        const x = this.plane.sprite.x + this.plane.sprite.displayWidth / 2;
        const y = this.plane.sprite.y + this.plane.sprite.displayHeight / 4;
        new Bullet({ scene: this.scene, x, y });

        this.elapsed = -this.shootCooldown / 2;
      }
    });

    let stopShooting = () => 
    {
      if(this.isHeld) 
      {
        this.isHeld = false;
        this.plane?.setAnimation({ name: 'plane-fly' });
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
      new Bullet({ scene: this.scene, x: x, y: y });
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
  
  constructor({ scene, data, type, x, y }) 
  {
    let pickupDef = data.pickups.find(p => p.name === type);
    if(!pickupDef) console.error(`Pickup Error: No pickup definition found for type "${type}".`);
   
    this.scene = scene;
    this.sprite = scene.add.sprite(x, y, pickupDef.name);
    this.sprite.setScale((device.screenWidth / pickupDef.heightScale) / this.sprite.height);
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
  scene;

  constructor({ scene, data, type, x, y }) 
  {
    let enemyDef = data.enemies.find(e => e.name === type);
    if(!enemyDef) console.error(`Pickup Error: No pickup definition found for type "${type}".`);
    
    this.scene = scene;
    this.sprite = scene.add.sprite(x, y, enemyDef.name);
    this.sprite.setScale((device.screenWidth / enemyDef.heightScale) / this.sprite.height);

    if(enemyDef.flipX) this.sprite.setFlipX(true);
    if(enemyDef.startingAnimation) this.sprite.play(enemyDef.startingAnimation);
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

///////////////////////////////////////////////////////////
// DATA MODELS
///////////////////////////////////////////////////////////

/**
 * Class representing the data for a single level.
 */
class LevelData
{
  #errors;

  /**
   * Creates a new LevelData object.
   * @param {object} level - The level object from the JSON file.
   */
  constructor(level = {}) 
  {
    this.#errors = 
    {
      invalidType: 'LevelData Error: Expected an object for level.',
      idMissing: 'LevelData Error: Level ID is required and must be a number.',
      enemiesType: 'LevelData Error: Enemies must be an array.',
      obstaclesType: 'LevelData Error: Obstacles must be an array.',
      pickupsType: 'LevelData Error: Pickups must be an array.',
    };

    if(!typeChecker.check({ type: 'object', value: level })) console.error(this.#errors.invalidType);
    if(!typeChecker.check({ type: 'number', value: level.id })) console.error(this.#errors.idMissing);
    if(!typeChecker.check({ type: 'array', value: level.enemies })) console.error(this.#errors.enemiesType);
    if(!typeChecker.check({ type: 'array', value: level.obstacles })) console.error(this.#errors.obstaclesType);
    if(!typeChecker.check({ type: 'array', value: level.pickups })) console.error(this.#errors.pickupsType);
   
    this.id = level.id;
    this.background = level.background;
    this.enemies = level.enemies;
    this.obstacles = level.obstacles;
    this.pickups = level.pickups;
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
      const level = new LevelData(rawLevel);
      if(level?.id != null) this.#levels.push(level);
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

globalThis.levels = LevelManager.getInstance();
typeChecker.register({ name: 'plane', constructor: Plane });
typeChecker.register({ name: 'joystick', constructor: Joystick });

const game = new ui.PhaserGame({ config: { scene: [ SplashScene, MainMenuScene, LevelSelectScene, LoadingScene, GameScene ] } });
app.present({ root: game });

///////////////////////////////////////////////////////////