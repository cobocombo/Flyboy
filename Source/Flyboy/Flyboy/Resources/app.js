///////////////////////////////////////////////////////////

typeChecker.register({ name: 'plane', constructor: Plane });
typeChecker.register({ name: 'joystick', constructor: Joystick });
typeChecker.register({ name: 'shoot-button', constructor: ShootButton });

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