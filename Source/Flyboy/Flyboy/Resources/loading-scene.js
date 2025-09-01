///////////////////////////////////////////////////////////
// LOADING SCENE
///////////////////////////////////////////////////////////

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
        loadingText.on('pointerdown', () => 
        { 
          this.sound.play('tap', { volume: 0.8, loop: false }); 
          this.scene.start('GameScene'); 
        });
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
    this.load.json('projectiles', `projectiles.json?v=${Date.now()}`);
    this.load.json('effects', `effects.json?v=${Date.now()}`);
  } 
}

///////////////////////////////////////////////////////////