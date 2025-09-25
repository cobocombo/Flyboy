///////////////////////////////////////////////////////////
// LEVEL FAILED DIALOG
///////////////////////////////////////////////////////////

/** Class representing the dialog shown when the user failed the level. */
class LevelFailedDialog extends ui.AlertDialog
{
  /**
   * Creates the level failed dialog object. 
   * @param {Phaser.Scene} scene - Scene instance.
   */
  constructor({ scene } = {})
  {
    super();

    if(!scene) console.error('Level Failed Dialog Error: A valid phaser scene is required.');

    this.cancelable = false;
    this.rowfooter = false;

    this.title = `Level ${levels.currentLevel.id} Failed!`;
    this.addComponents({ components: [ new ui.Text({ text: 'Try better next time!' }) ] });
    this.addComponents({ components: [ new Img({ source: 'x.png', width: '50px', height: '50px' }) ] });

    let mainMenuButton = new ui.AlertDialogButton({ text: 'Main Menu', onTap: () => 
    { 
      scene.stop('GameScene');
      scene.start('MainMenuScene'); 
    }});

    let replayButton = new ui.AlertDialogButton({ text: 'Replay', onTap: () => 
    { 
      scene.stop('GameScene');
      scene.start('LoadingScene'); 
    }});

    this.buttons = [ mainMenuButton, replayButton ];
  }
}

///////////////////////////////////////////////////////////