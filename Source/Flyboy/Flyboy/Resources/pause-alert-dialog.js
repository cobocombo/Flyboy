///////////////////////////////////////////////////////////
// PAUSE ALERT DIALOG
///////////////////////////////////////////////////////////

/** Class representing the dialog shown when the game scene is paused. */
class PauseAlertDialog extends ui.AlertDialog
{
  /**
   * Creates the pause alert dialog object. 
   * @param {Phaser.Scene} scene - Scene instance.
   */
  constructor({ scene } = {})
  {
    super();

    this.cancelable = false;
    this.rowfooter = false;

    this.title = 'Game Paused';
    this.addComponents({ components: [ new ui.Text({ text: 'Select an option to continue' }) ] });

    let resumeButton = new ui.AlertDialogButton({ text: 'Resume', onTap: () => 
    { 
      let planeIdleSoundEffect = scene.sound.get('idle');
      let backgroundMusic = scene.sound.get('background-music');
      let invinciblitySoundEffect = scene.sound.get('clock');
      
      if(planeIdleSoundEffect) planeIdleSoundEffect.play();
      if(backgroundMusic) backgroundMusic.play();
      if(invinciblitySoundEffect) invinciblitySoundEffect.play();

      scene.scene.resume(); 
    }});

    let quitButton = new ui.AlertDialogButton({ text: 'Quit', textColor: 'red', onTap: () => 
    { 
      scene.scene.stop('GameScene');
      scene.scene.start('MainMenuScene'); 
    }});

    this.buttons = [ resumeButton, quitButton ];
  }
}

///////////////////////////////////////////////////////////