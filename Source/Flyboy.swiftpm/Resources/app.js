///////////////////////////////////////////////////////////

typechecker.register({ name: 'plane', constructor: Plane });
typechecker.register({ name: 'joystick', constructor: Joystick });
typechecker.register({ name: 'shoot-button', constructor: ShootButton });

let game = new ui.PhaserGame({ 
  config: 
  { 
    type: Phaser.WEBGL,
    backgroundColor: '#000000',
    scene: [ SplashScene, MainMenuScene, LevelSelectScene, LoadingScene, GameScene ],
    physics: 
    { 
      default: "arcade", 
      arcade: { debug: false }
    } 
  }}
); 

app.present({ root: game });

///////////////////////////////////////////////////////////