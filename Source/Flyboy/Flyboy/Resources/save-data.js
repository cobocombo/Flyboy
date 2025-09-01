///////////////////////////////////////////////////////////
// SAVE DATA MODULE
///////////////////////////////////////////////////////////

/** Singleton class representing the global SaveDataManager. */
class SaveDataManager 
{
  storageKeys;
  errors;
  static #instance = null;

  /** Initializes the LevelManager singleton. */
  constructor() 
  {
    this.storageKeys = 
    {
      levelProgress: 'level-progress',
      settings: 'settings'
    };

    this.errors = 
    {
      dataTypeError: 'Save Data Manager Error: Expected type object for data.',
      keyTypeError: 'Save Data Manager Error: Expected type string for key.',
      loadingError: 'Save Data Manager Error: There was an issue loading data.',
      removingError: 'Save Data Manager Error: There was an issue removing data.',
      singleInstanceError: 'Save Data Manager Error: Only one SaveDataManager instance can exist.',
      savingError: 'Save Data Manager Error: There was an issue saving data.',
      wrongKeyProvidedError: 'Save Data Manager Error: Wrong key was provided when attempting to retrieve stored data.'
    };

    if(SaveDataManager.#instance) 
    {
      console.error(this.errors.singleInstanceError);
      return SaveDataManager.#instance;
    }

    SaveDataManager.#instance = this;
  }

  /** Returns the singleton instance. */
  static getInstance() 
  {
    if(!SaveDataManager.#instance) SaveDataManager.#instance = new SaveDataManager();
    return SaveDataManager.#instance;
  }

  /**
   * Save JSON-serializable data to local storage.
   * @param {string} key - The storage key.
   * @param {object} data - The data object to store.
   */
  save({ key, data } = {}) 
  {
    if(!typeChecker.check({ type: 'string', value: key })) console.error(this.errors.keyTypeError);
    if(!typeChecker.check({ type: 'object', value: data })) console.error(this.errors.dataTypeError);
    try 
    {
      let json = JSON.stringify(data);
      localStorage.setItem(key, json);
    } 
    catch { console.error(this.errors.savingError); }
  }

  /**
   * Load JSON data from local storage.
   * @param {string} key - The storage key.
   */
  load({ key } = {}) 
  {
    if(!typeChecker.check({ type: 'string', value: key })) console.error(this.errors.keyTypeError);
    try 
    {
      let json = localStorage.getItem(key);
      if(json === null) return null;
      return JSON.parse(json);
    } 
    catch { console.error(this.errors.loadingError); }
  }

  /**
   * Remove saved data.
   * @param {string} key - The storage key.
   */
  remove({ key } = {}) 
  {
    if(!typeChecker.check({ type: 'string', value: key })) console.error(this.errors.keyTypeError);
    try { localStorage.removeItem(key); } 
    catch { console.error(this.errors.removingError); }
  }
}

globalThis.saveData = SaveDataManager.getInstance();

///////////////////////////////////////////////////////////