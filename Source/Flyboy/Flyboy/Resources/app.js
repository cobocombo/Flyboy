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
  constructor() 
  {
    super('GameScene');
  }

  preload() 
  {
    this.load.image('background', 'background.png');
    this.load.image('plane-fly-1', 'plane-fly-1.png');
  }

  create() 
  {
    this.background = this.add.image(device.screenHeight / 2, device.screenWidth / 2, 'background');
    this.background.setDisplaySize(device.screenHeight , device.screenWidth);

    this.plane = new Plane({ scene: this });
    
    const padding = 20;
    const x = padding + (this.plane.sprite.displayWidth / 2);
    const y = device.screenWidth / 2;

    this.plane.setPosition({ x: x, y: y });
  }
}

///////////////////////////////////////////////////////////
// ENTITIES
///////////////////////////////////////////////////////////

class Plane 
{
  #errors;

  constructor({ scene } = {}) 
  {
    this.#errors = 
    {
      xTypeError: 'Plane Error: Expected type number for x when setting position of plane.',
      yTypeError: 'Plane Error: Expected type number for y when setting position of plane.'
    };

    this.scene = scene;
    this.sprite = scene.add.sprite(0, 0, 'plane-fly-1');

    const targetHeight = device.screenWidth / 5;
    const scale = targetHeight / this.sprite.height;
    this.sprite.setScale(scale);
  }

  setPosition({ x, y } = {}) 
  {
    if(!typeChecker.check({ type: 'number', value: x })) console.error(this.#errors.xTypeError);
    if(!typeChecker.check({ type: 'number', value: y })) console.error(this.#errors.yTypeError);
    this.sprite.setPosition(x, y);
  }
}

///////////////////////////////////////////////////////////

const game = new ui.PhaserGame({ config: { scene: [ GameScene ] } })
app.present({ root: game });

///////////////////////////////////////////////////////////