///////////////////////////////////////////////////////////
// LEVELS MODULE
///////////////////////////////////////////////////////////

/** Singleton class representing the global LevelManager. */
class LevelManager 
{
  errors;
  levels;
  currentLevel;
  static #instance = null;

  /** Initializes the LevelManager singleton. */
  constructor() 
  {
    this.errors = 
    {
      idTypeError: 'Level Manager Error: Expected type number for id.',
      levelsTypeError: 'Level Manager Error: Expected an array of level objects.',
      levelIdTypeError: 'Level Manager Error: Expected type number for level ID.',
      levelNotFoundError: 'Level Manager Error: No level found with the specified ID.',
      levelsNotLoadedError: 'Level Manager Error: No levels have been loaded yet.',
      scoreTypeError: 'Level Manager Error: Expected type number for score.',
      singleInstanceError: 'Level Manager Error: Only one LevelManager instance can exist.',
      starsTypeError: 'Level Manager Error: Expected type number for stars.',
      unlockedTypeError: 'Level Manager Error: Expected type boolean for unlocked'
    };

    if(LevelManager.#instance) 
    {
      console.error(this.errors.singleInstanceError);
      return LevelManager.#instance;
    }

    this.levels = [];
    this.currentLevel = null;
    LevelManager.#instance = this;
  }

  /** Returns the singleton instance. */
  static getInstance() 
  {
    if(!LevelManager.#instance) LevelManager.#instance = new LevelManager();
    return LevelManager.#instance;
  }

  /**
   * Gets the currently selected level.
   * @returns {object} The current level object.
   */
  get currentLevel() 
  {
    if(!this.currentLevel) console.warn(this.errors.levelsNotLoadedError);
    return this.currentLevel;
  }

  /**
   * Gets the number of levels stored from levels.json.
   * @returns {object} The current level count.
   */
  get levelCount()
  {
    return this.levels.length;
  }

  /**
   * Add or update a level entry in the save data.
   * @param {string} key - The storage key for the save data.
   * @param {number} id - The level ID to add or update.
   * @param {number} stars - The number of stars for this level.
   * @param {boolean} unlocked - Flag status on if the level is unlocked or not.
   * @param {number} score - Highest score the user earned for the level.
   */
  addLevelProgress({ id, stars, unlocked, score } = {}) 
  {
    if(!typeChecker.check({ type: 'number', value: id })) console.error(this.errors.idTypeError);
    if(!typeChecker.check({ type: 'number', value: stars })) console.error(this.errors.starsTypeError);
    if(!typeChecker.check({ type: 'boolean', value: unlocked })) console.error(this.errors.unlockedTypeError);
    if(!typeChecker.check({ type: 'number', value: score })) console.error(this.errors.scoreTypeError);

    let data = saveData.load({ key: saveData.storageKeys.levelProgress });
    if(!data) data = { levels: [] };

    let existingLevel = data.levels.find(level => level.id === id);
    if(existingLevel)
    {
      existingLevel.stars = Math.max(existingLevel.stars, stars);
      if(unlocked === true) existingLevel.unlocked = true;
      existingLevel.score = Math.max(existingLevel.score, score);
    } 
    else data.levels.push({ id, stars, unlocked, score });
    saveData.save({ key: saveData.storageKeys.levelProgress, data: data });
  }

  /**
   * Clears all loaded levels and the current level.
   */
  clear() 
  {
    this.levels = [];
    this.currentLevel = null;
  }

  /**
   * Get the number of stars saved for a specific level.
   * @param {number} id - The level ID to query.
   * @returns {number} Number of stars for the level, or 0 if not found.
   */
  getStarsForLevel({ id } = {}) 
  {
    if(!typeChecker.check({ type: 'number', value: id })) console.error(this.errors.idTypeError);
    let data = saveData.load({ key: saveData.storageKeys.levelProgress });
    if(!data) return 0;
    let level = data.levels.find(level => level.id === id);
    return level ? level.stars || 0 : 0;
  }

  /**
   * Gets all loaded levels.
   * @returns {array} All level data.
   */
  getAllLevels() 
  {
    return this.levels;
  }

  /**
   * Check if a specific level is completed.
   * @param {number} id - The level ID to check.
   * @returns {boolean} True if completed, false otherwise.
   */
  isLevelUnlocked({ id } = {}) 
  {
    if(!typeChecker.check({ type: 'number', value: id })) console.error(this.errors.idTypeError);
  
    let data = saveData.load({ key: saveData.storageKeys.levelProgress });
    if(!data) return false;

    let level = data.levels.find(level => level.id === id);
    return level ? level.unlocked === true : false;
  }

  /**
   * Loads level data from levels.json.
   * @param {array} levels - Array of level objects.
   */
  load({ levels } = {}) 
  {
    if(!typeChecker.check({ type: 'array', value: levels })) console.error(this.errors.levelsTypeError);
    this.levels = [];
    for(const rawLevel of levels) 
    {
      if(!typeChecker.check({ type: 'object', value: rawLevel })) continue;
      if(rawLevel?.id != null) this.levels.push(rawLevel);
    }
    this.currentLevel = null;
  }

  /**
   * Selects the current level by ID.
   * @param {number} id - ID of the level to select.
   */
  selectLevel({ id } = {}) 
  {
    if(!typeChecker.check({ type: 'number', value: id })) console.error(this.errors.levelIdTypeError);
    let level = this.levels.find(level => level.id === id);
    if(!level) console.error(this.errors.levelNotFoundError);
    this.currentLevel = level;
  }
}

globalThis.levels = LevelManager.getInstance();

///////////////////////////////////////////////////////////