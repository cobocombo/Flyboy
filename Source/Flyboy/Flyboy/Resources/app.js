///////////////////////////////////////////////////////////
// SCENES
///////////////////////////////////////////////////////////

// class SplashScene extends Phaser.Scene 
// {
//   constructor() 
//   {
//     super('SplashScene');
//   }

//   create() 
//   {
//     this.cameras.main.setBackgroundColor('#00ff00');
//     setTimeout(() => { this.scene.start('MainMenuScene'); }, 2000);
//   }
// }

class MainMenuScene extends Phaser.Scene 
{
  constructor() 
  {
    super('MainMenuScene');
  }

  preload()
  {
    this.load.image('background', 'background.png');
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

    setTimeout(() => { this.scene.start('GameScene'); }, 2000);
  }
}

class GameScene extends Phaser.Scene 
{
  background;
  bullets;
  bulletTimer;
  joystick;
  plane;
  shootButton;

  constructor() 
  {
    super('GameScene');
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

    this.plane = new Plane({ scene: this });
    this.joystick = new Joystick({ scene: this });
    this.shootButton = new ShootButton({ scene: this, plane: this.plane });

    this.bullets = this.add.group();
    this.bulletTimer = 0;

    const x = 20 + (this.plane.sprite.displayWidth / 2);
    const y = (device.screenWidth / 2) - (device.screenWidth / 12);
    this.plane.setPosition({ x: x, y: y });

    const pauseButton = this.add.image(0, 0, 'pause-button');

    const targetHeight = device.screenWidth / 8;
    const scale = targetHeight / pauseButton.height;
    pauseButton.setScale(scale);

    const joystickY = this.joystick.base.y;
    const shootButtonY = this.shootButton.sprite.y;
    const midY = (joystickY + shootButtonY) / 2;

    const joystickX = this.joystick.base.x;
    const shootButtonX = this.shootButton.sprite.x;
    const midX = (joystickX + shootButtonX) / 2;

    this.pauseAlert = new PauseAlertDialog({ scene: this.scene });

    pauseButton.setPosition(midX, midY);
    pauseButton.setInteractive();
    pauseButton.on('pointerdown', () => 
    {
      this.scene.pause();
      this.pauseAlert.present();
    });
  }

  update(time, delta) 
  {
    const joystickState = this.joystick.currentState;
    const speedPerSecond = device.screenWidth / 3;
    const speed = (speedPerSecond * delta) / 1000;

    let newY = this.plane.sprite.y;

    if(joystickState === 'up') 
    {
      newY -= speed;
      this.plane.stopBobbing();
    } 
    else if (joystickState === 'down') 
    {
      newY += speed;
      this.plane.stopBobbing();
    } 
    else this.plane.startBobbing();

    const topBound = 5 + (this.plane.sprite.displayHeight / 2);
    const bottomBound = this.joystick.base.y - this.joystick.base.displayHeight / 1.15;

    newY = Phaser.Math.Clamp(newY, topBound, bottomBound);

    if(joystickState === 'up' || joystickState === 'down') this.plane.setPosition({ x: this.plane.sprite.x, y: newY });

    const scrollSpeed = device.screenWidth / 4;
    const scrollAmount = (scrollSpeed * delta) / 1000;

    this.background1.x -= scrollAmount;
    this.background2.x -= scrollAmount;

    const resetX = -device.screenHeight;

    if(this.background1.x <= resetX) {
      this.background1.x = this.background2.x + device.screenHeight - 3;
    }

    if(this.background2.x <= resetX) {
      this.background2.x = this.background1.x + device.screenHeight - 3;
    }

    this.shootButton.update(delta);

    Phaser.Actions.Call(this.bullets.getChildren(), bulletSprite => 
    {
      if(!bulletSprite || !bulletSprite.active) return;

      const bullet = { sprite: bulletSprite };
      bullet.update = Bullet.prototype.update;
      bullet.isOffScreen = Bullet.prototype.isOffScreen;
      bullet.destroy = Bullet.prototype.destroy;

      bullet.update(delta);
      if(bullet.isOffScreen()) 
      {
        console.log('Removing bullet from scene...')
        bullet.destroy();
        this.bullets.remove(bulletSprite, true, true);
      }
    });
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
      sceneError: 'Plane Error: A valid phaser scene is required.',
      xTypeError: 'Plane Error: Expected type number for x when setting position of plane.',
      yTypeError: 'Plane Error: Expected type number for y when setting position of plane.'
    };

