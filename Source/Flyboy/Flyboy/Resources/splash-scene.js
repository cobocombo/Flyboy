///////////////////////////////////////////////////////////
// SPLASH SCENE
///////////////////////////////////////////////////////////

/** Class representing the splash scene of Flyboy. */
class SplashScene extends Phaser.Scene 
{
  /** Creates the splash scene object. */
  constructor() 
  {
    super('SplashScene');
  }

  /** Public method called to create logic and assets for the scene. */
  create() 
  {
    this.cameras.main.setBackgroundColor('#F0DB4F');

    if(app.isFirstLaunch === true) 
    {
      levels.addLevelProgress({ id: 1, stars: 0, unlocked: true, score: 0 });
      userSettings.addSettings({ soundOn: true });
    }

    let settings = userSettings.getSettings();
    if(settings.soundOn === true) this.sound.mute = false;
    else this.sound.mute = true;

    let logo = this.add.image(this.scale.width / 2, this.scale.height / 2, 'logo');
    logo.setScale(Math.min(this.scale.width * 0.4 / logo.width, 1));
    logo.setOrigin(0.5);

    this.tweens.add({ targets: logo, alpha: 0, duration: 2000, delay: 1000, ease: 'Linear' });
    setTimeout(() => { this.scene.start('MainMenuScene'); }, 3000);
  }

  /** Public method called to pre-load any assets for the scene or upcoming scenes. */
  preload()
  {
    let font = new FontFace('BulgariaDreams', 'url("Bulgaria Dreams Regular.ttf")');
    font.load().then((loadedFace) => { document.fonts.add(loadedFace);})
    .catch((err) => { console.warn('Font failed to load', err); });

    this.load.audio('menu-music', 'menu-music.mp3');
    this.load.audio('tap', 'tap.mp3');
    this.load.audio('error', 'error.mp3');
    this.load.image('logo', 'scriptit-logo.png');
    this.load.json('levels', `levels.json?v=${Date.now()}`);
  }
}

///////////////////////////////////////////////////////////