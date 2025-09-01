///////////////////////////////////////////////////////////
// HUD ENTITY
///////////////////////////////////////////////////////////

/** Class representing the HUD object for the game scene. */
class HUD
{
  heartsGroup;
  joystick;
  scoreText;
  shootButton;
  pauseButton;

  /**
   * Creates the HUD object for the game scene. 
   * @param {Phaser.Scene} scene - Scene instance.
   * @param {Joystick} joystick - Joystick object.
   * @param {ShootButton} shootButton - ShootButton object.
   * @param {Plane} plane - Plane object.
   */
  constructor({ scene, joystick, shootButton, plane } = {})
  {
    this.scene = scene;
    this.joystick = joystick;
    this.shootButton = shootButton;
    this.plane = plane;
    
    this.pauseButton = this.scene.add.image(0, 0, 'pause-button');
    this.pauseButton.setScale((device.screenWidth / 8) / this.pauseButton.height);
    this.pauseButton.setPosition((this.joystick.base.x + this.shootButton.sprite.x) / 2, (this.joystick.base.y + this.shootButton.sprite.y) / 2);
    this.pauseButton.setInteractive();
    this.pauseButton.setOrigin(0.5);
    this.pauseButton.on('pointerdown', () => 
    {
      let planeIdleSoundEffect = this.scene.sound.get(this.plane.idleSoundEffect.key);
      let backgroundMusic = this.scene.sound.get('background-music');
      let invinciblitySoundEffect = this.scene.sound.get('clock');

      if(planeIdleSoundEffect) planeIdleSoundEffect.stop();
      if(backgroundMusic) backgroundMusic.stop();
      if(invinciblitySoundEffect) invinciblitySoundEffect.stop();
      
      this.scene.scene.pause();
      this.pauseAlert = new PauseAlertDialog({ scene: this.scene });
      this.pauseAlert.present();
    });

    this.scoreText = this.scene.add.text(0, 0, `Score: 0`,
    { 
      fontSize: `${device.screenWidth / 12}px`, 
      fill: '#000000', 
      fontFamily: 'BulgariaDreams', 
      align: 'center' 
    });
    this.scoreText.setOrigin(0.5);
    this.scoreText.setPosition((this.pauseButton.x + this.joystick.base.x) / 2, this.pauseButton.y);

    this.heartsGroup = this.scene.add.group();
    this.heartsGroup.clear(true, true);

    let maxHits = this.plane.maxNumberOfHits;
    let leftX = this.pauseButton.x + (this.pauseButton.displayWidth / 2);
    let rightX = this.shootButton.sprite.x - (this.shootButton.sprite.displayWidth / 2);
    let availableWidth = rightX - leftX;
    let maxHeartSize = device.screenWidth / 20;
    let totalSpacing = maxHits > 1 ? availableWidth / (maxHits - 1) : 0;
    let heartSpacing = Math.min(totalSpacing, maxHeartSize * 1.2);
    let heartSize = Math.min(maxHeartSize, heartSpacing);
    let totalHeartsWidth = heartSize + (maxHits - 1) * heartSpacing;
    let midX = (leftX + rightX) / 2;
    let horizontalPadding = device.screenWidth / 25;
    let startX = midX - (totalHeartsWidth / 2) + horizontalPadding;
    let heartY = this.pauseButton.y;

    for(let i = 0; i < maxHits; i++) 
    {
      const heart = this.scene.add.image(startX + i * heartSpacing, heartY, 'heart');
      heart.setDisplaySize(heartSize, heartSize);
      heart.setOrigin(0.5);
      heart.clearTint();
      heart.setAlpha(1);
      this.heartsGroup.add(heart);
    }

    this.updateHearts();
  }

  /** Public method to update the hearts group animation. */
  updateHearts()
  {
    let maxHits = this.plane.maxNumberOfHits;
    let hitsTaken = this.plane.numberOfHits;
    let heartsLeft = maxHits - hitsTaken;

    this.heartsGroup.getChildren().forEach((heart, i) => 
    {
      if(i < heartsLeft) 
      {
        heart.clearTint();
        heart.setAlpha(1);
      } 
      else 
      {
        heart.setTint(0x555555);
        heart.setAlpha(0.5);
      }
    });
  }
}

///////////////////////////////////////////////////////////