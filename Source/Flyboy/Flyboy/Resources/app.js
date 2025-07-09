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
  }

  create() 
  {
    this.background = this.add.image(device.screenHeight / 2, device.screenWidth / 2, 'background');
    this.background.setDisplaySize(device.screenHeight , device.screenWidth);
  }
}

const game = new ui.PhaserGame({ config: { scene: [ GameScene ] } })
app.present({ root: game });

///////////////////////////////////////////////////////////