///////////////////////////////////////////////////////////
// EFFECT ENTITY
///////////////////////////////////////////////////////////

/** Class representing an effect that can be spawned in the game scene. */
class Effect
{
  errors;
  name;
  sprite;
  key;
  
  /**
   * Creates and spawns the effect object. 
   * @param {Phaser.Scene} scene - Scene instance.
   * @param {object} data - Data object loaded from effects.json.
   * @param {string} type - Unique effect type to be filtered from the data.
   * @param {number} x - X-coordinate postion.
   * @param {number} y - Y-coordinate postion.
   */
  constructor({ scene, data, type, x, y } = {})
  {
    this.errors = 
    {
      dataNotFoundError: 'Effect Error: No data found for enemy.',
      dataTypeError: 'Effect Error: Expected type object for data.',
      heightTypeError: 'Effect Error: Expected type number for height.',
      keyTypeError: 'Effect Error: Expected type string for key.',
      nameTypeError: 'Effect Error: Expected type string for name.',
      sceneError: 'Effect Error: A valid phaser scene is required.',
      spriteTypeError: 'Effect Error: Expected type string for sprite.',
      typeTypeError: 'Effect Error: Expected type string for type.',
      xTypeError: 'Effect Error: Expected type number for x.',
      yTypeError: 'Effect Error: Expected type number for y.'
    };

    if(!scene) console.error(this.errors.sceneError);
    if(!typeChecker.check({ type: 'object', value: data })) console.error(this.errors.dataTypeError);
    if(!typeChecker.check({ type: 'string', value: type })) console.error(this.errors.typeTypeError);
    if(!typeChecker.check({ type: 'number', value: x })) console.error(this.errors.xTypeError);
    if(!typeChecker.check({ type: 'number', value: y })) console.error(this.errors.yTypeError);

    this.scene = scene;
    let effectData = data.effects.find(e => e.name === type);
    if(!effectData) console.error(this.errors.dataNotFoundError);

    if(!typeChecker.check({ type: 'string', value: effectData.name })) console.error(this.errors.nameTypeError);
    if(!typeChecker.check({ type: 'string', value: effectData.sprite })) console.error(this.errors.spriteTypeError);
    if(!typeChecker.check({ type: 'number', value: effectData.height })) console.error(this.errors.heightTypeError);
    if(!typeChecker.check({ type: 'string', value: effectData.key })) console.error(this.errors.keyTypeError);

    this.name = effectData.name;
    this.sprite = scene.add.sprite(x, y, this.name);
    this.sprite.setScale((device.screenWidth / effectData.height) / this.sprite.height);
    this.sprite.setDepth(10);

    if(effectData.frames !== null)
    {
      this.key = effectData.key;
      this.sprite.play(this.key);
    }

    if(effectData.tween !== null)
    {
      let tween = effectData.tween;
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: tween.alpha,
        scaleX: tween.scaleX,
        scaleY: tween.scaleY,
        duration: tween.duration,
        ease: tween.ease
      });

      if(tween.duration !== null)
      {
        this.scene.time.delayedCall(tween.duration, () => 
        {
          this.destroy();
        });
      }
    }
  }

  /** Public method to destroy the effect's sprite. */
  destroy() 
  {
    this.sprite.destroy();
  }

  /**
   * Hook into Phaser's `animationcomplete` event for this effect's sprite.
   * @param {Function} callback - Function to call when the effect finishes.
   */
  onAnimationComplete(callback) 
  {
    this.sprite.on("animationcomplete", (animation, _frame) =>  { if(animation.key === this.key) { callback(this); } });
  }
}

///////////////////////////////////////////////////////////