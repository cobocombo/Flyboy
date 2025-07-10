///////////////////////////////////////////////////////////
// SCENES
///////////////////////////////////////////////////////////

class SplashScene extends Phaser.Scene 
{
  constructor() 
  {
    super('SplashScene');
  }

  create() 
  {
    this.cameras.main.setBackgroundColor('#00ff00');
    setTimeout(() => { this.scene.start('MainMenuScene'); }, 2000);
  }
}

class MainMenuScene extends Phaser.Scene 
{
  constructor() 
  {
    super('MainMenuScene');
  }

  create() 
  {
    this.cameras.main.setBackgroundColor('#0000ff');
    setTimeout(() => { this.scene.start('GameScene'); }, 2000);
  }
}

class GameScene extends Phaser.Scene 
{
  background;
  joystick;
  plane;

  constructor() 
  {
    super('GameScene');
  }

  preload() 
  {
    this.load.image('background', 'background.png');
    this.load.image('plane-fly-1', 'plane-fly-1.png');
    this.load.image('joystick-base', 'joystick-base.png');
    this.load.image('joystick', 'joystick.png');
  }

  create() 
  {
    this.background = this.add.image(device.screenHeight / 2, device.screenWidth / 2, 'background');
    this.background.setDisplaySize(device.screenHeight , device.screenWidth);

    this.plane = new Plane({ scene: this });
    
    const x = 20 + (this.plane.sprite.displayWidth / 2);
    const y = (device.screenWidth / 2) - (device.screenWidth / 12);

    this.plane.setPosition({ x: x, y: y });

    this.joystick = new Joystick({ scene: this });
  }
}

///////////////////////////////////////////////////////////
// ENTITIES
///////////////////////////////////////////////////////////

class Plane 
{
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

    const targetHeight = device.screenWidth / 6;
    const scale = targetHeight / this.sprite.height;
    this.sprite.setScale(scale);
  }

  setPosition({ x, y } = {}) 
  {
    if(!typeChecker.check({ type: 'number', value: x })) console.error(this.errors.xTypeError);
    if(!typeChecker.check({ type: 'number', value: y })) console.error(this.errors.yTypeError);
    this.sprite.setPosition(x, y);
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

///////////////////////////////////////////////////////////

const game = new ui.PhaserGame({ config: { scene: [ GameScene ] } })
app.present({ root: game });

///////////////////////////////////////////////////////////