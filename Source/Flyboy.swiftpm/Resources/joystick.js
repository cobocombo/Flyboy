///////////////////////////////////////////////////////////
// JOYSTICK ENTITY
///////////////////////////////////////////////////////////

/** Class representing the joystick in the HUD of the game scene. */
class Joystick 
{
  base;
  centerY;
  currentState;
  dragRange;
  scene;
  states;
  stick;

  /**
   * Creates the joystick object. 
   * @param {Phaser.Scene} scene - Scene instance.
   */
  constructor({ scene } = {}) 
  {
    this.states = { idle: 'idle', up: 'up', down: 'down' };

    if(!scene) console.error('Joystick Error: A valid phaser scene is required.');

    this.scene = scene;
    this.currentState = this.states.idle;

    this.base = scene.add.image(0, 0, 'joystick-base');
    this.base.setScale((device.screenWidth / 4) / this.base.height);

    this.stick = scene.add.image(0, 0, 'joystick');
    this.stick.setScale((device.screenWidth / 4) / this.base.height);
    this.stick.setInteractive();
    this.scene.input.setDraggable(this.stick);

    this.base.setPosition(20 + (this.base.displayWidth) / 2, device.screenWidth - 20 - (this.base.displayHeight) / 2);
    this.stick.setPosition(20 + (this.base.displayWidth) / 2, device.screenWidth - 20 - (this.base.displayHeight) / 2);

    this.centerY = device.screenWidth - 20 - (this.base.displayHeight) / 2;
    this.dragRange = this.base.displayHeight / 6;

    this.stick.on('drag', (pointer, dragX, dragY) => 
    {
      let clampedY = Phaser.Math.Clamp(dragY, this.centerY - this.dragRange, this.centerY + this.dragRange);
      this.stick.setPosition(20 + (this.base.displayWidth) / 2, clampedY);
      let deltaY = clampedY - this.centerY;
      let newState = this.states.idle;
      if(deltaY < -10) newState = this.states.up;
      else if(deltaY > 10) newState = this.states.down;
      if(newState !== this.currentState) this.currentState = newState;
    });

    this.stick.on('dragend', () => 
    {
      this.stick.setPosition(20 + (this.base.displayWidth) / 2, this.centerY);
      if(this.currentState !== this.states.idle) this.currentState = this.states.idle;
    });
  }
}

///////////////////////////////////////////////////////////