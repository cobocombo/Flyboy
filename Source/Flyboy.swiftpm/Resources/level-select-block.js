///////////////////////////////////////////////////////////
// LEVEL SELECT BLOCK ENTITY
///////////////////////////////////////////////////////////

/** Class representing a level select block object. */
class LevelSelectBlock extends Phaser.GameObjects.Container 
{
  errors;

  /**
   * Creates the level select block object. 
   * @param {Phaser.Scene} scene - Scene instance.
   * @param {number} x - X-coordinate postion.
   * @param {number} y - Y-coordinate postion.
   * @param {number} level - Level number.
   * @param {number} starCount - The number of stars earned from the level previously.
   */
  constructor({ scene, x, y, level, starCount = 0 } = {}) 
  {
    super(scene, x, y);

    this.errors = 
    {
      levelTypeError: 'Level Select Block Error: Expected type number for level.',
      sceneError: 'Level Select Block Error: A valid phaser scene is required.',
      starCountTypeError: 'Level Select Block Error: Expected type number for starCount.',
      xTypeError: 'Level Select Block Error: Expected type number for x.',
      yTypeError: 'Level Select Block Error: Expected type number for y.'
    };

    if(!scene) console.error(this.errors.sceneError);
    if(!typechecker.check({ type: 'number', value: x })) console.error(this.errors.xTypeError);
    if(!typechecker.check({ type: 'number', value: y })) console.error(this.errors.yTypeError);
    if(!typechecker.check({ type: 'number', value: level })) console.error(this.errors.levelTypeError);
    if(!typechecker.check({ type: 'number', value: starCount })) console.error(this.errors.starCountTypeError);

    let blockSize = device.screenWidth / 8;
    let block = scene.add.sprite(0, 0, 'block');
    block.setScale(blockSize / block.width);
    block.setOrigin(0.5);
    this.add(block);
    this.setSize(blockSize, blockSize);

    let textYOffset = -blockSize * 0.2;
    let levelText = scene.add.text(0, textYOffset, ` ${level} `, 
    {
      fontFamily: 'BulgariaDreams',
      fontSize: `${blockSize / 3.5}px`,
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    this.add(levelText);

    let starSize = blockSize / 5;
    let totalStarWidth = starSize * 3 + 2 * 4;
    let starYOffset = blockSize * 0.2;

    for(let i = 0; i < 3; i++) 
    {
      let starX = -totalStarWidth / 2 + i * (starSize + 4) + starSize / 2;
      let starKey = i < starCount ? 'star-gold' : 'star-silver';
      let star = scene.add.sprite(starX, starYOffset, starKey);
      let starScale = starSize / star.width;
      star.setScale(starScale);
      star.setOrigin(0.5);
      this.add(star);
    }

    scene.add.existing(this);
  }
}

///////////////////////////////////////////////////////////