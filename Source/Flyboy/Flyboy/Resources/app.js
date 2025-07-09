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
    this.load.setCORS('anonymous'); // or 'use-credentials' if needed
    this.load.image('background', 'background.png');
    this.load.on('loaderror', (file) => { console.error('Failed to load:', file.key); });
  }

  create() 
  {
    const { width, height } = this.sys.game.canvas;
    const bg = this.add.image(width / 2, height / 2, 'background');
    bg.setDisplaySize(width, height);
  }
}

class HomePage extends ui.Page
{
  onInit()
  {
    this.navigationBarTitle = 'Home';

    this.addComponents({ components: [ new ImageV2({ source: './background.png' }) ] })
  }
}


const game = new ui.PhaserGame({ config: { scene: [ GameScene ], loader: { baseURL: './', crossOrigin: 'anonymous' }} })
app.present({ root: game });

///////////////////////////////////////////////////////////