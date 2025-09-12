///////////////////////////////////////////////////////////

typechecker.register({ name: 'plane', constructor: Plane });
typechecker.register({ name: 'joystick', constructor: Joystick });
typechecker.register({ name: 'shoot-button', constructor: ShootButton });

let game = new ui.PhaserGame({ 
  config: 
  { 
    type: Phaser.WEBGL,
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