    if(!scene) 
    {
      console.error(this.errors.sceneError);
      return;
    }

    this.scene = scene;
    this.sprite = scene.add.sprite(0, 0, 'plane-fly-1');
    this.sprite.play('plane-fly');
    this.currentAnim = 'plane-fly';

    const targetHeight = device.screenWidth / 6;
    const scale = targetHeight / this.sprite.height;
    this.sprite.setScale(scale);
  }

  setPosition({ x, y } = {}) 
  {
    if(!typeChecker.check({ type: 'number', value: x })) console.error(this.errors.xTypeError);
    if(!typeChecker.check({ type: 'number', value: y })) console.error(this.errors.yTypeError);
    this.sprite.setPosition(x, y);
    this.baseY = y;
  }

  setAnimation(name) 
  {
    if(this.currentAnim !== name) 
    {
      this.sprite.play(name);
      this.currentAnim = name;
    }
  }

  startBobbing() 
  {
    if(this.bobTween) return;

    const bobAmount = this.sprite.displayHeight / 12;
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
}

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
        console.log(this.currentState);
      }
    });

    this.stick.on('dragend', () => 
    {
      this.stick.setPosition(x, this.centerY);
      if(this.currentState !== this.states.idle) 
      {
        this.currentState = this.states.idle;
        console.log(this.states.idle);
      }
    });
  }
}

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
      planeTypeError: 'Shoot Button Erorr: Expected type Plane for plane.',
      sceneError: 'Shoot Button Error: A valid phaser scene is required.'
    };

    if(!scene) 
    {
      console.error(this.errors.sceneError);
      return;
    }

    if(!typeChecker.check({ type: 'plane', value: plane })) console.error(this.errors.planeTypeError);

    this.scene = scene;
    this.plane = plane;
    this.isHeld = false;

    this.shootCooldown = 200;
    this.elapsed = 0;

    const targetHeight = device.screenWidth / 6;
    this.sprite = scene.add.image(0, 0, 'shoot-button');

    const scale = targetHeight / this.sprite.height;
    this.sprite.setScale(scale);

    const padding = 20;
    const screenWidth = device.screenHeight; 
    const screenHeight = device.screenWidth; 

    const x = screenWidth - padding - (this.sprite.displayWidth / 2);
    const y = screenHeight - padding - (this.sprite.displayHeight / 2);

    this.sprite.setPosition(x, y);
    this.sprite.setInteractive();

    this.sprite.on('pointerdown', () => 
    {
      if(!this.isHeld) 
      {
        this.isHeld = true;
        console.log('shoot: hold start');
        this.plane?.setAnimation('plane-shoot');

        const x = this.plane.sprite.x + this.plane.sprite.displayWidth / 2;
        const y = this.plane.sprite.y + this.plane.sprite.displayHeight / 4;
        new Bullet({ scene: this.scene, x, y });

        this.elapsed = -this.shootCooldown / 2;
      }
    });

    const stopShooting = () => 
    {
      if(this.isHeld) 
      {
        console.log('shoot: hold end');
        this.isHeld = false;
        this.plane?.setAnimation('plane-fly');
      }
    };

    this.sprite.on('pointerup', stopShooting);
    this.sprite.on('pointerout', stopShooting);
    this.sprite.on('pointerupoutside', stopShooting);
  }

  update(delta) 
  {
    if(!this.isHeld) return;

    this.elapsed += delta;
    if(this.elapsed >= this.shootCooldown) 
    {
      this.elapsed = 0;

      const x = this.plane.sprite.x + this.plane.sprite.displayWidth / 2;
      const y = this.plane.sprite.y + this.plane.sprite.displayHeight / 4;
      new Bullet({ scene: this.scene, x, y });
    }
  }
}

class Bullet 
{
  constructor({ scene, x, y }) 
  {
    this.scene = scene;

    this.sprite = scene.add.sprite(x, y, 'bullet-1');
    this.sprite.play('bullet-anim');

    const bulletHeight = device.screenWidth / 18;
    const scale = bulletHeight / this.sprite.height;
    this.sprite.setScale(scale);

    scene.bullets.add(this.sprite);
  }

  update(delta) 
  {
    const speed = device.screenWidth * 0.75;
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

///////////////////////////////////////////////////////////

typeChecker.register({ name: 'plane', constructor: Plane });
const game = new ui.PhaserGame({ config: { scene: [ MainMenuScene, GameScene ] } });
app.present({ root: game });

///////////////////////////////////////////////////////////