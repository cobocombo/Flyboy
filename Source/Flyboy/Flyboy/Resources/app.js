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

  create() 
  {
    this.cameras.main.setBackgroundColor('#ff0000');
  }
}

const game = new ui.PhaserGame({ config: { scene: [ SplashScene, MainMenuScene, GameScene ]} })
app.present({ root: game });

///////////////////////////////////////////////////////////