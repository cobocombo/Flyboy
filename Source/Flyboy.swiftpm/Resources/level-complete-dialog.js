///////////////////////////////////////////////////////////
// LEVEL COMPLETE DIALOG
///////////////////////////////////////////////////////////

/** Class representing the dialog shown when the user completed the level. */
class LevelCompleteDialog extends ui.AlertDialog
{
  errors;

  /**
   * Creates the level completed dialog object. 
   * @param {Phaser.Scene} scene - Scene instance.
   * @param {number} score - Score from the completed level.
   * @param {number} startCount - The number of stars earned from the level, and that should be shown in the dialog.
   */
  constructor({ scene, score, starCount = 0 } = {})
  {
    super();

    this.errors = 
    {
      sceneError: 'Level Complete Dialog Error: A valid phaser scene is required.',
      scoreTypeError: 'Level Complete Dialog Error: Expected type number for score.',
      starCountTypeError: 'Level Complete Dialog Error: Expected type number for starCount.'
    };

    if(!scene) console.error(this.errors.sceneError);
    if(!typechecker.check({ type: 'number', value: score })) console.error(this.errors.scoreTypeError);
    if(!typechecker.check({ type: 'number', value: starCount })) console.error(this.errors.starCountTypeError);

    this.cancelable = false;
    this.rowfooter = false;

    this.title = 'Level Complete!';
    this.addComponents({ components: [ new ui.Text({ text: `Score: ${score}` }) ] });

    for(let i = 0; i < 3; i++) 
    {
      let starKey = i < starCount ? 'star-gold.png' : 'star-silver.png';
      let star = new ImageV2({ source: starKey, width: '44px', height: '44px' })
      this.addComponents({ components: [ star ] });
    }

    let newLevelButton = new ui.AlertDialogButton({ text: 'New Level', onTap: () => 
    { 
      scene.stop('GameScene');
      scene.start('LevelSelectScene');
      confetti.remove(); 
    }});

    let mainMenuButton = new ui.AlertDialogButton({ text: 'Main Menu', onTap: () => 
    { 
      scene.stop('GameScene');
      scene.start('MainMenuScene');
      confetti.remove();   
    }});

    let replayButton = new ui.AlertDialogButton({ text: 'Replay', onTap: () => 
    { 
      scene.stop('GameScene');
      scene.start('LoadingScene');
      confetti.remove(); 
    }});

    this.buttons = [ newLevelButton, mainMenuButton, replayButton ];
  }
}

///////////////////////////////////////////////////////////