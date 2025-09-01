///////////////////////////////////////////////////////////
// MAIN MENU SCENE
///////////////////////////////////////////////////////////

/** Class representing the main menu scene of Flyboy. */
class MainMenuScene extends Phaser.Scene 
{
  settingsTapped;

  /** Creates the main menu scene object. */
  constructor() 
  {
    super('MainMenuScene');
  }

  /** Public method called to create logic and assets for the scene. */
  create() 
  {
    this.background = this.add.image(0, 0, 'main-menu-background');
    this.background.setOrigin(0, 0);
    this.background.setDisplaySize(device.screenHeight, device.screenWidth);

    this.time.delayedCall(1, () => 
    {
      this.add.text(this.scale.width / 2, this.scale.height / 4, 'Flyboy', 
      {
        fontFamily: 'BulgariaDreams',
        fontSize: `${device.screenWidth / 3.5}px`,
        color: '#000000',
        align: 'center'
      }).setOrigin(0.5);
    });

    this.startButton = this.add.image(0, 0, 'start-button');
    this.startButton.setScale((device.screenWidth / 8) / this.startButton.height);
    this.startButton.setPosition(this.cameras.main.centerX, this.cameras.main.height * 0.60);
    this.startButton.setInteractive();
    this.startButton.on('pointerdown', () => 
    { 
      this.scene.start('LevelSelectScene');
      this.sound.play('tap', { volume: 0.8, loop: false }); 
    });

    this.settingsTapped = false;
    this.settingsDialog = new ui.Dialog({ id: 'settings-dialog', width: `400px`, height: `200px` });
    this.settingsDialog.cancelable = false;
    this.settingsDialog.addEventListener({ event: 'posthide', handler: () => 
    {
      this.settingsTapped = false;
      this.toggleInteractive({ enable: true });
    }});

    this.settingsButton = this.add.image(this.scale.width - 20, this.scale.height - 20, 'settings-button');
    this.settingsButton.setOrigin(1, 1);
    this.settingsButton.setScale((device.screenWidth / 10) / this.settingsButton.height);
    this.settingsButton.setInteractive();
    this.settingsButton.on('pointerdown', () => 
    { 
      if(this.settingsTapped === false) 
      {
        this.sound.play('tap', { volume: 0.8, loop: false });
        this.settingsTapped = true;
        this.toggleInteractive({ enable: false });
        this.settingsDialog.present({ root: new SettingsPage({ sound: this.sound }) });
      }
    });

    if(!this.sound.get('menu-music')) 
    {
      this.menuMusic = this.sound.add('menu-music', { loop: true, volume: 0.5 });
      this.menuMusic.play();
    } 
    else 
    {
      this.menuMusic = this.sound.get('menu-music');
      if(!this.menuMusic.isPlaying) this.menuMusic.play();
    }
  }

  /** Public method called to pre-load any assets for the scene or upcoming scenes. */
  preload()
  {
    this.load.image('main-menu-background', 'blue-sky-clear.png');
    this.load.image('start-button', 'start-button.png');
    this.load.image('settings-button', 'settings-button.png');
  }

  /**
   * Public method called to toggle the interactive events of buttons in the scene. This is so no touch events in a dialog bleed into the scene touches. 
   * * @param {boolean} enable - Value determining if the buttons in main menu scene should be interactive or not.
   */
  toggleInteractive({ enable } = {}) 
  {
    if(enable === true) 
    {
      this.startButton.setInteractive();
      this.settingsButton.setInteractive();
    } 
    else 
    {
      this.startButton.disableInteractive();
      this.settingsButton.disableInteractive();
    }
  }
}

///////////////////////////////////////////////////////////