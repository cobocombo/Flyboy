///////////////////////////////////////////////////////////
// LEVEL SELECT SCENE
///////////////////////////////////////////////////////////

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

      let unlocked = levels.isLevelUnlocked({ id: level.id });
      if(unlocked === true) 
      {
        let block = new LevelSelectBlock({ scene: this, x, y, level: level.id, starCount: levels.getStarsForLevel({ id: level.id }) || 0 });
        block.setInteractive({ useHandCursor: true }).on('pointerup', () => 
        {
          this.sound.play('tap', { volume: 0.8, loop: false }); 
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
          this.sound.play('error', { volume: 0.7, loop: false });
        });
      }
    });

    let menuMusic = this.sound.get('menu-music');
    if(menuMusic && !menuMusic.isPlaying) menuMusic.play();

    let backButton = this.add.image(20 + (device.screenWidth / 12) / 2, this.scale.height - 20 - (device.screenWidth / 12) / 2, 'back-button');
    backButton.setDisplaySize((device.screenWidth / 12), (device.screenWidth / 12));
    backButton.setOrigin(0.5);
    backButton.setInteractive({ useHandCursor: true });
    backButton.on('pointerup', () => 
    { 
      this.scene.start('MainMenuScene');
      this.sound.play('tap', { volume: 0.8, loop: false });  
    });
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

///////////////////////////////////////////////////////////