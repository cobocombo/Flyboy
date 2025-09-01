///////////////////////////////////////////////////////////
// USER SETTINGS MODULE
///////////////////////////////////////////////////////////

/** Singleton class representing the global SettingsManager. */
class SettingsManager 
{
  errors;
  static #instance = null;

  /** Initializes the SettingsManager singleton. */
  constructor() 
  {
    this.errors = 
    {
      singleInstanceError: 'Settings Manager Error: Only one SettingsManager instance can exist.',
      soundOnTypeError: 'Settings Manager Error: Expected type boolean for soundOn.'
    };

    if(SettingsManager.#instance) 
    {
      console.error(this.errors.singleInstanceError);
      return SettingsManager.#instance;
    }

    SettingsManager.#instance = this;
  }

  /** Returns the singleton instance. */
  static getInstance() 
  {
    if(!SettingsManager.#instance) SettingsManager.#instance = new SettingsManager();
    return SettingsManager.#instance;
  }

  /**
   * Add or modify user settings data.
   * @param {boolean} soundOn - Boolean value on if the user prefers sound on or off.
   */
  addSettings({ soundOn } = {})
  {
    if(!typeChecker.check({ type: 'boolean', value: soundOn })) console.error(this.errors.soundOnTypeError);
    let data = saveData.load({ key: saveData.storageKeys.settings });
    if(!data) data = { soundOn: true };
    else data = { soundOn: soundOn };
    saveData.save({ key: saveData.storageKeys.settings, data: data });
  }

  /**
   * Returns the user's saved settings.
   * @returns {object} Settings object.
   */
  getSettings()
  {
    let data = saveData.load({ key: saveData.storageKeys.settings });
    if(!data) data = { soundOn: false };
    return data;
  }
}

globalThis.userSettings = SettingsManager.getInstance();

///////////////////////////////////////////////////////////