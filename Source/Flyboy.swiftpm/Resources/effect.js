///////////////////////////////////////////////////////////
// EFFECT ENTITY
///////////////////////////////////////////////////////////

/** Class representing an effect that can be spawned in the game scene. */
class Effect
{
  name;
  scene;
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
  constructor({ scene, data, type, x, y, height } = {})
  {
    this.scene = scene;
    let effectData = data.effects.find(e => e.name === type);

    this.name = effectData.name;
    this.sprite = scene.add.sprite(x, y, this.name);
    this.sprite.setScale(height / this.sprite.height);
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