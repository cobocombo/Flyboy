///////////////////////////////////////////////////////////
// CONSOLE MANAGER MODULE
///////////////////////////////////////////////////////////

/** Singleton class representing the main consoleManager object. */
class ConsoleManager
{
  #errors;
  #originalConsole;
  static #instance = null;

  /** Creates the consoleManager object. **/
  constructor() 
  {
    this.#errors = 
    {
      singleInstanceError: 'Console Manager Error: Only one ConsoleManager object can exist at a time.',
      postError: 'Console Manager Error: Could not post message to iOS.'
    };

    if(ConsoleManager.#instance) console.error(this.#errors.singleInstanceError);
    else ConsoleManager.#instance = this;

    this.#originalConsole = 
    {
      log: console.log,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    };

    this.#override();
    this.#setupErrorListener();
  }

  /** Private method to post console.debug statements to iOS.*/
  #debug(...args)
  {
    this.#postToNative("📘", "debug", args);
  }

  /** Private method to post console.error statements to iOS.*/
  #error(...args)
  {
    this.#postToNative("📕", "error", args);
  }

  /** Private method to post console.log statements to iOS.*/
  #log(...args)
  {
    this.#postToNative("📗", "log", args);
  }

  /** Private method to override the original javascriot console to send messages to iOS.*/
  #override()
  {
    console.log = (...args) => 
    {
      this.#log(...args);
      this.#originalConsole.log(...args);
    };

    console.warn = (...args) => 
    {
      this.#warn(...args);
      this.#originalConsole.warn(...args);
    };

    console.error = (...args) => 
    {
      this.#error(...args);
      this.#originalConsole.error(...args);
    };

    console.debug = (...args) => 
    {
      this.#debug(...args);
      this.#originalConsole.debug(...args);
    };
  }

  /** Private method to post javascript messages to iOS.*/
  #postToNative(emoji, type, args) 
  {
    if(window.webkit?.messageHandlers?.consoleMessageManager) 
    {
      try 
      {
        const message = `${emoji} JS ${type}: ${Array.from(args)
          .map(v =>
            typeof v === "undefined" ? "undefined" :
            typeof v === "object" ? JSON.stringify(v) :
            v.toString()
          )
          .map(v => v.substring(0, 3000))
          .join(", ")}`;

        window.webkit.messageHandlers.consoleMessageManager.postMessage(message);
      } 
      catch(err) { this.#originalConsole.error(this.#errors.postError, err); }
    }
  }

  /** Private method to setup the uncaught error message event listener.*/
  #setupErrorListener() 
  {
    window.addEventListener("error", (e) => {
      const message = `${e.message} at ${e.filename}:${e.lineno}:${e.colno}`;
      this.#uncaught(message);
    });
  }

  /** Private method to post uncaught error statements to iOS.*/
  #uncaught(message)
  {
    this.#postToNative("💥", "uncaught", [message]);
  }

  /** Private method to post console.warn statements to iOS.*/
  #warn(...args)
  {
    this.#postToNative("📙", "warn", args);
  }

  /** Static method to return a new ConsoleManager instance. Allows for Singleton+Module pattern. */
  static getInstance() 
  {
    return new ConsoleManager();
  }
}

///////////////////////////////////////////////////////////
// TYPECHECKER MODULE
///////////////////////////////////////////////////////////

/** Singleton class representing the main typechecker object. */
class TypeChecker
{
  static #instance = null;
  #errors;
  #types;

  /** Creates the typechecker object. **/
  constructor() 
  {
    this.#errors = 
    {
      checkMultipleTypeError: 'Typechecker Error: Expected type array when checking for multiple types.',
      registrationOfNewTypeError: 'Typechecker Error: Invalid parameters for registerType. Expected a string name and a class constructor.',
      singleInstanceError: 'Typechecker Error: Only one TypeChecker object can exist at a time.'
    };

    if(TypeChecker.#instance) console.error(this.#errors.singleInstanceError);
    else
    {
      TypeChecker.#instance = this;
      this.#types = 
      {
        number: (x) => typeof x === "number" && !isNaN(x),
        string: (x) => typeof x === "string",
        boolean: (x) => typeof x === "boolean",
        function: (x) => typeof x === "function",
        array: (x) => Array.isArray(x),
        object: (x) => x !== null && typeof x === "object" && !Array.isArray(x),
        any: () => true
      };
    }
  }

  /** Static method to return a new Typechecker instance. Allows for Singleton+Module pattern. */
  static getInstance() 
  {
    return new TypeChecker();
  }

  /** 
   * Public method to check if a value is a specific type. This could be a base type or a previously registered type.
   * @param {string} type - The type the value should be compared with.
   * @param {Multiple} value -The value to be compared with the specified type.
   */
  check({ type, value } = {}) 
  {
    return this.#types[type]?.(value) ?? false;
  }
  
  /** 
   * Public method to check if a value is one of multiple types. This could be a base type or a previously registered type. 
   * Returns true if one of them is a matching type.
   * @param {array} types - The types the value should be compared with.
   * @param {Multiple} value - The value to be compared with the specified types.
   */
  checkMultiple({ types, value }) 
  {
    if(!this.check({ type: 'array', value: types })) console.error(this.#errors.checkMultipleTypeError);
    for(let type of types) if(this.check({ type: type, value: value })) return true;
    return false;
  }
  
  /** 
   * Public method to register a new custom type. 
   * @param {array} name - The name to reference the type with.
   * @param {Multiple} constructor - The class constructor to reference when doing the comparisons.
   */
  register({ name, constructor }) 
  {
    if(typeof name !== "string" || !(constructor instanceof Function)) console.error(this.#errors.registrationOfNewTypeError);
    this.#types[name] = (x) => x instanceof constructor;
  }
}

///////////////////////////////////////////////////////////
// COLOR MODULE
///////////////////////////////////////////////////////////

/** Singleton class representing the main color object. */
class ColorManager
{
  #errors;
  static #instance = null;

  /** Creates the color object. **/
  constructor() 
  {
    this.#errors = 
    {
      singleInstanceError: 'Color Manager Error: Only one ColorUtility object can exist at a time.'
    };

    if(ColorManager.#instance) console.error(this.#errors.singleInstanceError);
    else ColorManager.#instance = this;
  }

  /** Static method to return a new ColorUtility instance. Allows for Singleton+Module pattern. */
  static getInstance() 
  {
    return new ColorManager();
  }
  
  /** 
   * Public method to check if a color value is valid or not. 
   * @param {string} color - The color to verify.
   */
  isValid({ color } = {}) 
  {
    const s = new Option().style;
    s.color = '';
    s.color = color;
    return s.color !== '';
  }

  /** 
   * Public method to check if a string is a valid hex color value or not.
   * @param {string} color - The color to verify.
   */
  isHexColor({ color } = {}) 
  {
    if (typeof color !== 'string') return false;
    return /^#[0-9a-fA-F]{6}$/.test(color);
  }
}

///////////////////////////////////////////////////////////
// APP MODULE
///////////////////////////////////////////////////////////

/** Singleton class representing the main app object. */
class App 
{
  #componentsById;
  #coreReleaseDate;
  #coreVersion;
  #errors;
  #isPresented;
  #root;
  
  /** Creates the app object. **/
  constructor() 
  {
    this.#errors = 
    {
      appAlreadyPresentedError: 'App Error: App is already being presented.',
      appNotYetPresentedError: 'App Error: Cannot retrieve component because the app has not been presented yet.',
      componentRegistrationTypeError: 'App Error: Expected type Component during registration.',
      componentNotFoundError: 'App Error: No component found with id',
      idTypeError: 'App Error: Expected type string for parameter id while trying to retrieve a component.',
      noIdComponentRegistrationError: 'App Error: Cannot register component without an id.',
      noRootComponentError: 'App Error: No root component was found',
      rootComponentTypeError: 'App Error: Root was detected as an unsupported type. Supported types are: Navigator, Page, Splitter, and Tabbar.',
      singleInstanceError: 'App Error: Only one App object can exist at a time.',
      statusBarColorInvalidError: 'Text Error: Invalid color value for color.',
      statusBarColorTypeError: 'Text Error: Expected type string for color.'
    }

    if(App._instance) console.error(this.#errors.singleInstanceError);
    else
    {
      App._instance = this;
      this.#componentsById = new Map();
      this.#isPresented = false;
      this.statusBarColor = 'black';
      this.#coreVersion = '1.2';
      this.#coreReleaseDate = '7/5/25';
    }    
  }
  
  /** Static method to return a new App instance. Allows for Singleton+Module pattern. */
  static getInstance() 
  {
    return new App();
  }

  /** 
   * Get property to return the latest release date of the Scriptit Core framework.
   * @return {string} The latest release date of the Scriptit Core framework.
   */
  get coreReleaseDate()
  {
    return this.#coreReleaseDate;
  }

  /** 
   * Get property to return the current released version of the Scriptit Core framework.
   * @return {string} The current released version of the Scriptit Core framework.
   */
  get coreVersion()
  {
    return this.#coreVersion;
  }

  /** 
   * Get property to determine if this is the first launch of the app.
   * @return {boolean} True if this is the first launch, otherwise false.
   */
  get isFirstLaunch()
  {
    const key = 'is-first-launch';

    if(localStorage.getItem(key) === null)
    {
      localStorage.setItem(key, 'false');
      return true;
    }

    return false;
  }

  /** 
   * Get property to return the color of the status bar.
   * @return {string} The color of the status bar. Defaults to black.
   */
  get statusBarColor()
  {
    return document.body.style.backgroundColor;
  }

  /** 
   * Set property to change the color of the status bar.
   * @param {string} value - The color of the status bar.
   */
  set statusBarColor(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.statusBarColorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.statusBarColorInvalidError);
    document.body.style.backgroundColor = value;
  }
  
 /** 
   * Public method to present the app from the root component.
   * @param {Multiple} root - The root component of the app. Supports Navigator, Page, Splitter, Tabbar.
   */
  present({ root } = {}) 
  {
    if(!root) console.error(this.#errors.noRootComponentError);

    if(typeChecker.checkMultiple({ types: [ 'navigator', 'page', 'splitter', 'tabbar', 'phaser-scene' ], value: root })) this.#root = root;
    else console.error(this.#errors.rootComponentTypeError);
    
    if(this.#isPresented == true)  console.error(this.#errors.appAlreadyPresentedError);
    else 
    {
      document.body.appendChild(this.#root.element);
      this.#isPresented = true;
    }
  }
  
  /** 
   * Public method to register a component in the componentsById map. This is called automatically when the user sets an id in any component.
   * @param {Component} component - The component to be registered in the map.
   */
  registerComponent({ component } = {}) 
  {
    if(!typeChecker.check({ type: 'component', value: component })) console.error(this.#errors.componentRegistrationTypeError);    
    if(!component.id) console.error(this.#errors.noIdComponentRegistrationError);
    this.#componentsById.set(component.id, component);
  }
  
  /** 
   * Public method to retrieve a previously saved component in the componentsById map.
   * @param {string} id - The id of the component that should be registered in the map.
   */
  getComponentById({ id } = {}) 
  {
    if(!typeChecker.check({ type: 'string', value: id })) console.error(this.#errors.idTypeError);
    if(!this.#isPresented) console.error(this.#errors.appNotYetPresentedError);
    const component = this.#componentsById.get(id);
    if(!component) console.error(this.#errors.componentNotFoundError + ` "${id}".`);
    return component;
  }
}

///////////////////////////////////////////////////////////
// UI MODULE
///////////////////////////////////////////////////////////

/** Singleton class representing the main ui object. */
class UserInterface 
{
  #errors;
  static #instance = null;
  #registry;

  /** Creates the ui object. **/
  constructor() 
  {
    this.#errors = 
    {
      singleInstanceError: 'User Interface Error: Only one UserInterface object can exist at a time.',
      componentNameTypeError: 'User Interface Error: Expected type string for name.',
      componentConstructorTypeError: 'User Interface Error: Expected type function for constructor.'
    };

    if(UserInterface.#instance) console.error(this.#errors.singleInstanceError);
    else
    {
      UserInterface.#instance = this;
      this.#registry = new Map();
    }
  }

  /** Static method to return a new UserInterface instance. Allows for Singleton+Module pattern. */
  static getInstance() 
  {
    return new UserInterface();
  }

  /** 
   * Public method to register a new ui class. 
   * @param {array} name - The name to reference the class with.
   * @param {Multiple} constructor - The class constructor to reference.
   */
  register({ name, constructor } = {}) 
  {
    if(!typeChecker.check({ type: 'string', value: name })) console.error(this.#errors.componentNameTypeError);
    if(!typeChecker.check({ type: 'function', value: constructor })) console.error(this.#errors.componentConstructorTypeError);
    this.#registry.set(name, constructor);
    this[name] = constructor;
  }
}

/////////////////////////////////////////////////

/** Base class representing most of the components in the ui module. */
class Component
{
  #errors;
  #element;
  #onTap;
  
  /**
   * Creates the component object.
   * @param {string} tagName - Name of the html tag to be created.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor({ tagName = 'div', options } = {})
  {
    this.#errors = 
    {
      addEvEventTypeError: 'Component Error: Expected type string for event when adding an event listener',
      addEvHandlerTypeError: 'Component Error: Expected type function for handler when trying add an event listener.',
      addModModifierTypeError: 'Component Error: Expected type string when adding modifier with addModifier.',
      alphaInvalidError: 'Component Error: Alpha value must be a string between "0.0" and "1.0" inclusive.',
      alphaTypeError: 'Component Error: Expected type string for alpha.',
      backgroundColorInvalidTypeError: 'Component Error: Invalid color value provided for backgroundColor.',
      backgroundColorTypeError: 'Component Error: Expected type string for backgroundColor.',
      borderColorTypeError: 'Component Error: Expected type string for borderColor.',
      borderColorInvalidError: 'Component Error: Invalid color value for borderColor.',
      borderWidthTypeError: 'Component Error: Expected type string for borderWidth.',
      getAttributeKeyTypeError: 'Component Error: Expected type string for key when trying to get the attribute value that corresponds with the key provided.',
      heightTypeError: 'Component Error: Expected type string for height.',
      idTypeError: 'Component Error: Expected type string for id.',
      marginBottomTypeError: 'Component Error: Expected type string for marginBottom.',
      marginLeftTypeError: 'Component Error: Expected type string for marginLeft.',
      marginRightTypeError: 'Component Error: Expected type string for marginRight.',
      marginTopTypeError: 'Component Error: Expected type string for marginTop.',
      modifierTypeError: 'Component Error: Each modifier in the modifiers array must be of type string.',
      modifiersTypeError: 'Component Error: Expected type array for modifiers.',
      noTagNameParameterError: 'Component Error: No tagName parameter was detected.',
      onTapTypeError: 'Component Error: Expected type function for onTap.',
      removeAttributeKeyTypeError: 'Component Error: Expected type string for key when trying to remove the attribute value that corresponds with the key provided.',
      removeEvEventTypeError: 'Component Error: Expected type string for event when trying to remove an event listener',
      removeEvHandlerTypeError: 'Component Error: Expected type function for handler when trying to remove an event listener.',
      removeComponentError: 'Component Error: Componenet could not be removed as expected.',
      removeModModifierTypeError: 'Component Error: Expected type string when removing modifier with removeModifier.',
      setAttributeKeyTypeError: 'Component Error: Expected type string for key when trying to set the attribute value that corresponds with the key provided.',
      setAttributeValueTypeError: 'Component Error: Expected type string for value when trying to set the attribute value that corresponds with the key provided.',
      tagNameTypeError: 'Component Error: Expected type string for tagName.',
      transformTypeError: 'Component Error: Expected type string for transform.',
      widthTypeError: 'Component Error: Expected type string for width.',
      xTypeError: 'Component Error: Expected type string for x.',
      yTypeError: 'Component Error: Expected type string for y.'
    };

    if(tagName) this.#createElement({ tagName: tagName });
    if(options.alpha) this.alpha = options.alpha;
    if(options.backgroundColor) this.backgroundColor = options.backgroundColor;
    if(options.borderColor) this.borderColor = options.borderColor;
    if(options.borderWidth) this.borderWidth = options.borderWidth;
    if(options.height) this.height = options.height;
    if(options.id) this.id = options.id;
    if(options.marginBottom) this.marginBottom = options.marginBottom;
    if(options.marginLeft) this.marginLeft = options.marginLeft;
    if(options.marginRight) this.marginRight = options.marginRight;
    if(options.marginTop) this.marginTop = options.marginTop;
    if(options.modifiers) this.modifiers = options.modifiers;
    if(options.onTap) this.onTap = options.onTap;
    if(options.transform) this.transform = options.transform;
    if(options.width)  this.width = options.width;
    if(options.x) this.x = options.x;
    if(options.y) this.y = options.y;
  }
  
  /** 
   * Private method to create the base element via supplied html tag.
   * @param {string} tagName - Name of the html tag to be created.
   */
  #createElement({ tagName } = {})
  {
    if(!tagName) console.error(this.#errors.noTagNameParameterError);
    if(!typeChecker.check({ type: 'string', value: tagName })) console.error(this.#errors.tagNameTypeError);
    this.#element = document.createElement(tagName);
  }
  
  /** 
   * Get property to return the component's alpha or opacity value.
   * @return {string} The alpha or opacity value.
   */
  get alpha() 
  { 
    return this.#element.style.opacity; 
  }
  
  /** 
   * Set property to change the component's alpha or opacity value.
   * @param {string} value - The alpha or opacity value. Must be between "0.0" and "1.0" inclusive.
   */
  set alpha(value)
  { 
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.alphaTypeError);
    const numeric = parseFloat(value);
    if(isNaN(numeric) || numeric < 0.0 || numeric > 1.0) console.error(this.#errors.alphaInvalidError);
    this.#element.style.opacity = value;
  }
  
  /** 
   * Get property to return the component's background color value.
   * @return {string} The background color value.
   */
  get backgroundColor() 
  { 
    return this.#element.style.backgroundColor; 
  }
  
  /** 
   * Set property to change the component's background color value.
   * @param {string} value - The valid color value.
   */
  set backgroundColor(value)
  {   
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.backgroundColorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.backgroundColorInvalidTypeError);
    this.#element.style.backgroundColor = value;
  }

  /** 
   * Get property to return the component's border color value.
   * @return {string} The border color value.
   */
  get borderColor() 
  { 
    return this.style.borderColor 
  }

  /** 
   * Set property to change the component's border color value.
   * @param {string} value - The valid color value.
   */
  set borderColor(value) 
  {
    if(!typeChecker.check({ type: 'string', value })) console.error(this.#errors.borderColorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.borderColorInvalidError);
    this.style.borderColor = value;
    this.style.borderStyle = 'solid';
  }

  /** 
   * Get property to return the component's border width value.
   * @return {string} The border width value.
   */
  get borderWidth() 
  { 
    return this.style.borderWidth 
  }

  /** 
   * Set property to change the component's border width value.
   * @param {string} value - The valid width value.
   */
  set borderWidth(value) 
  {
    if(!typeChecker.check({ type: 'string', value })) console.error(this.#errors.borderWidthTypeError);
    this.style.borderWidth = value;
    this.style.borderStyle = 'solid';
  }
  
  /** 
   * Get property to return the component's html element structure.
   * @return {object} The html element structure of the component.
   */
  get element() 
  { 
    return this.#element; 
  }
  
  /** 
   * Get property to return the component's height value.
   * @return {string} The component's height value.
   */
  get height() 
  { 
    return this.#element.style.height; 
  }
  
  /** 
   * Set property to change the component's height value.
   * @param {string} value - The component's height value.
   */
  set height(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.heightTypeError);
    this.#element.style.height = value;
  }

  /** 
   * Get property to return the component's id value.
   * @return {string} The component's id value.
   */
  get id() 
  { 
    return this.#element.id; 
  }
  
  /** 
   * Set property to change the component's id value.
   * @param {string} value - The component's id value.
   */
  set id(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.idTypeError);
    this.#element.id = value;
    app.registerComponent({ component: this });
  }
  
  /** 
   * Get property to return the component's marginBottom value.
   * @return {string} The component's marginBottom value.
   */
  get marginBottom() 
  { 
    return this.#element.style.marginBottom; 
  }
  
  /** 
   * Set property to change the component's marginBottom value.
   * @param {string} value - The component's marginBottom value.
   */
  set marginBottom(value)
  { 
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.marginBottomTypeError);
    this.#element.style.marginBottom = value;
  }
  
  /** 
   * Get property to return the component's marginLeft value.
   * @return {string} The component's marginLeft value.
   */
  get marginLeft() 
  { 
    return this.#element.style.marginLeft; 
  }
  
  /** 
   * Set property to change the component's marginLeft value.
   * @param {string} value - The component's marginLeft value.
   */
  set marginLeft(value)
  {  
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.marginLeftTypeError);
    this.#element.style.marginLeft = value;
  }
  
  /** 
   * Get property to return the component's marginRight value.
   * @return {string} The component's marginRight value.
   */
  get marginRight() 
  { 
    return this.#element.style.marginRight; 
  }
  
  /** 
   * Set property to change the component's marginRight value.
   * @param {string} value - The component's marginRight value.
   */
  set marginRight(value)
  {  
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.marginRightTypeError);
    this.#element.style.marginRight = value;
  }
  
  /** 
   * Get property to return the component's marginTop value.
   * @return {string} The component's marginTop value.
   */
  get marginTop() 
  { 
    return this.#element.style.marginTop; 
  }
  
  /** 
   * Set property to change the component's marginTop value.
   * @param {string} value - The component's marginTop value.
   */
  set marginTop(value)
  { 
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.marginTopTypeError);
    this.#element.style.marginTop = value;
  }
  
  /** 
   * Get property to return the component's modifiers.
   * @return {array} The component's modifiers as an array.
   */
  get modifiers()
  {
    const existingModifiers = this.getAttribute({ key: "modifier" }) || "";
    return new Array(existingModifiers.split(" ").filter(Boolean));
  }
  
  /** 
   * Set property to change the component's modifiers.
   * @param {array} value - The component's modifiers.
   */
  set modifiers(value)
  {
    if(!typeChecker.check({ type: 'array', value: value })) console.error(this.#errors.modifiersTypeError); 
    value.forEach(mod => 
    { 
      if(!typeChecker.check({ type: 'string', value: mod })) console.error(this.#errors.modifierTypeError);
      setTimeout(() => { this.addModifier({ modifier: mod });}, 1)
    });
  }
  
  /** 
   * Get property to return the component's function declaration for onTap events.
   * @return {function} The component's function declaration for onTap events.
   */
  get onTap() 
  {
    return this.#onTap;
  }
  
  /** 
   * Set property to change the component's function declaration for onTap events.
   * @param {array} value - The component's function declaration for onTap events.
   */
  set onTap(value) 
  {
    if(!typeChecker.check({ type: 'function', value: value })) console.error(this.#errors.onTapTypeError);
    if(this.#onTap) this.removeEventListener({ event: 'click', handler: this.#onTap });
    this.#onTap = value;
    this.addEventListener({ event: 'click', handler: value });
  }
  
  /** 
   * Get property to return the component's internal style property.
   * @return {object} The component's internal style property.
   */
  get style() 
  { 
    return this.#element.style; 
  }

  /** 
   * Get property to return the component's internal transform property.
   * @return {string} The component's internal tranform property.
   */
  get transform() 
  { 
    return this.#element.transform; 
  }
  
  /** 
   * Set property to change the component's internal transform property.
   * @param {string} value - The component's internal transform value. 
   */
  set transform(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.transformTypeError);    
    this.#element.style.transform = value;
  }
  
  /** 
   * Get property to return the component's width.
   * @return {string} The component's width value.
   */
  get width() 
  { 
    return this.#element.style.width;
  }
  
  /** 
   * Set property to change the component's width value.
   * @param {string} value - The component's width value.
   */
  set width(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.widthTypeError);
    this.#element.style.width = value;
  }
  
  /** 
   * Get property to return the component's x.
   * @return {string} The component's x value.
   */
  get x() 
  {
    return this.#element.style.left;
  }
  
  /** 
   * Set property to change the component's x value.
   * @param {string} value - The component's x value.
   */
  set x(value) 
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.xTypeError);
    if(!this.#element.style.position) this.#element.style.position = 'absolute';
    this.#element.style.left = value;
  }
  
  /** 
   * Get property to return the component's y value.
   * @return {string} The component's y value.
   */
  get y() 
  {
    return this.#element.style.top;
  }
  
  /** 
   * Set property to change the component's y value.
   * @param {string} value - The component's y value.
   */
  set y(value) 
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.yTypeError);
    if(!this.#element.style.position) this.#element.style.position = 'absolute';
    this.#element.style.top = value;
  }
  
  /** 
   * Public method to add a custom event listener to the component.
   * @param {string} event - Event type to listen to.
   * @param {function} handler - Function to be called when the event is triggered.
   */
  addEventListener({ event, handler } = {}) 
  { 
    if(!typeChecker.check({ type: 'string', value: event })) console.error(this.#errors.addEvEventTypeError);
    if(!typeChecker.check({ type: 'function', value: handler })) console.error(this.#errors.addEvHandlerTypeError);
    this.#element.addEventListener(event, handler);
  }
  
  /** 
   * Public method to add a modifier to the component.
   * @param {string} modifier - Modifier to add to the component.
   */
  addModifier({ modifier } = {})
  {
    if(!typeChecker.check({ type: 'string', value: modifier })) console.error(this.#errors.addModModifierTypeError);
    const existingModifiers = this.getAttribute({ key: 'modifier' }) || "";
    const modifiers = new Set(existingModifiers.split(" ").filter(Boolean));
    modifiers.add(modifier);
    this.#element.setAttribute('modifier', Array.from(modifiers).join(" "));
  }
  
  /** 
   * Public method to add a child component to the current component.
   * @param {Component} child - Child component to be added to the current component.
   */
  appendChild({ child } = {}) 
  {
    if(typeChecker.check({ type: 'component', value: child })) this.#element.appendChild(child.#element);
    else this.#element.appendChild(child); 
  }
  
  /** Public method to add the disabled atrribute to the component. */
  disable() 
  { 
    this.setAttribute({ key: 'disabled', value: '' }); 
  }
  
  /** Public method to remove the disabled atrribute to the component. */
  enable() 
  { 
    this.removeAttribute({ key: 'disabled' });
  }
  
  /** 
   * Public method to get the current attribute value for the provided key of the component.
   * @param {string} key - The key to retrive the associative attribute value.
   * @return {string} The attribute value associated with the key provided
   */
  getAttribute({ key } = {}) 
  {
    if(!typeChecker.check({ type: 'string', value: key })) console.error(this.#errors.getAttributeKeyTypeError);
    return this.#element.getAttribute(key);
  }
  
  /** Public method to hide the component. */
  hide() 
  { 
    this.#element.style.display = 'none';
  }
  
  /** Public method to remove the component from the DOM. */
  remove() 
  {
    if(this.#element.parentNode) this.#element.parentNode.removeChild(this.#element);
    else console.error(this.#errors.removeComponentError);
  }
  
  /** 
   * Public method to remove the current attribute value for the provided key of the component.
   * @param {string} key - The key to remove the associative attribute value.
   */
  removeAttribute({ key } = {})
  {
    if(!typeChecker.check({ type: 'string', value: key })) console.error(this.#errors.removeAttributeKeyTypeError);
    this.#element.removeAttribute(key);
  }
  
  /** 
   * Public method to remove a custom event listener to the component.
   * @param {string} event - Event type to be removed.
   * @param {function} handler - Function to be removed.
   */
  removeEventListener({ event, handler } = {}) 
  {
    if(!typeChecker.check({ type: 'string', value: event })) console.error(this.#errors.removeEvEventTypeError);
    if(!typeChecker.check({ type: 'function', value: handler })) console.error(this.#errors.removeEvHandlerTypeError);
    this.#element.removeEventListener(event, handler);
  }
  
  /** 
   * Public method to remove a modifier to the component.
   * @param {string} modifier - Modifier to be removed to the component.
   */
  removeModifier({ modifier } = {}) 
  {
    if(!typeChecker.check({ type: 'string', value: modifier })) console.error(this.#errors.removeModModifierTypeError);
    const existingModifiers = this.getAttribute({ key: 'modifier' }) || "";
    const modifiers = new Set(existingModifiers.split(" ").filter(Boolean));
    modifiers.delete(modifier);
    this.#element.setAttribute('modifier', Array.from(modifiers).join(" "));
  }

  /** 
   * Public method to set the attribute value for the provided key of the component.
   * @param {string} key - The key to set the associative attribute value.
   * @return {string} The attribute value associated with the key provided
   */
  setAttribute({ key, value } = {}) 
  { 
    if(!typeChecker.check({ type: 'string', value: key })) console.error(this.#errors.setAttributeKeyTypeError);
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.setAttributeValueTypeError);
    this.#element.setAttribute(key, value);
  }
  
  /** Public method to show the component. */
  show() 
  { 
    this.#element.style.display = '';
  }  
}

/////////////////////////////////////////////////

/** Class representing the action sheet component. */
class ActionSheet extends Component 
{
  #buttons;
  #cancelTextColor;
  #cancelButton;
  #errors;
  #titleElement;

  /**
   * Creates the action sheet object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: "ons-action-sheet" , options: options });

    this.#errors = 
    {
      buttonsEmptyError: 'Action Sheet Error: Buttons array must contain at least one ActionSheetButton.',
      buttonTypeError: 'Action Sheet Error: Expected type ActionSheetButton for button in buttons array when creating the buttons.',
      buttonsTypeError: 'Action Sheet Error: Expected type array for buttons.',
      cancelTextColorTypeError: 'Action Sheet Error: Expected type string for cancel text color.',
      cancelTextColorInvalidError: 'Action Sheet Error: Invalid color value provided for cancel text color.',
      dismissAnimationTypeError: 'Action Sheet Error: Expected type boolean for animated when dismissing the sheet.',
      presentAnimationTypeError: 'Action Sheet Error: Expected type boolean for animated when presenting the sheet.',
      titleTypeError: 'Action Sheet Error: Expected type string for title.'
    };

    this.#titleElement = document.createElement('div');
    this.#titleElement.classList.add('action-sheet-title');
    this.element.appendChild(this.#titleElement);
    
    this.title = options.title || '';
    this.cancelTextColor = options.cancelTextColor || '#0076ff';
    if(options.buttons) this.buttons = options.buttons;
  }

  /** 
   * Get property to return the sheet's buttons.
   * @return {Array} The sheet's buttons.
   */
  get buttons()
  {
    if(!this.#buttons) return [];
    else return [...this.#buttons];
  }

  /** 
   * Set property to set and build the sheet's buttons.
   * @param {Array} value - The sheet's buttons. Will throw an error if empty or has already been set before.
   */
  set buttons(value)
  {
    if(!typeChecker.check({ type: 'array', value: value })) console.error(this.#errors.buttonsTypeError);
    if(value.length === 0) console.error(this.#errors.buttonsEmptyError);

    const sheetContainer = this.element.querySelector('.action-sheet');
    if(sheetContainer)
    {
      sheetContainer.querySelectorAll('ons-action-sheet-button').forEach(btn => { sheetContainer.removeChild(btn); });
      this.#buttons = [];
      this.#cancelButton = null;
    }

    const cancelButton = new ActionSheetButton({ text: 'Cancel', textColor: this.cancelTextColor });
    cancelButton.addEventListener({ event: "click", handler: () => 
    {
      const animated = this.getAttribute({ key: 'animation' }) === 'default';
      this.dismiss({ animated: animated });
    }});
    this.#cancelButton = cancelButton;

    const allButtons = [...value, cancelButton];

    allButtons.forEach(button => 
    { 
      if(!typeChecker.check({ type: 'action-sheet-button', value: button })) console.error(this.#errors.buttonTypeError);

      const refNode = this.#titleElement.previousSibling;
      if(!sheetContainer) this.element.insertBefore(button.element, refNode);
      else sheetContainer.insertBefore(button.element, refNode);      

      button.addEventListener({ event: "click", handler: () => 
      {
        const animated = this.getAttribute({ key: 'animation' }) === 'default';
        this.dismiss({ animated: animated });
      }});
    });

    this.#buttons = allButtons;
  }

  /** 
   * Get property to return the sheet's cancel text color value.
   * @return {string} The sheet's cancel text color value.
   */
  get cancelTextColor()
  {
    return this.#cancelTextColor;
  }

  /** 
   * Set property to set the sheet's cancel text color value.
   * @param {string} value - The sheet's cancel text color value. Will throw an error if the color value is not valid.
   */
  set cancelTextColor(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.cancelTextColorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.cancelTextColorInvalidError);

    if(this.#cancelButton) this.#cancelButton.textColor = value;
    this.#cancelTextColor = value;
  }

  /** 
   * Get property to return the sheet's title value, if previously set before.
   * @return {string} The sheet's title value, if previously set before.
   */
  get title()
  {
    return this.#titleElement.textContent;
  }

  /** 
   * Set property to set the sheet's title value, if not previously set before.
   * @param {string} value - The sheet's title value.
   */
  set title(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.titleTypeError);
    this.#titleElement.textContent = value;
  }

  /**
   * Public method to dismiss a action sheet.
   * @param {boolean} animated - Boolean value to determine if the action sheet should be dismissed with animation or not. True by default.
   */
  dismiss({ animated = true } = {})
  {
    if(!typeChecker.check({ type: 'boolean', value: animated })) console.error(this.#errors.dismissAnimationTypeError);
    
    if(animated) this.setAttribute({ key: 'animation', value: 'default' });
    else this.setAttribute({ key: 'animation', value: 'none' });
    
    this.element.hide();
  }
  
  /**
   * Public method to present an action sheet.
   * @param {boolean} animated - Boolean value to determine if the action sheet should be presented with animation or not. True by default.
   */
  present({ animated = true } = {})
  {
    if(!typeChecker.check({ type: 'boolean', value: animated })) console.error(this.#errors.presentAnimationTypeError);
    
    if(animated == true) this.setAttribute({ key: 'animation', value: 'default' });
    else this.setAttribute({ key: 'animation', value: 'none' });
   
    document.body.appendChild(this.element);
    this.element.show();
  }
}

/////////////////////////////////////////////////

/** Class representing the action sheet button component. */
class ActionSheetButton extends Component 
{
  #errors;

  /**
   * Creates the action sheet button object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: "ons-action-sheet-button", options: options });

    this.#errors = 
    {
      textColorInvalidError: 'Action Sheet Button Error: Invalid color value provided for text color.',
      textColorTypeError: 'Action Sheet Button Error: Expected type string for text color.',
      textTypeError: 'Action Sheet Button Error: Expected type string for text.',
    };

    this.text = options.text || '';
    this.textColor = options.textColor || '#0076ff';
  }
  
  /** 
   * Get property to return the button's text value.
   * @return {string} The button's text value.
   */
  get text()
  {
    return this.element.textContent;
  }
  
  /** 
   * Set property to set the button's text value.
   * @param {string} value - The button's text value.
   */
  set text(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.textTypeError);
    this.element.textContent = value;
  }
  
  /** 
   * Get property to return the button's text color value.
   * @return {string} The button's text color value.
   */
  get textColor()
  {
    return this.element.style.color;
  }
  
  /** 
   * Set property to set the button's text color value.
   * @param {string} value - The button's text color value. Will throw an error if the color value is not valid.
   */
  set textColor(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.textColorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.textColorInvalidError);
    this.element.style.color = value;
  }
}

/////////////////////////////////////////////////

/** Class representing the alert dialog component. */
class AlertDialog extends Component 
{
  #errors;
  #buttons;
  #cancelable;
  #contentElement;
  #footerElement;
  #rowfooter;
  #titleElement;
  
  /**
   * Creates the alert dialog object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'ons-alert-dialog', options: options });
    this.setAttribute({ key: 'modifier', value: 'custom-alert' });

    this.#errors = 
    {
      buttonsEmptyError: 'Alert Dialog Error: Buttons array must contain at least one ActionSheetButton.',
      buttonTypeError: 'Alert Dialog Error: Expected type alert dialog button for button in buttons array.',
      buttonsTypeError: 'Alert Dialog Error: Expected type array for buttons when creating the dialog buttons.',
      cancelableTypeError: 'Alert Dialog Error: Expected type boolean for cancelable.',
      componentsTypeError: 'Alert Dialog Error: Expected type array for components in addComponents call.',
      componentTypeError: 'Alert Dialog Error: Expected type component in components array.',
      dismissAnimationTypeError: 'Alert Dialog Error: Expected type boolean for animated when dismissing the dialog.',
      presentAnimationTypeError: 'Alert Dialog Error: Expected type boolean for animated when presenting the dialog.',
      rowfooterTypeError: 'Alert Dialog Error: Expected type boolean for rowfooter.',
      titleTypeError: 'Alert Dialog Error: Expected type string for title.'
    };

    this.#titleElement = document.createElement('div');
    this.#titleElement.classList.add('alert-dialog-title');
  
    this.#contentElement = document.createElement('div');
    this.#contentElement.classList.add('alert-dialog-content');
  
    this.#footerElement = document.createElement('div');
    this.#footerElement.classList.add('alert-dialog-footer');
  
    this.element.appendChild(this.#titleElement);
    this.element.appendChild(this.#contentElement);
    this.element.appendChild(this.#footerElement);

    this.title = options.title || '';
    this.cancelable = options.cancelable || true;
    this.rowfooter = options.rowfooter || true;
    if(options.buttons) this.buttons = options.buttons;
  }

  /** 
   * Get property to return the dialog's buttons.
   * @return {array} The dialog's buttons.
   */
  get buttons()
  {
    if(!this.#buttons) return [];
    else return [...this.#buttons];
  }

  /** 
   * Set property to set the dialog's buttons.
   * @param {array} value - The dialog's buttons. Will throw an error if value is empty.
   */
  set buttons(value)
  {
    if(!typeChecker.check({ type: 'array', value: value })) console.error(this.#errors.buttonsTypeError);
    if(value.length === 0) console.error(this.#errors.buttonsEmptyError);

    if(this.#buttons) 
    {
      this.#footerElement.innerHTML = '';
      this.#buttons = [];
    }

    value.forEach(button => 
    {
      if(!typeChecker.check({ type: 'alert-dialog-button', value: button })) console.error(this.#errors.buttonTypeError);

      button.addEventListener({ event: 'click', handler: () => 
      {
        var animated = false;
        if(this.getAttribute({ key: 'animation' }) == 'default') animated = true;
        this.hide({ animated: animated });
      }});

      this.#footerElement.appendChild(button.element);
    });

    this.#buttons = value;
  }

  /** 
   * Get property to return if the dialog is cancelable or not.
   * @return {boolean} The dialog's cancelable value.
   */
  get cancelable()
  {
    return this.#cancelable;
  }

  /** 
   * Set property to set the dialog's cancelable value.
   * @param {boolean} value - The dialog's cancelable value.
   */
  set cancelable(value)
  {
    if(!typeChecker.check({ type: 'boolean', value: value })) console.error(this.#errors.cancelableTypeError);
    if(value == true) this.setAttribute({ key: 'cancelable', value: '' });
    else this.removeAttribute({ key: 'cancelable' });
    this.#cancelable = value;
  }

  /** 
   * Get property to return the dialog's title.
   * @return {string} The dialog's title value.
   */
  get title()
  {
    return this.#titleElement.textContent;
  }

  /** 
   * Set property to set the dialog's title value.
   * @param {string} value - The dialog's title value.
   */
  set title(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.titleTypeError);
    this.#titleElement.textContent = value;
  }

  /** 
   * Get property to return if the dialog is configured in a rowfooter or not.
   * @return {boolean} The dialog's rowfooter value.
   */
  get rowfooter()
  {
    return this.#rowfooter;
  }

  /** 
   * Set property to set the dialog's rowfooter value.
   * @param {boolean} value - The dialog's rowfooter value.
   */
  set rowfooter(value)
  {
    if(!typeChecker.check({ type: 'boolean', value: value })) console.error(this.#errors.rowfooterTypeError);
    if(value == true) this.addModifier({ modifier: 'rowfooter' });
    else this.removeModifier({ modifier: 'rowfooter' });
    this.#rowfooter = value;
  }

  /**
   * Public method add other components to the content of the dialog.
   * @param {array} components - Components to be added to the content of the dialog.
   */
  addComponents({ components } = {})
  {
    if(!typeChecker.check({ type: 'array', value: components })) console.error(this.#errors.componentsTypeError);
    
    components.forEach(component =>
    {
      if(!typeChecker.check({ type: 'component', value: component })) console.error(this.#errors.componentTypeError);
      this.#contentElement.appendChild(component.element);
    });
  }

  /**
   * Public method to hide an alert dialog, that has previously been shown.
   * @param {boolean} animated - Boolean value to determine if the alert dialog should be hidden with animation or not.
   */
  dismiss({ animated = true } = {})
  {
    if(!typeChecker.check({ type: 'boolean', value: animated })) console.error(this.#errors.dismissAnimationTypeError);

    if(animated == true) this.setAttribute({ key: 'animation', value: 'default' });
    else this.setAttribute({ key: 'animation', value: 'none' });
  
    this.element.hide();
  }

  /**
   * Public method to show an alert dialog.
   * @param {boolean} animated - Boolean value to determine if the alert dialog should be shown with animation or not.
   */
  present({ animated = true } = {})
  {
    if(!typeChecker.check({ type: 'boolean', value: animated })) console.error(this.#errors.presentAnimationTypeError);

    if(animated == true ) this.setAttribute({ key: 'animation', value: 'default' });
    else this.setAttribute({ key: 'animation', value: 'none' });
    
    document.body.appendChild(this.element);
    this.element.show();
  }
}

/////////////////////////////////////////////////

/** Class representing the alert dialog button component. */
class AlertDialogButton extends Component
{
  #errors;

  /**
   * Creates the alert dialog button object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {})
  {
    super({ tagName: 'ons-alert-dialog-button', options: options });

    this.#errors = 
    {
      textColorInvalidError: 'Alert Dialog Button Error: Invalid color value provided for text color.',
      textColorTypeError: 'Alert Dialog Button Error: Expected type string for text color.',
      textTypeError: 'Alert Dialog Button Error: Expected type string for text.'
    }
    
    this.text = options.text || '';
    this.textColor = options.textColor || '#0076ff';
  }
  
  /** 
   * Get property to return the button's text value.
   * @return {string} The button's text value.
   */
  get text()
  {
    return this.element.textContent;
  }
  
  /** 
   * Set property to set the button's text value.
   * @param {string} value - The button's text value.
   */
  set text(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.textTypeError);
    this.element.textContent = value;
  }
  
  /** 
   * Get property to return the button's text color value.
   * @return {string} The button's text color value.
   */
  get textColor()
  {
    return this.element.style.color;
  }
  
  /** 
   * Set property to set the button's text color value.
   * @param {string} value - The button's text color value. Will throw an error if the color value is not valid.
   */
  set textColor(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.textColorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.textColorInvalidError);
    this.element.style.color = value;
  }
}

/////////////////////////////////////////////////

/** Class representing the BarBackButton component. */
class BackBarButton extends Component 
{  
  #errors;

  /**
   * Creates the bar back button object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'ons-back-button', options: options });

    this.#errors = 
    {
      textColorInvalidError: 'Bar Back Button Error: Invalid color value provided for text color.',
      textColorTypeError: 'Bar Back Button Error: Expected type string for text color.',
      textTypeError: 'Bar Back Button Error: Expected type string for text.'
    }

    this.text = options.text || 'Back';
    if(options.textColor) this.textColor = options.textColor;
    this.style.paddingRight = '12px';
    this.style.paddingLeft = '12px'; 
  }
  
  /** 
   * Get property to return the button's text value.
   * @return {string} The button's text value.
   */
  get text()
  {
    return this.element.textContent;
  }
  
  /** 
   * Set property to set the button's text value.
   * @param {string} value - The button's text value.
   */
  set text(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.textTypeError);  
    if(this.element.querySelector(".back-button__label")) label.textContent = value;
    else this.element.textContent = value; 
  }
  
  /** 
   * Get property to return the button's text color value.
   * @return {string} The button's text color value.
   */
  get textColor()
  {
    return this.element.style.color;
  }
  
  /** 
   * Set property to set the button's text color value.
   * @param {string} value - The button's text color value. Will throw an error if the color value is not valid.
   */
  set textColor(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.textColorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.textColorInvalidError);

    this.element.style.color = value;
    requestAnimationFrame(() => 
    {
      const arrowIcon = this.element.querySelector(".back-button__icon");
      if(arrowIcon) arrowIcon.style.fill = value;
    });
  }
}

/////////////////////////////////////////////////

/** Class representing the BarButton component. */
class BarButton extends Component
{
  #containsIcon;
  #containsText;
  #errors;
  #iconElement = null;
  
  /**
   * Creates the BarButton object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {})
  {
    super({ tagName: 'ons-toolbar-button', options: options });

    this.#errors = 
    {
      buttonTypeError: "Bar Button Error: Button can only have either 'text' or 'icon', not both.",
      colorInvalidError: 'Bar Button Error: Invalid color value provided for color.',
      colorTypeError: 'Bar Button Error: Expected type string for color.',
      iconTypeError: 'Bar Button Error: Expected type string or Icon for icon.',
      textTypeError: 'Bar Button Error: Expected type string for text.'
    };

    this.#containsIcon = false;
    this.#containsText = false;

    if(options.text && options.icon) console.error(this.#errors.buttonTypeError);
    if(options.text) this.text = options.text;
    else if(options.icon) this.icon = options.icon;
    if(options.color) this.color = options.color;
  }

  /** 
   * Get property to return the color of the button.
   * @return {string} The color of the button.
   */
  get color()
  {
    return this.element.style.color;
  }
  
  /** 
   * Set property to set the color of the button.
   * @param {string} value - The color of the button.
   */
  set color(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.colorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.colorInvalidError);
    this.element.style.color = value;
  }

  /** 
   * Get property to return the icon of the button.
   * @return {Multiple} The icon of the button.
   */
  get icon()
  {
    return this.#iconElement?.icon || null;
  }
  
  /** 
   * Set property to set the icon of the button.
   * @param {Multiple} value - The icon of the button. Accepts string or Icon.
   */
  set icon(value)
  {
    if(this.#containsText == true) console.error(this.#errors.buttonTypeError);
    if(this.#iconElement) this.element.innerHTML = '';
    if(typeChecker.check({ type: 'string', value: value })) this.#iconElement = new Icon({ icon: value });
    else if(typeChecker.check({ type: 'icon', value: value })) this.#iconElement = value;
    else console.error(this.#errors.iconTypeError);
    this.appendChild({ child: this.#iconElement.element });
    this.#containsIcon = true;
  }
  
  /** 
   * Get property to return the text of the button.
   * @return {string} The text of the button.
   */
  get text()
  {
    return this.element.textContent;
  }
  
  /** 
   * Set property to set the text of the button.
   * @param {string} value - The text of the button.
   */
  set text(value)
  {
    if(this.#containsIcon == true) console.error(this.#errors.buttonTypeError);
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.textTypeError);

    let span = document.createElement('span');
    span.textContent = value;
    span.classList = 'back-button__label';
    //span.style.paddingLeft = '12px';
    //span.style.paddingRight = '4px';
    //span.appendChild(value);
    this.element.appendChild(span);
    this.#containsText = true;
  }
}

/////////////////////////////////////////////////

/** Class representing the back button component. Supported modifiers: outline, light, quiet, large */
class Button extends Component 
{
  #contentWrapper;
  #errors;
  #textElement ;
  #textWrapper;
  #iconElement;
  #iconSide;

  /**
   * Creates the back button object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'ons-button', options: options });

    this.#errors = 
    {
      iconColorInvalidError: 'Button Error: Invalid color value provided for icon color.',
      iconColorTypeError: 'Button Error: Expected type string for icon color.',
      iconSideInvalidSideError: 'Button Error: Invalid value provided for icon side. Accepted values are left or right',
      iconSideTypeError: 'Button Error: Expected type string for icon side.',
      iconTypeError: 'Button Error: Expected type string for icon.',
      textColorInvalidError: 'Button Error: Invalid color value provided for text color.',
      textColorTypeError: 'Button Error: Expected type string for text color.',
      textTypeError: 'Button Error: Expected type string for text.'
    }

    this.#contentWrapper = document.createElement('span');
    this.#contentWrapper.style.display = 'inline-flex';
    this.#contentWrapper.style.alignItems = 'center';
    this.#contentWrapper.style.justifyContent = 'center';
    this.#contentWrapper.style.gap = '0.5em';

    this.#textWrapper = document.createElement('span');
    this.#textElement = document.createTextNode('');
    this.#textWrapper.appendChild(this.#textElement);

    this.appendChild({ child: this.#contentWrapper });

    if(options.text) this.text = options.text;
    if(options.textColor) this.textColor = options.textColor;
    if(options.icon) this.icon = options.icon;
    if(options.iconColor) this.iconColor = options.iconColor;
    if(options.iconSide === 'right') this.iconSide = 'right';
    else this.iconSide = 'left';

    this.#render();  
  }

  /** Private method to re-render the button internally. */
  #render() 
  {
    this.#contentWrapper.innerHTML = '';
  
    if(this.iconSide === 'left') 
    {
      if(this.#iconElement) this.#contentWrapper.appendChild(this.#iconElement.element);
      if(this.#textWrapper) this.#contentWrapper.appendChild(this.#textWrapper);
    }
    else 
    {
      if(this.#textWrapper) this.#contentWrapper.appendChild(this.#textWrapper);
      if(this.#iconElement) this.#contentWrapper.appendChild(this.#iconElement.element);
    }
  }

  /** 
   * Get property to return the button's icon value.
   * @return {string} The button's icon value.
   */
  get icon() 
  {
    return this.#iconElement?.icon || null;
  }

  /** 
   * Set property to set the button's icon value.
   * @param {string} value - The button's icon value. Re-renders the button.
   */
  set icon(value) 
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.iconTypeError);
    if(this.#iconElement) this.#iconElement.icon = value;
    else this.#iconElement = new Icon({ icon: value });
    this.#render();
  }

  /** 
   * Get property to return the button's icon color value.
   * @return {string} The button's icon color value.
   */
  get iconColor() 
  {
    return this.#iconElement?.element.style.color || null;
  }

  /** 
   * Set property to set the button's icon color value.
   * @param {string} value - The button's icon color value. Will throw an error if the color value is not valid.
   */
  set iconColor(value) 
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.iconColorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.iconColorInvalidError);
    if(this.#iconElement) this.#iconElement.element.style.color = value;
  }

  /** 
   * Get property to return the button's icon side value.
   * @return {string} The button's icon side value. Defaults to left.
   */
  get iconSide()
  {
    return this.#iconSide;
  }

  /** 
   * Set property to set the button's icon side value.
   * @param {string} value - The button's icon side value. Re-renders the button. Throw an error if left or right is a given value.
   */
  set iconSide(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.iconSideTypeError);
    if(!['left', 'right'].includes(value)) console.error(this.#errors.iconSideInvalidSideError);

    this.#iconSide = value;
    this.#render();
  }

  /** 
   * Get property to return the button's text value.
   * @return {string} The button's text value.
   */
  get text() 
  {
    return this.#textElement?.nodeValue || null;
  }

  /** 
   * Set property to set the button's text value.
   * @param {string} value - The button's text value. Re-renders the button.
   */
  set text(value) 
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.textTypeError);
    this.#textElement.nodeValue = value;
    this.#render();
  }

  /** 
   * Get property to return the button's text color value.
   * @return {string} The button's text color value.
   */
  get textColor() 
  {
    return this.#textWrapper?.style.color || null;
  }
  
  /** 
   * Set property to set the button's text color value.
   * @param {string} value - The button's text color value. Will throw an error if the color value is not valid.
   */
  set textColor(value) 
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.textColorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.textColorInvalidError);
    if(this.#textWrapper) this.#textWrapper.style.color = value;
  }
}

/////////////////////////////////////////////////

/** Class representing the card component. */
class Card extends Component
{
  #errors;

  /**
   * Creates the card object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {})
  {
    super({ tagName: 'ons-card', options: options });

    this.#errors = 
    {
      componentTypeError: 'Card Error: Expected type component for component.',
      componentsTypeError: 'Card Error: Expected type array for components.',
      pageUnsupportedTypeError: 'Card Error: Cannot add a page to a card component. See modal instead.'
    }
  }

  /**
   * Public method to add one or multiple components to a card.
   * @param {array} components - Array of components to be added to the card.
   */
  addComponents({ components } = {})
  {
    if(!typeChecker.check({ type: 'array', value: components })) console.error(this.#errors.componentsTypeError);
    components.forEach(component =>
    {
      if(!typeChecker.check({ type: 'component', value: component })) console.error(this.#errors.componentTypeError);
      if(typeChecker.check({ type: 'page', value: component })) console.error(this.#errors.pageUnsupportedTypeError);
      this.appendChild({ child: component });
    });
  }
}

/////////////////////////////////////////////////

/** Class representing the circular progress component. */
class CircularProgress extends Component
{
  #errors;
  #color;
  #indeterminate;
  #progress;
  #secondaryColor;
  #secondaryProgress;
  #size;
  
  /**
   * Creates the back button object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {})
  {
    super({ tagName: 'ons-progress-circular', options: options });

    this.#errors =
    {
      indeterminateTypeError: 'Circular Progress Error: Expected type boolean for indeterminate.',
      colorTypeError: 'Circular Progress Error: Expected type string for color.',
      colorInvalidError: 'Circular Progress Error: Invalid color value provided for color.',
      progressTypeError: 'Circular Progress Error: Expected type number for progress.',
      progressValueInvalidError: 'Circular Progress Error: Expected number between 0 and 100.',
      secondaryColorTypeError: 'Circular Progress Error: Expected type string for secondaryColor.',
      secondaryColorInvalidError: 'Circular Progress Error: Invalid color value provided for secondaryColor.',
      secondaryProgressTypeError: 'Circular Progress Error: Expected type number for secondary progress.',
      sizeTypeError: 'Circular Progress Error: Expected type string for size.'
    }

    this.indeterminate = options.indeterminate || false;
    this.progress = options.progress || 0;
    this.secondaryProgress = options.secondaryProgress || 0;
    this.size = options.size || '32px';
    this.color = options.color || '#1f8dd6';
    this.secondaryColor = options.secondaryColor || '#65adff';
  }

  /** 
   * Get property to return the color of the circular progress.
   * @return {string} The color of the circular progress.
   */
  get color() 
  { 
    return this.#color; 
  }
  
  /** 
   * Set property to set the color of the circular progress.
   * @param {string} value - The color of the circular progress.
   */
  set color(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.colorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.colorInvalidError);
    this.style.setProperty('--progress-circle-primary-color', value);
    this.#color = value;
  }
  
  /** 
   * Get property to return the indeterminate status of the circular progress.
   * @return {boolean} The indeterminate status of the circular progress.
   */
  get indeterminate() 
  { 
    return this.#indeterminate; 
  }
  
  /** 
   * Set property to set the indeterminate status of the circular progress.
   * @param {boolean} value - The indeterminate status of the circular progress.
   */
  set indeterminate(value)
  {
    if(!typeChecker.check({ type: 'boolean', value: value })) console.error(this.#errors.indeterminateTypeError);
    if(value == true) this.setAttribute({ key: 'indeterminate', value: '' });
    else this.removeAttribute({ key: 'indeterminate' });
    this.#indeterminate = value;
  }
  
  /** 
   * Get property to return the progress value of the circular progress.
   * @return {number} The progress value of the circular progress.
   */
  get progress() 
  { 
    return this.#progress; 
  }

  /** 
   * Set property to set the progress value of the circular progress.
   * @param {number} value - The progress value of the circular progress.
   */
  set progress(value) 
  { 
    if(!typeChecker.check({ type: 'number', value: value })) console.error(this.#errors.progressTypeError);
    if(value >= 0 && value <= 100)
    {
      this.setAttribute({ key: 'value', value: String(value) }); 
      this.#progress = value;
    }
    else console.error(this.#errors.progressValueInvalidError); 
  }

  /** 
   * Get property to return the secondary color of the circular progress.
   * @return {string} The secondary color of the circular progress.
   */
  get secondaryColor() 
  { 
    return this.#secondaryColor; 
  }
  
  /** 
   * Set property to set the secondary color of the circular progress.
   * @param {string} value - The secondary color of the circular progress.
   */
  set secondaryColor(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.secondaryColorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.secondaryColorInvalidError);
    this.style.setProperty('--progress-circle-secondary-color', value);
    this.#secondaryColor = value;
  }

  /** 
   * Get property to return the secondary progress value of the circular progress.
   * @return {number} The secondary progress value of the circular progress.
   */
  get secondaryProgress() 
  { 
    return this.#secondaryProgress; 
  }

  /** 
   * Set property to set the secondary progress value of the circular progress.
   * @param {number} value - The secondary progress value of the circular progress.
   */
  set secondaryProgress(value) 
  { 
    if(!typeChecker.check({ type: 'number', value: value })) console.error(this.#errors.secondaryProgressTypeError);
    if(value >= 0 && value <= 100)
    {
      this.setAttribute({ key: 'secondary-value', value: String(value) });
      this.#secondaryProgress = value;
    }
    else console.error(this.#errors.progressValueInvalidError);
  }
  
  /** 
   * Get property to return the size value of the circular progress.
   * @return {string} The size value of the circular progress.
   */
  get size() 
  { 
    return this.#size; 
  }
  
  /** 
   * Set property to set the size of the circular progress.
   * @param {string} value - The size of the circular progress.
   */
  set size(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.sizeTypeError);
    this.width = value;
    this.height = value;
    this.#size = value;
  }
}

/////////////////////////////////////////////////

/** Class representing the color picker component. */
class ColorPicker extends Component 
{
  #errors;
  #onChange;
  
  /**
   * Creates the color picker object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'input', options: options });
    this.setAttribute({ key: 'type', value: 'color' });

    this.#errors = 
    {
      colorInvalidError: 'Color Picker Error: Invalid color value provided for color. Must supply hex value.',
      colorTypeError: 'Color Picker Error: Expected type string for color.',
      onChangeTypeError: 'Color Picker Error: Expected type function for onChange.',
    }
    
    if(options.onChange) this.onChange = options.onChange;
    if(options.color) this.color = options.color;
  }
  
  /** 
   * Get property to return the function called with onChange events.
   * @return {function} The function called with onChange events.
   */
  get onChange() 
  { 
    return this.#onChange; 
  }

  /** 
   * Set property to set the function called with onChange events.
   * @param {function} value - The function called with onChange events.
   */
  set onChange(value)
  {
    if(!typeChecker.check({ type: 'function', value: value })) console.error(this.#errors.onChangeTypeError);

    if(this.#onChange) this.removeEventListener({ event: 'change', handler: this.#onChange });

    const handler = (input) => value(event.target.value);
    this.#onChange = handler;
    this.addEventListener({ event: 'change', handler });
  }

  /** 
   * Get property to return the color value of the picker.
   * @return {string} The color value of the picker.
   */
  get color() 
  { 
    return this.element.value; 
  }

  /** 
   * Set property to set the color value of the picker.
   * @param {string} value - The value of the color picker. Will throw an error if the color value is not valid.
   */
  set color(value) 
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.colorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.colorInvalidError);
    if(!color.isHexColor({ color: value })) console.error(this.#errors.colorInvalidError);
    this.element.value = value;
  }
}

/////////////////////////////////////////////////

/** Class representing a column component. */
class Column extends Component 
{ 
  #errors;
  #width;

  /**
   * Creates the column object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'ons-col', options });

    this.#errors = 
    {
      centerTypeError: 'Column Error: Expected type boolean for center.',
      componentTypeError: 'Column Error: Expected type component for component.',
      componentsTypeError: 'Column Error: Expected type array for components in addComponents call.',
      widthTypeError: 'Column Error: Expected type string for width.',
    };

    if(options.width) this.width = options.width;
  }

  /**
   * Get property to return the width of the column.
   * @return {string} The current width value.
   */
  get width() 
  {
    return this.#width;
  }

  /**
   * Set property to set the width of the column.
   * @param {string} value - Width of the column.
   */
  set width(value) 
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.widthTypeError);
    this.setAttribute({ key: 'width', value });
    this.#width = value;
  }

  /**
   * Public method to add one or multiple components to a column.
   * @param {array} components - Array of components to be added to the column.
   */
  addComponents({ components, center = true } = {}) 
  { 
    if(!typeChecker.check({ type: 'array', value: components })) console.error(this.#errors.componentsTypeError);
    if(!typeChecker.check({ type: 'boolean', value: center })) console.error(this.#errors.centerTypeError);
    components.forEach(component => 
    {
      if(!typeChecker.check({ type: 'component', value: component })) console.error(this.#errors.componentTypeError);
      if(center == true)
      {
        const centerContainer = document.createElement('div');
        centerContainer.style.display = 'flex';
        centerContainer.style.justifyContent = 'center';
        centerContainer.style.alignItems = 'center';
        centerContainer.style.width = '100%';
        centerContainer.style.height = '100%';
        
        centerContainer.appendChild(component.element);
        this.appendChild({ child: centerContainer });
      }
      else this.element.appendChild(component.element);
    });
  }
}

/////////////////////////////////////////////////

/** Class representing the dialog component. */
class Dialog extends Component
{
  #cancelable;
  #errors;
  #height;
  #root;
  #width;
  
  /**
   * Creates the dialog object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {})
  {
    super({ tagName: 'ons-dialog', options: options });

    this.#errors = 
    {
      cancelableTypeError: 'Dialog Error: Expected type boolean for cancelable.',
      componentTypeError: 'Dialog Error: Expected type component in components array.',
      componentsTypeError: 'Dialog Error: Expected type array for components in addComponents call.',
      dismissAnimationTypeError: 'Dialog Error: Expected type boolean for animated when dismissing the dialog.',
      heightTypeError: 'Dialog Error: Expected type string for height.',
      presentAnimationTypeError: 'Dialog Error: Expected type boolean for animated when presenting the dialog.',
      rootComponentTypeError: 'Dialog Error: Expected type Page when adding page to dialog.',
      rootComponentAlreadyAddedError: 'Dialog Error: Dialog already contains a root component.',
      rootComponentPreventsOtherComponentsError: 'Dialog Error: Dialog already contains an instance of root and cannot add any other components.',
      widthTypeError: 'Dialog Error: Expected type string for width.'
    }

    this.cancelable = options.cancelable || true;
    if(options.height) this.height = options.height;
    if(options.width) this.width = options.width;
  }

  /** 
   * Get property to return if the dialog is cancelable or not.
   * @return {boolean} The dialog's cancelable value.
   */
  get cancelable()
  {
    return this.#cancelable;
  }

  /** 
   * Set property to set the dialog's cancelable value.
   * @param {boolean} value - The dialog's cancelable value.
   */
  set cancelable(value)
  {
    if(!typeChecker.check({ type: 'boolean', value: value })) console.error(this.#errors.cancelableTypeError);
    if(value == true) this.setAttribute({ key: 'cancelable', value: '' });
    else this.removeAttribute({ key: 'cancelable' });
    this.#cancelable = value;
  }

  /** 
   * Get property to return the dialog's height.
   * @return {string} The dialog's height.
   */
  get height()
  {
    return this.#height;
  }
  
  /** 
   * Set property to change the dialog's height.
   * @param {string} value - The dialog's height. 
   */
  set height(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.heightTypeError);

    setTimeout(() => 
    {
      const inner = this.element.querySelector('.dialog');
      if(inner) inner.style.height = value;
      this.#height = value;
    }, 1);
  }
  
  /** 
   * Get property to return the dialog's width.
   * @return {string} The dialog's width.
   */
  get width()
  {
    return this.#width;
  }
  
  /** 
   * Set property to change the dialog's width.
   * @param {string} value - The dialog's width. 
   */
  set width(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.widthTypeError);

    setTimeout(() => 
    {
      const inner = this.element.querySelector('.dialog');
      if(inner) inner.style.width = value;
      this.#width = value;
    }, 1);
  }
  
  /**
   * Public method to add one or multiple components to a dialog.
   * @param {array} components - Array of components to be added to the dialog. Will throw an error if it already contains a root component type.
   */
  addComponents({ components } = {})
  {
    if(this.#root) console.error(this.#errors.rootComponentPreventsOtherComponentsError);
    if(!typeChecker.check({ type: 'array', value: value })) console.error(this.#errors.componentsTypeError);
   
    components.forEach(component =>
    {
      if(!typeChecker.check({ type: 'component', value: component })) console.error(this.#errors.componentTypeError);
      this.appendChild({ child: component });
    });
  }
  
  /**
   * Public method to dismiss a dialog, that has previously been shown.
   * @param {boolean} animated - Boolean value to determine if the dialog should be dismissed with animation or not.
   */
  dismiss({ animated = true } = {})
  {
    if(!typeChecker.check({ type: 'boolean', value: animated })) console.error(this.#errors.dismissAnimationTypeError);
    if(animated) this.setAttribute({ key: 'animation', value: 'default' });
    else this.setAttribute({ key: 'animation', value: 'none' });    
    this.element.hide();
  }
  
  /**
   * Public method to present a dialog.
   * @param {boolean} animated - Boolean value to determine if the dialog should be shown with animation or not.
   */
  present({ animated = true, root = null } = {})
  {
    if(!this.#root)
    {
      if(root)
      {
        if(!typeChecker.check({ type: 'page', value: root })) console.error(this.#errors.rootComponentTypeError); // Need to add Navigator support here.
        setTimeout(() => 
        {
          const container = this.element.querySelector('.dialog-container');
          container.appendChild(root.element);
        }, 1)
        this.#root = root;
      }
    }

    if(!typeChecker.check({ type: 'boolean', value: animated })) console.error(this.#errors.presentAnimationTypeError);
    if(animated) this.setAttribute({ key: 'animation', value: 'default' });
    else this.setAttribute({ key: 'animation', value: 'none' });

    setTimeout(() => 
    {
      document.body.appendChild(this.element);
      this.element.show();
    }, 1);
  }
}

/////////////////////////////////////////////////

/** Class representing the fab button component. */
class FabButton extends Component 
{
  #errors;
  #iconElement;
  #position;

  /**
   * Creates the fab button object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'ons-fab', options: options });

    this.#errors = 
    {
      iconColorInvalidError: 'Fab Button Error: Invalid color value provided for icon color.',
      iconColorTypeError: 'Fab Button Error: Expected type string for icon color.',
      iconTypeError: 'Fab Button Error: Expected type string or icon for icon.',
      positionInvalidError: 'Fab Button Error: Invalid value for position. Valid values are: top-left, top-right, bottom-left or bottom-right.',
      positionTypeError: 'Fab Button Error: Expected type string for position.'
    }
  
    if(options.icon) this.icon = options.icon;
    if(options.iconColor) this.iconColor = options.iconColor;
    this.position = options.position || 'bottom-right';
  }
  
  /** 
   * Get property to return the button's icon value.
   * @return {string} The button's icon value.
   */
  get icon()
  {
    return this.#iconElement?.icon || null;
  }
  
  /** 
   * Set property to set the button's icon value.
   * @param {multiple} value - The button's icon value. Can accept string or icon type.
   */
  set icon(value)
  {
    if(this.#iconElement) this.element.innerHTML = '';
    if(typeChecker.check({ type: 'string', value: value }))
    {
      this.#iconElement = new Icon({ icon: value, size: '28px' });
      this.#iconElement.transform = 'translateY(-4px)';
    }
    else if(typeChecker.check({ type: 'icon', value: value })) this.#iconElement = value;
    else console.error(this.#errors.iconTypeError);
    
    this.element.appendChild(this.#iconElement.element);
  }
  
  /** 
   * Get property to return the button's icon color value.
   * @return {string} The button's icon color value.
   */
  get iconColor()
  {
    if(this.#iconElement) return this.#iconElement.element.style.color;
  }
  
  /** 
   * Set property to set the button's icon color value.
   * @param {string} value - The button's icon color value. Will throw an error if the color value is not valid.
   */
  set iconColor(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.iconColorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.iconColorInvalidError);
    if(this.#iconElement)  this.#iconElement.element.style.color = value;
  }
  
  /** 
   * Get property to return the button's position value.
   * @return {string} The button's position value.
   */
  get position()
  {
    return this.#position;
  }
  
  /** 
   * Set property to set the button's position value.
   * @param {string} value - The button's position value. Will throw an error if the value is not one of the following: top-left, top-right, bottom-left or bottom-right.
   */
  set position(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.positionTypeError);

    const validPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    if(!validPositions.includes(value)) console.error(this.#errors.positionInvalidError);

    let pos = '';
    if(value == 'top-left') pos = 'top left';
    if(value == 'top-right') pos = 'top right';
    if(value == 'bottom-left') pos = 'bottom left';
    if(value == 'bottom-right') pos = 'bottom right';

    this.setAttribute({ key: 'position', value: pos });
    this.#position = value;
  }
}

/////////////////////////////////////////////////

/** Class representing the icon component. */
class Icon extends Component
{
  #errors;
  #icon;
  #size;
  #spin;
  
  /**
   * Creates the icon object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {})
  {
    super({ tagName: 'ons-icon', options: options });

    this.#errors = 
    {
      colorInvalidError: 'Icon Error: Invalid color value provided for color.',
      colorTypeError: 'Icon Error: Expected type string for color.',
      iconTypeError: 'Icon Error: Expected type string for icon.',
      sizeTypeError: 'Icon Error: Expected type string for size.',
      spinTypeError: 'Icon Error: Expected type boolean for spin.',
    }

    if(options.color) this.color = options.color;
    if(options.icon) this.icon = options.icon;
    if(options.size) this.size = options.size;
    this.spin = options.spin || false;
  }
  
  /** 
   * Get property to return the icon's icon value.
   * @return {string} The icon's icon value.
   */
  get icon() 
  { 
    return this.#icon; 
  }
  
  /** 
   * Set property to set the icon's icon value.
   * @param {string} value - The icon's icon value.
   */
  set icon(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.iconTypeError);
    this.setAttribute({ key: 'icon', value: value });
    this.#icon = value;
  }
  
  /** 
   * Get property to return the icon's size value.
   * @return {string} The icon's size value.
   */
  get size() 
  { 
    return this.#size; 
  }
  
  /** 
   * Set property to set the icon's size value.
   * @param {string} value - The icon's size value.
   */
  set size(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.sizeTypeError);
    this.setAttribute({ key: 'size', value: value });
    this.#size = value;
  }
  
  /** 
   * Get property to return the icon's spin value.
   * @return {boolean} The icon's spin value.
   */
  get spin() 
  { 
    return this.#spin; 
  }
  
  /** 
   * Set property to set the icon's spin value.
   * @param {boolean} value - The icon's spin value.
   */
  set spin(value)
  {
    if(!typeChecker.check({ type: 'boolean', value: value })) console.error(this.#errors.spinTypeError);
    if(value == true) this.setAttribute({ key: 'spin', value: '' });
    else this.removeAttribute({ key: 'spin' });
    this.#spin = value;
  }
  
  /** 
   * Get property to return the icon's color value.
   * @return {string} The icon's color value.
   */
  get color() 
  { 
    return this.element.style.color; 
  }
  
  /** 
   * Set property to set the icon's color value.
   * @param {string} value - The icon's color value. Will throw an error if the color value is not valid.
   */
  set color(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.colorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.colorInvalidError);
    this.element.style.color = value;
  }
}

/////////////////////////////////////////////////

/** Class representing the image component. */
class ImageV2 extends Component
{
  #errors;

  /**
   * Creates the image object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {})
  {
    super({ tagName: 'img', options: options});

    this.#errors = 
    {
      altTypeError: 'Image Error: Expected type string for alt.',
      sourceTypeError: 'Image Error: Expected type string for source.'
    }
    
    if(options.alt) this.alt = options.alt;
    if(options.source) this.source = options.source;
  }
  
  /** 
   * Get property to return the image's alt value.
   * @return {string} The image's alt value.
   */
  get alt() 
  { 
    return this.getAttribute({ key: 'alt' }); 
  }
  
  /** 
   * Set property to set the image's alt value.
   * @param {string} value - The image's alt value.
   */
  set alt(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.altTypeError);
    this.setAttribute({ key: 'alt', value: value });
  }

  /** 
   * Get property to return the image's source value.
   * @return {string} The image's source value.
   */
  get source() 
  { 
    return this.getAttribute({ key: 'src' }); 
  }

  /** 
   * Set property to set the image's source value.
   * @param {string} value - The image's source value.
   */
  set source(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.sourceTypeError);
    this.setAttribute({ key: 'src', value: value });
  }  
}

/////////////////////////////////////////////////

/** Class representing the list component. */
class List extends Component 
{
  #errors;
  #inset;

  /**
   * Creates the list object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'ons-list', options: options });

    this.#errors = 
    {
      indexOutOfBoundsError: 'List Error: Index provided was out of bounds of the list.',
      indexTypeError: 'List Error: Expected type number for index.',
      insetTypeError: 'List Error: Expected type boolean for inset.',
      itemTypeError: 'List Error: Expected one of the following types for an item in the list: ListItem, ListTitle or ListHeader.',
      itemsTypeError: 'List Error: Expected type array for items.'
    }

    if(options.items) this.items = options.items;
    this.inset = options.inset || false;
  }

  /** 
   * Get property to return if the list is currently being rendered as an inset list.
   * @return {boolean} The list's current inset list value.
   */
  get inset() 
  { 
    return this.#inset; 
  }

  /** 
   * Set property to change the way the list is being rendered as inset.
   * @param {boolean} value - The list's inset list value.
   */
  set inset(value)
  {
    if(!typeChecker.check({ type: 'boolean', value: value })) console.error(this.#errors.insetTypeError);
    if(value == true) this.addModifier({ modifier: 'inset' });
    else this.removeModifier({ modifier: 'inset' });
    this.#inset = value;
  }

  /** 
   * Get property to return the list's current items.
   * @return {array} The list's current items.
   */
  get items() 
  { 
    return this.element.children; 
  }

  /** 
   * Set property to change the current list of items in the list.
   * @param {array} value - List of items to be added to the list. Clears the current list of items before adding the new items.
   */
  set items(value)
  {
    this.removeAllItems();
    this.addItems({ items: value });
  }

  /** 
   * Public method to add a single item to the list.
   * @param {Component} item - Item to be added to the list. Must be of type ListItem, ListTitle or ListHeader.
   */
  addItem({ item } = {}) 
  { 
    if(!typeChecker.checkMultiple({ types: [ 'list-item', 'list-title', 'list-header' ], value: item })) console.error(this.#errors.itemTypeError);
    this.appendChild({ child: item });
  }

  /** 
   * Public method to add multiple items to the list at a time.
   * @param {array} items - Array of items to be added to the list. Items must be of type ListItem, ListTitle or ListHeader.
   */
  addItems({ items } = {}) 
  {
    if(!typeChecker.check({ type: 'array', value: items })) console.error(this.#errors.itemsTypeError);
    items.forEach(item => { this.addItem({ item: item }) });
  }

  /** 
   * Public method to remove an item from the list from a specific index.
   * @param {number} index - Desired index of the item to be removed in the list. List index starts at 0.
   */
  removeItem({ index } = {}) 
  {
    if(!typeChecker.check({ type: 'number', value: value })) console.error(this.#errors.indexTypeError);
    if(index < 0 || index >= this.element.children.length) console.error(this.#errors.indexOutOfBoundsError);
    this.element.children[index].remove();
  }

  /** Public method to remove all items from the list. */
  removeAllItems()
  {
    this.element.innerHTML = '';
  }

  /** Public method to remove the last or bottom item in the list. */
  removeBottomItem() 
  { 
    if(this.element.children.length > 0) this.element.children[this.element.children.length - 1].remove(); 
  }

  /** Public method to remove the first or top item in the list. */
  removeTopItem()
  { 
    if(this.element.children.length > 0) this.element.children[0].remove(); 
  }
}

/////////////////////////////////////////////////

/** Class representing the list header component. */
class ListHeader extends Component 
{
  #errors;

  /**
   * Creates the list header object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'ons-list-header', options: options });

    this.#errors = { textTypeError: 'List Header Error: Expected type string for text.' };
    if(options.text) this.text = options.text;
  }

  /** 
   * Get property to return the list header's text value.
   * @return {string} The list header's text value.
   */
  get text() 
  { 
    return this.element.textContent; 
  }

  /** 
   * Set property to change the list header's text value.
   * @param {string} value - The list header's text value.
   */
  set text(value) 
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.textTypeError);
    this.element.textContent = value;
  }
}

/////////////////////////////////////////////////

/** Class representing the list item component. */
class ListItem extends Component 
{
  #center;
  #errors;
  #expandable;
  #left;
  #right;
  #tappable;

  /**
   * Creates the list item object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'ons-list-item', options: options });

    this.#errors = 
    {
      componentTypeError: 'List Item Error: Expected type string or component for left, center, right, or expandable.',
      tappableTypeError: 'List Item Error: Expected type boolean for tappable.'
    }
    
    if(options.center) this.center = options.center;
    if(options.expandable) this.expandable = options.expandable;
    if(options.left) this.left = options.left;
    if(options.right) this.right = options.right;
    this.tappable = options.tappable || false;
  }
  
  /** Private method to set the appropriate content in the correct portion of the list item. */
  #setContent(position, content) 
  {
    let div = this.element.querySelector(`.${position}`);

    if(!div) 
    {
      div = document.createElement('div');
      div.className = position;
      this.appendChild({ child: div });
    }

    if(typeChecker.check({ type: 'component', value: content })) div.appendChild(content.element);
    else if(typeChecker.check({ type: 'string', value: content })) div.textContent = content;
    else console.error(this.#errors.componentTypeError);
  }

  /** 
   * Get property to return content from the center of the list item.
   * @return {multiple} The content from the center of the list item. Can return either a component or string.
   */
  get center() 
  { 
    return this.#center; 
  }
  
  /** 
   * Set property to set the content for the center portion of the list item.
   * @param {multiple} value - The content for the center portion of the list item. Can accept either a component or string.
   */
  set center(value) 
  { 
    this.#setContent('center', value); 
    this.#center = value;
  }

  /** 
   * Get property to return content from the expandable portion of the list item.
   * @return {multiple} The content from the expandable portion of the list item. Can return either a component or string.
   */
  get expandable() 
  { 
    return this.#expandable; 
  }
  
  /** 
   * Set property to set the content for the expandable portion of the list item.
   * @param {multiple} value - The content for the expandable portion of the list item. Can accept either a component or string.
   */
  set expandable(value) 
  { 
    this.setAttribute({ key: 'expandable', value: ''});
    this.#setContent('expandable-content', value); 
    this.#expandable = value;
  }

  /** 
   * Get property to return content from the left portion of the list item.
   * @return {multiple} The content from the left portion of the list item. Can return either a component or string.
   */
  get left() 
  { 
    return this.#left; 
  }
  
  /** 
   * Set property to set the content for the left portion of the list item.
   * @param {multiple} value - The content for the left portion of the list item. Can accept either a component or string.
   */
  set left(value) 
  { 
    this.#setContent('left', value);
    this.#left = value; 
  }

  /** 
   * Get property to return content from the right portion of the list item.
   * @return {multiple} The content from the right portion of the list item. Can return either a component or string.
   */
  get right() 
  { 
    return this.#right; 
  }
  
   /** 
   * Set property to set the content for the right portion of the list item.
   * @param {multiple} value - The content for the right portion of the list item. Can accept either a component or string.
   */
  set right(value) 
  { 
    this.#setContent('right', value); 
    this.#right = value;
  }

  /** 
   * Get property to return if the list item is tappable or not.
   * @return {boolean} Value that determines if the list item is tappable or not.
   */
  get tappable() 
  { 
    return this.#tappable; 
  }

  /** 
   * Set property to make the list item tappable or not.
   * @param {multiple} value - The value determining if the list item tappable or not.
   */
  set tappable(value) 
  {
    if(!typeChecker.check({ type: 'boolean', value: value })) throw '';
    if(value == true) this.addModifier({ modifier: 'tappable' });
    else this.removeModifier({ modifier: 'tappable' });
    this.#tappable = value;
  }
}

/////////////////////////////////////////////////

/** Class representing the list title component. */
class ListTitle extends Component 
{
  #errors;

  /**
   * Creates the list title object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'ons-list-title', options: options });

    this.#errors = { textTypeError: 'List Title Error: Expected type string for text.' };
    if(options.text) this.text = options.text;
  }

  /** 
   * Get property to return the list title's text value.
   * @return {string} The list title's text value.
   */
  get text() 
  { 
    return this.element.textContent; 
  }

  /** 
   * Set property to change the list title's text value.
   * @param {string} value - The list title's text value.
   */
  set text(value) 
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.textTypeError);
    this.element.textContent = value;
  }
}

/////////////////////////////////////////////////

/** Class representing the modal component. */
class Modal extends Component
{
  #errors;
  #root;
  
  /**
   * Creates the modal object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {})
  {
    super({ tagName: 'ons-modal' , options: options });

    this.#errors = 
    {
      componentTypeError: 'Modal Error: Expected type component in components array.',
      componentsTypeError: 'Modal Error: Expected type array for components in addComponents call.',
      dismissAnimationTypeError: 'Modal Error: Expected type boolean for animated when dismissing the modal.',
      presentAnimationTypeError: 'modal Error: Expected type boolean for animated when presenting the modal.',
      rootComponentPreventsOtherComponentsError: 'Modal Error: Modal already contains an instance of root and cannot add any other components.',
      rootComponentTypeError: 'Modal Error: Expected type Page when adding page to modal.'
    }
  }
  
  /**
   * Public method to add one or multiple components to a modal.
   * @param {array} components - Array of components to be added to the modal.
   */
  addComponents({ components } = {})
  {
    if(this.#root) console.error(this.#errors.rootComponentPreventsOtherComponentsError);
    if(!typeChecker.check({ type: 'array', value: components })) console.error(this.#errors.componentsTypeError);
   
    components.forEach(component =>
    {
      if(!typeChecker.check({ type: 'component', value: component })) console.error(this.#errors.componentTypeError);
      this.appendChild({ child: component });
    });
  }
  
  /**
   * Public method to dismiss a modal, that has previously been shown.
   * @param {boolean} animated - Boolean value to determine if the modal should be hidden with animation or not.
   */
  dismiss({ animated = true } = {})
  {
    if(!typeChecker.check({ type: 'boolean', value: animated })) console.error(this.#errors.dismissAnimationTypeError);
    if(animated) this.setAttribute({ key: 'animation', value: 'lift' });
    else this.setAttribute({ key: 'animation', value: 'none' });    
    this.element.hide();
  }
  
  /**
   * Public method to present a modal.
   * @param {boolean} animated - Boolean value to determine if the modal should be shown with animation or not.
   */
  present({ animated = true, root = null } = {})
  {
    if(!this.#root)
    {
      if(root)
      {
        if(!typeChecker.check({ type: 'page', value: root })) console.error(this.#errors.rootComponentTypeError); // Need to add Navigator support here.
        this.#root = root;
        this.appendChild({ child: root });
      }
    }

    if(!typeChecker.check({ type: 'boolean', value: animated })) console.error(this.#errors.presentAnimationTypeError);
    if(animated) this.setAttribute({ key: 'animation', value: 'lift' });
    else this.setAttribute({ key: 'animation', value: 'none' });

    document.body.appendChild(this.element);
    this.element.show();
  }
}

/////////////////////////////////////////////////

/** Class representing the navigator component. */
class Navigator 
{
  #errors;
  #container;
  #stack;

  /**
   * Creates the navigator object.
   * @param {Page} root - First page to be shown in the navigation stack.
   */
  constructor({ root, id } = {}) 
  {
    this.#errors = 
    {
      idTypeError: 'Navigator Error: Expected type string for id.',
      indexTypeError: 'Navigator Error: Expected type number for index when switching to another page.',
      lastPagePopError: 'Navigator Error: Cannot pop the last page of the stack.',
      noRootComponentError: 'Navigator Error: A root page is required when creating a navigator.',
      pageTypeError: 'Navigator Error: Expected type Page for page when calling push.',
      pushAnimationTypeError: 'Navigator Error: Expected type boolean for animated when pushing a new page.',
      popAnimationTypeError: 'Navigator Error: Expected type boolean for animated when popping the top page.',
      stackOutOfBoundsError: 'Navigator Error: Stack index out of bounds.',
      switchToAnimationTypeError: 'Navigator Error: Expected type boolean for animation when switching to another page.'
    }
  
    this.#container = document.createElement('div');
    this.#stack = [];
    
    if(root) this.push({ page: root, animated: false });
    else console.error(this.#errors.noRootComponentError);
    if(id) this.id = id;
  }
  
  /** 
   * Get property to return the navigator container.
   * @return {object} The navigator container. Not meant to be used publically by users.
   */
  get element() 
  { 
    return this.#container; 
  }

  /** 
   * Get property to return the navigator's id.
   * @return {string} The navigator's id.
   */
  get id()
  {
    return this.#container.id;
  }

  /** 
   * Set property to set the navigator's id.
   * @param {string} value - The navigator's id.
   */
  set id(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.idTypeError);
    this.#container.id = value;
    app.registerComponent({ component: this });
  }

  /**
   * Public method to push a new page onto the navigation stack.
   * @param {Page} page - Page to be pushed onto the navigation stack.
   * @param {boolean} animated - Boolean value to determine if the page should be pushed with animation or not.
   */
  push({ page, animated = true } = {}) 
  {
    if(!typeChecker.check({ type: 'page', value: page })) console.error(this.#errors.pageTypeError);
    if(!typeChecker.check({ type: 'boolean', value: animated })) console.error(this.#errors.pushAnimationTypeError);
    
    if(this.#stack.length === 0) 
    {
      this.#stack.push(page);
      this.#container.appendChild(page.element);
      return;
    }

    const currentPage = this.#stack[this.#stack.length - 1];
    setTimeout(() => { currentPage.element.style.display = 'none'; }, 300);

    this.#stack.push(page);
    this.#container.appendChild(page.element);

    if(animated) 
    {
      page.element.style.transform = 'translateX(100%)';
      page.element.style.transition = 'transform 0.3s ease-in-out';
      setTimeout(() => { page.element.style.transform = 'translateX(0)'; }, 0);
    }
  }

  /**
   * Public method to pop the top page off the navigation stack.
   * @param {boolean} animated - Boolean value to determine if the page should be popped with animation or not.
   */
  pop({ animated = true } = {}) 
  {
    if(this.#stack.length <= 1) console.error(this.#errors.lastPagePopError);
    if(!typeChecker.check({ type: 'boolean', value: animated })) console.error(this.#errors.popAnimationTypeError);

    const currentPage = this.#stack.pop();
    const previousPage = this.#stack[this.#stack.length - 1];

    currentPage.onHide?.();
    previousPage.onShow?.();

    if(animated) 
    {
      currentPage.element.style.transform = 'translateX(100%)';
      currentPage.element.style.transition = 'transform 0.42s ease-in-out';

      previousPage.element.style.display = '';
      previousPage.element.style.transform = 'translateX(-100%)';
      previousPage.element.style.transition = 'transform 0.3s ease-in-out';

      setTimeout(() => { previousPage.element.style.transform = 'translateX(0)'; }, 0);
      setTimeout(() => { currentPage.onDestroy?.(); this.#container.removeChild(currentPage.element); }, 350);
    } 
    else 
    {
      currentPage.onDestroy?.();
      this.#container.removeChild(currentPage.element);
      previousPage.element.style.display = '';
    }
  }

  /**
   * Public method to switch to a previous page that is already on the stack.
   * @param {number} index - Index of the corresponding page to switch to.
   * @param {boolean} animated - Boolean value to determine if the page should be switched with animation or not.
   */
  switchTo({ index, animated = true } = {}) 
  {
    if(!typeChecker.check({ type: 'number', value: index })) console.error(this.#errors.indexTypeError);
    if(!typeChecker.check({ type: 'boolean', value: animated })) console.error(this.#errors.switchToAnimationTypeError);

    if(index < 0 || index >= this.#stack.length) console.error(this.#errors.stackOutOfBoundsError);
    
    const currentPage = this.#stack[this.#stack.length - 1];
    const targetPage = this.#stack[index];

    if(currentPage === targetPage) return;

    currentPage.onHide?.();

    if(animated) 
    {
      currentPage.element.style.transform = 'translateX(100%)';
      currentPage.element.style.transition = 'transform 0.42s ease-in-out';

      targetPage.element.style.display = '';
      targetPage.element.style.transform = 'translateX(-100%)';
      targetPage.element.style.transition = 'transform 0.3s ease-in-out';

      setTimeout(() => { targetPage.element.style.transform = 'translateX(0)'; }, 0);
    } 
    else 
    {
      currentPage.element.style.display = 'none';
      targetPage.element.style.display = '';
    }
  }
}

/////////////////////////////////////////////////

/** Class representing the page component. */
class Page extends Component
{
  #errors;
  #toolbar;
  #contentContainer;
  #lastOrientation;
  #leftToolbarContainer;
  #navigationBar;
  #navigationBarButtonsLeft;
  #navigationBarButtonsRight;
  #onOrientationChange;
  #rightToolbarContainer;
  #toolbarButtonsLeft;
  #toolbarButtonsRight;
  
  /**
   * Creates the page object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'ons-page', options: options });

    this.#errors = 
    {
      backgroundColorInvalidError: 'Page Error: Invalid color provided for backgroundColor.',
      backgroundColorTypeError: 'Page Error: Expected type string for backgroundColor.',
      componentTypeError: 'Page Error: Expected type component.',
      componentsTypeError: 'Page Error: Expected type array for components in addComponents call.',
      imageTypeError: 'Page Error: Expected type Image.',
      navigationBarButtonLeftTypeError: 'Page Error: Expected type BarButton or BackBarButton when setting left navigation bar button.',
      navigationBarButtonRightTypeError: 'Page Error: Expected type BarButton when setting right navigation bar button.',
      navigationBarButtonsTypeError: 'Page Error: Expected type array for buttons when setting navigation bar buttons.',
      navigationBarColorInvalidError: 'Page Error: Invalid color provided for navigationBarColor',
      navigationBarColorTypeError: 'Page Error: Expected type string for navigationBarColor',
      navigationTitleTypeError: 'Page Error: Expected type string for navigationBarTitle.',
      navigationBarTitleColorInvalidError: 'Page Error: Invalid color provided for navigationBarTitleColor',
      navigationBarTitleColorTypeError: 'Page Error: Expected type string for navigationBarTitleColor.',
      onOrientationChangeTypeError: 'Page Error: Expected type function for onOrientationChange.',
      searchbarTypeError: 'Page Error: Expected type Searchbar.',
      toolbarButtonTypeError: 'Page Error: Expected type BarButton when setting toolbar button.',
      toolbarButtonsTypeError: 'Page Error: Expected type array for buttons when setting toolbar buttons.'
    }

    this.#lastOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    this.#addContentContainer();
    this.#addBackgroundContainer();
    this.#observeLifecycle();
  }

  /** Private method to add the background container to the page. */
  #addBackgroundContainer() 
  {
    if(!this.element.querySelector('.background')) 
    {
      const background = document.createElement('div');
      background.className = 'background';
      this.element.insertBefore(background, this.element.firstChild);
    }
  }
  
  /** Private method to add the content container to the page. */
  #addContentContainer() 
  {
    if(!this.element.querySelector('.page__content')) 
    {
      const content = document.createElement('div');
      content.className = 'page__content';
      content.style.overflowY = 'auto';
      content.style.height = '100%';
      content.style.webkitOverflowScrolling = 'touch';
      this.element.appendChild(content);
      this.#contentContainer = content;
    }
  }
  
  /** Private method to add the navigation bar to the page. */
  #addNavigationBar()
  {
    if(!this.#navigationBar)
    {
      this.#navigationBar = document.createElement('ons-toolbar');
      this.element.insertBefore(this.#navigationBar, this.element.firstChild);
    }
  }
  
  /** Private method to add the toolbar to the page. */
  #addToolbar()
  {
    if(!this.#toolbar) 
    {
      this.#toolbar = document.createElement('ons-bottom-toolbar');
      this.#toolbar.style.display = 'flex';
      this.#toolbar.style.justifyContent = 'space-between';
      this.#toolbar.style.alignItems = 'center';
      this.#toolbar.style.padding = '4px';

      this.#leftToolbarContainer = document.createElement('div');
      this.#rightToolbarContainer = document.createElement('div');

      this.#leftToolbarContainer.style.display = 'flex';
      this.#rightToolbarContainer.style.display = 'flex';

      this.#toolbar.appendChild(this.#leftToolbarContainer);
      this.#toolbar.appendChild(this.#rightToolbarContainer);

      this.appendChild({ child: this.#toolbar });
    }
  }
  
  /** Private method to help with observng the basic Page lifecycle events. */
  #observeLifecycle() 
  {
    this.addEventListener({ event: 'init', handler: () => this.onInit() });
    this.addEventListener({ event: 'show', handler: () => this.onShow() });

    new MutationObserver(() => 
    {
      if(this.element.style.display === 'none' || this.element.hidden) 
      {
        this.onHide();
      }
    }).observe(this.element, { attributes: true, attributeFilter: ['style', 'hidden'] });

    const observer = new MutationObserver((mutations) => 
    {
      mutations.forEach((mutation) => 
      {
        mutation.removedNodes.forEach((node) => 
        {
          if(node === this.element) 
          {
            this.onDestroy();
            observer.disconnect();
          }
        });
      });
    });

    observer.observe(document.body, { childList: true });
  }

  /** 
   * Get property to return the page's background color.
   * @return {string} The page's background color.
   */
  get backgroundColor()
  {
    const background = this.element.querySelector('.background');
    if(background) return background.style.backgroundColor;
  }
  
  /** 
   * Set property to change the page's background color.
   * @param {string} value - The page's background color.
   */
  set backgroundColor(value)
  { 
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.backgroundColorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.backgroundColorInvalidError);
    const background = this.element.querySelector('.background');
    if(background) background.style.backgroundColor = value;
  }

  /** 
   * Get property to return the navigation bar's color.
   * @return {string} The navigation bar's color.
   */
  get navigationBarColor()
  {
    return this.#navigationBar.style.backgroundColor;
  }

  /** 
   * Set property to change the the navigation bar's color.
   * @param {string} value - The navigation bar's color.
   */
  set navigationBarColor(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.navigationBarColorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.navigationBarColorInvalidError);
    if(this.#navigationBar) this.#navigationBar.style.backgroundColor = value;
  }
  
  /** 
   * Get property to return the page's navigation bar title.
   * @return {string} The page's navigation bar title.
   */
  get navigationBarTitle()
  {
    let centerDiv = this.#navigationBar.querySelector('.center');
    return centerDiv.textContent;
  }
  
  /** 
   * Set property to change the page's navigation bar title.
   * @param {string} value - The page's navigation bar title. 
   */
  set navigationBarTitle(value)
  { 
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.navigationTitleTypeError);
    if(!this.#navigationBar) this.#addNavigationBar();

    let centerDiv = this.#navigationBar.querySelector('.center');
    if(!centerDiv) 
    {
      centerDiv = document.createElement('div');
      centerDiv.className = 'center';
      this.#navigationBar.appendChild(centerDiv);
    }

    centerDiv.textContent = value;
  }

  /** 
   * Get property to return the page's navigation bar title color.
   * @return {string} The page's navigation bar title color.
   */
  get navigationBarTitleColor()
  {
    let centerDiv = this.#navigationBar.querySelector('.center');
    return centerDiv.style.color;
  }

  /** 
   * Set property to change the page's navigation bar title color.
   * @param {string} value - The page's navigation bar title color. 
   */
  set navigationBarTitleColor(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.navigationBarTitleColorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.navigationBarColorInvalidError);
    if(this.#navigationBar)
    {
      let centerDiv = this.#navigationBar.querySelector('.center');
      centerDiv.style.color = value;
    }
  }
  
  /** 
   * Get property to return the page's buttons on the left side of the navigation bar.
   * @return {array} The page's buttons of the left side of the navigation bar.
   */
  get navigationBarButtonsLeft()
  {
    return this.#navigationBarButtonsLeft;
  }
  
  /** 
   * Set property to change the page's buttons on the left side of the navigation bar.
   * @param {array} buttons - The page's buttons on the left side of the navigation bar. 
   */
  set navigationBarButtonsLeft(value)
  {
    if(!typeChecker.check({ type: 'array', value: value })) console.error(this.#errors.navigationBarButtonsTypeError);
    if(!this.#navigationBar) this.#addNavigationBar();
    
    let leftDiv = this.#navigationBar.querySelector('.left');
    if(!leftDiv) 
    {
      leftDiv = document.createElement('div');
      leftDiv.className = 'left';
      this.#navigationBar.insertBefore(leftDiv, this.#navigationBar.firstChild);
    }

    leftDiv.innerHTML = '';
    
    value.forEach(button => 
    {
      if(typeChecker.checkMultiple({ types: [ 'bar-button', 'back-bar-button' ], value: button })) leftDiv.appendChild(button.element);
      else console.error(this.#errors.navigationBarButtonLeftTypeError);
    });
    this.#navigationBarButtonsLeft = value;
  }
  
  /** 
   * Get property to return the page's buttons on the right side of the navigation bar.
   * @return {array} The page's buttons of the right side of the navigation bar.
   */
  get navigationBarButtonsRight()
  {
    return this.#navigationBarButtonsRight;
  }
  
  /** 
   * Set property to change the page's buttons on the right side of the navigation bar.
   * @param {array} buttons - The page's buttons on the right side of the navigation bar. 
   */
  set navigationBarButtonsRight(value)
  {
    if(!typeChecker.check({ type: 'array', value: value })) console.error(this.#errors.navigationBarButtonsTypeError);
    if(!this.#navigationBar) this.#addNavigationBar();
    
    let rightDiv = this.#navigationBar.querySelector('.right');
    if(!rightDiv) 
    {
      rightDiv = document.createElement('div');
      rightDiv.className = 'right';
      this.#navigationBar.insertBefore(rightDiv, this.#navigationBar.firstChild);
    }

    rightDiv.innerHTML = '';
    
    value.forEach(button => 
    {
      if(typeChecker.check({ type: 'bar-button', value: button })) rightDiv.appendChild(button.element);
      else console.error(this.#errors.navigationBarButtonRightTypeError);
    });
    this.#navigationBarButtonsRight = value;
  }

  /** 
   * Get property to return the component's function declaration for orientation change events.
   * @return {function} The component's function declaration for orientation change events.
   */
  get onOrientationChange() 
  {
    return this.#onOrientationChange;
  }

  /** 
   * Set property to change the component's function declaration for orientation change events.
   * @param {function} value - The component's function declaration for orientation change events.
   */
  set onOrientationChange(value) 
  {
    if(!typeChecker.check({ type: 'function', value: value })) 
    {
      console.error(this.#errors.onOrientationChangeTypeError);
      return;
    }

    if(this.#onOrientationChange) 
    {
      window.removeEventListener('resize', this.#onOrientationChange);
    }

    this.#lastOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    this.#onOrientationChange = () => 
    {
      const currentOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

      if(this.#lastOrientation !== currentOrientation) 
      {
        this.#lastOrientation = currentOrientation;
        value(currentOrientation);
      }
    };

    window.addEventListener('resize', this.#onOrientationChange);
  }
  
  /** 
   * Get property to return the page's buttons on the left side of the toolbar.
   * @return {array} The page's buttons of the left side of the toolbar.
   */
  get toolbarButtonsLeft()
  {
    return this.#toolbarButtonsLeft;
  }
  
  /** 
   * Set property to change the page's buttons on the left side of the toolbar.
   * @param {array} buttons - The page's buttons on the left side of the toolbar. 
   */
  set toolbarButtonsLeft(value)
  {
    if(!typeChecker.check({ type: 'array', value: value })) console.error(this.#errors.toolbarButtonsTypeError);
    if(!this.#toolbar) this.#addToolbar();
   
    this.#leftToolbarContainer.innerHTML = '';
    
    value.forEach(button => 
    {
      if(typeChecker.check({ type: 'bar-button', value: button })) this.#leftToolbarContainer.appendChild(button.element);
      else console.error(this.#errors.toolbarButtonTypeError);
    });
    this.#leftToolbarContainer.style.justifyContent = 'flex-start';
    this.#toolbarButtonsLeft = value;
  }
  
  /** 
   * Get property to return the page's buttons on the right side of the toolbar, if previously set before.
   * @return {array} The page's buttons of the right side of the toolbar.
   */
  get toolbarButtonsRight()
  {
    return this.#toolbarButtonsRight;
  }
  
  /** 
   * Set property to change the page's buttons on the right side of the toolbar.
   * @param {array} buttons - The page's buttons on the right side of the toolbar. 
   */
  set toolbarButtonsRight(value)
  {
    if(!typeChecker.check({ type: 'array', value: value })) console.error(this.#errors.toolbarButtonsTypeError);
    if(!this.#toolbar) this.#addToolbar();
    
    this.#rightToolbarContainer.innerHTML = '';
    
    value.forEach(button => 
    {
      if(typeChecker.check({ type: 'bar-button', value: button }))  this.#rightToolbarContainer.appendChild(button.element);
      else console.error(this.#errors.toolbarButtonTypeError);
    });
    this.#rightToolbarContainer.style.justifyContent = 'flex-start';
    this.#toolbarButtonsRight = value;
  }
  
  /**
   * Public method to add one or multiple components to a page.
   * @param {array} components - Array of components to be added to the page.
   */
  addComponents({ components } = {}) 
  { 
    if(!typeChecker.check({ type: 'array', value: components })) console.error(this.#errors.componentsTypeError);
    components.forEach(component => 
    {
      if(typeChecker.check({ type: 'component', value: component })) this.#contentContainer.appendChild(component.element);
      else console.error(this.#errors.componentTypeError);  
    });
  }
  
  /**
   * Public method to add one component to the center of the page.
   * @param {Component} component - Component to be added to the center of the page.
   */
  addComponentToCenter({ component } = {}) 
  {
    if(typeChecker.check({ type: 'component', value: component }))
    {
      let centerContainer = this.element.querySelector('.center-content-container');
    
      if(!centerContainer) 
      {
        centerContainer = document.createElement('div');
        centerContainer.className = 'center-content-container';
        centerContainer.style.position = 'absolute';
        centerContainer.style.left = '50%';
        centerContainer.style.transform = 'translate(-50%, -50%)';
        centerContainer.style.display = 'flex';
        centerContainer.style.justifyContent = 'center';
        centerContainer.style.alignItems = 'center';
        centerContainer.style.width = '100%';
        centerContainer.style.height = 'auto';
        
        this.#contentContainer.appendChild(centerContainer);
      }
    
      let toolbar = this.element.querySelector('ons-toolbar');
      let toolbarHeight = toolbar ? 44 : 0;
    
      centerContainer.style.top = `calc(42% + ${toolbarHeight/2}px)`;
    
      centerContainer.innerHTML = '';
      centerContainer.appendChild(component.element);
    }
    else console.error(this.#errors.componentTypeError);
  }
  
  /**
   * Public method to add an image to the center of the navigation bar of the page.
   * @param {Image} image - Image to be added to the navigation bar of the page.
   */
  addImageToNavigationBar({ image } = {})
  {
    if(!typeChecker.check({ type: 'image', value: image })) console.error(this.#errors.imageTypeError);
    if(!this.#navigationBar) this.#addNavigationBar();
    
    let centerDiv = this.#navigationBar.querySelector('.center');
    if(!centerDiv) 
    {
      centerDiv = document.createElement('div');
      centerDiv.className = 'center';
      image.style.maxWidth = '100%';
      image.style.padding = '4px';
      image.style.maxHeight = '80%';
      image.style.objectFit = 'contain';
      image.style.display = 'block';
      image.style.margin = 'auto';
      centerDiv.appendChild(image.element);
      this.#navigationBar.appendChild(centerDiv);
    }
  }
  
  /**
   * Public method to add a searchbar to the center of the navigation bar of the page.
   * @param {Searchbar} searchbar - Searchbar to be added to the navigation bar of the page.
   */
  addSearchToNavigationBar({ searchbar } = {})
  {
    if(!typeChecker.check({ type: 'searchbar', value: searchbar })) console.error(this.#errors.searchbarTypeError);
    if(!this.#navigationBar) this.#addNavigationBar();
  
    let centerDiv = this.#navigationBar.querySelector('.center');
    if(!centerDiv) 
    {
      centerDiv = document.createElement('div');
      centerDiv.className = 'center';
      searchbar.style.padding = '7px';
      searchbar.style.maxWidth = '50%';
      searchbar.style.objectFit = 'contain';
      searchbar.style.display = 'block';
      searchbar.style.margin = 'auto';
      centerDiv.appendChild(searchbar.element);
      this.#navigationBar.appendChild(centerDiv);
    }
  }
  
  /** Public method to hide the navigation bar as needed. */
  hideNavigationBar() 
  { 
    if(this.#navigationBar) this.#navigationBar.hide();
  }
  
  /** Public method to hide the toolbar as needed. */
  hideToolbar()
  {
    if(this.#toolbar) this.#toolbar.style.display = 'none';
  }

  // Init lifecycle hooks meant to be overriden by an extended class.
  onInit() { }

  onShow() { }

  onHide() { }
 
  onDestroy() { }
  
  /** Public method to show the navigation bar as needed. */
  showNavigationBar() 
  { 
    if(this.#navigationBar)  this.#navigationBar.show();
  }
  
  /** Public method to show the toolbar as needed. */
  showToolbar()
  {
    if(this.#toolbar) this.#toolbar.style.display = 'flex';
  }
}

/////////////////////////////////////////////////

/** Class representing the popover component. */
class Popover extends Component 
{
  #errors;
  #cancelable;
  #contentElement;
  #direction;
  #target;

  /**
   * Creates the popover object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'ons-popover', options });

    this.#errors = 
    {
      cancelableTypeError: 'Popover Error: Expected type boolean for cancelable.',
      componentTypeError: 'Popover Error: Expected type component.',
      componentsTypeError: 'Popover Error: Expected type array for components in addComponents call.',
      directionTypeError: 'Popover Error: Expected type string for direction.',
      directionInvalidError: 'Popover Error: Invalid value for direction. Valid values are: up, down, left or right.',
      dismissAnimationTypeError: 'Popover Error: Expected type boolean for animated when dismissing the popover.',
      presentAnimationTypeError: 'Popover Error: Expected type boolean for animated when presenting the popover.',
      targetNotSetError: 'Popover Error: Could not present popover, target was not set.',
      targetTypeError: 'Popover Error: Expected type Component for target.'
    }
    
    this.#contentElement = document.createElement('div');
    this.#contentElement.classList.add('popover-content');
    this.element.appendChild(this.#contentElement);

    this.cancelable = options.cancelable || true;
    this.direction = options.direction || 'down';
  }

  /** 
   * Get property to return if the popover is cancelable or not.
   * @return {boolean} The popover's cancelable value.
   */
  get cancelable()
  {
    return this.#cancelable;
  }

  /** 
   * Set property to set the popover's cancelable value.
   * @param {boolean} value - The popover's cancelable value.
   */
  set cancelable(value)
  {
    if(!typeChecker.check({ type: 'boolean', value: value })) console.error(this.#errors.cancelableTypeError);
    if(value == true) this.setAttribute({ key: 'cancelable', value: '' });
    else this.removeAttribute({ key: 'cancelable' });
    this.#cancelable = value;
  }

  /** 
   * Get property to return the popover's direction value.
   * @return {string} The popover's direction value.
   */
  get direction()
  {
    return this.#direction;
  }

  /** 
   * Set property to set the popover's direction value.
   * @param {boolean} value - The popover's direction value.
   */
  set direction(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.directionTypeError);
    const validDirections = ['up', 'down', 'left', 'right'];
    if(!validDirections.includes(value)) console.error(this.#errors.directionInvalidError);
    this.setAttribute({ key: 'direction', value: value });
    this.#direction = value;
  }

  /**
   * Public method to add one or multiple components to a popover.
   * @param {array} components - Array of components to be added to the popover.
   */
  addComponents({ components } = {}) 
  {
    if(!typeChecker.check({ type: 'array', value: components })) console.error(this.#errors.componentsTypeError);
    components.forEach(component => 
    {
      if(typeChecker.check({ type: 'component', value: component })) this.#contentElement.appendChild(component.element);
      else console.error(this.#errors.componentTypeError);
    });
  }

  /**
   * Public method to dismiss a dialog, that has previously been shown.
   * @param {boolean} animated - Boolean value to determine if the dialog should be dismissed with animation or not.
   */
  dismiss({ animated = true } = {}) 
  {
    if(!typeChecker.check({ type: 'boolean', value: animated })) console.error(this.#errors.dismissAnimationTypeError);
    if(animated) this.setAttribute({ key: 'animation', value: 'default' });
    else this.setAttribute({ key: 'animation', value: 'none' });    
    this.element.hide();
  }

  /**
   * Public method to present a popover.
   * @param {boolean} animated - Boolean value to determine if the popover should be shown with animation or not.
   * @param {Component} target - Component to present the popover from.
   */
  present({ animated = true, target = null } = {}) 
  {
    if(!target) console.error(this.#errors.targetNotSetError);

    if(!typeChecker.check({ type: 'component', value: target })) console.error(this.#errors.targetTypeError);

    if(!typeChecker.check({ type: 'boolean', value: animated })) console.error(this.#errors.presentAnimationTypeError);
    if(animated) this.setAttribute({ key: 'animation', value: 'default' });
    else this.setAttribute({ key: 'animation', value: 'none' });

    document.body.appendChild(this.element);
    this.element.show(target.element);    
  }
}

/////////////////////////////////////////////////

/** Class representing the progress bar component. */
class ProgressBar extends Component
{
  #errors;
  #indeterminate;
  #progress;
  #color;
  #secondaryProgress;
  #secondaryColor;
  
  /**
   * Creates the progress bar object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {})
  {
    super({ tagName: 'ons-progress-bar', options: options });

    this.#errors = 
    {
      indeterminateTypeError: 'Progress Bar Error: Expected type boolean for indeterminate.',
      colorInvalidError: 'Progress Bar Error: Invalid color value provided for color.',
      colorTypeError: 'Progress Bar Error: Expected type string for color.',
      progressTypeError: 'Progress Bar Error: Expected type number for progress.',
      progressValueInvalidError: 'Progress Bar Error: Expected number between 0 and 100.',
      secondaryColorInvalidError: 'Progress Bar Error: Invalid color value provided for secondary progress color.',
      secondaryColorTypeError: 'Progress Bar Error: Expected type string for secondary progress color.',
      secondaryProgressTypeError: 'Progress Bar Error: Expected type number for secondary progress.'
    };

    this.indeterminate = options.indeterminate || false;
    this.progress = options.progress || 0;
    this.secondaryProgress = options.secondaryProgress || 0;
    this.color = options.color || '#1f8dd6';
    this.secondaryColor = options.secondaryColor || '#65adff';
  }

  /** 
   * Get property to return the color of the progress bar.
   * @return {string} The color of the progress bar.
   */
  get color() 
  { 
    return this.#color; 
  }
  
  /** 
   * Set property to set the color of the progress bar.
   * @param {string} value - The color of the progress bar.
   */
  set color(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.colorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.colorInvalidError);
    this.style.setProperty('--progress-bar-color', value);
    this.#color = value;
  }
  
  /** 
   * Get property to return the indeterminate status of the progress bar.
   * @return {boolean} The indeterminate status of the progress bar.
   */
  get indeterminate() 
  { 
    return this.#indeterminate; 
  }
  
  /** 
   * Set property to set the indeterminate status of the progress bar.
   * @param {boolean} value - The indeterminate status of the progress bar.
   */
  set indeterminate(value)
  {
    if(!typeChecker.check({ type: 'boolean', value: value })) console.error(this.#errors.indeterminateTypeError);
    if(value == true) this.setAttribute({ key: 'indeterminate', value: '' });
    else this.removeAttribute({ key: 'indeterminate' });
    this.#indeterminate = value;
  }

  /** 
   * Get property to return the progress value of the progress bar.
   * @return {number} The progress value of the progress bar.
   */
  get progress() 
  { 
    return this.#progress; 
  }

  /** 
   * Set property to set the progress value of the progress bar.
   * @param {number} value - The progress value of the progress bar.
   */
  set progress(value) 
  { 
    if(!typeChecker.check({ type: 'number', value: value })) console.error(this.#errors.progressTypeError);
    if(value >= 0 && value <= 100)
    {
      this.setAttribute({ key: 'value', value: String(value) }); 
      this.#progress = value;
    }
    else console.error(this.#errors.progressValueInvalidError);
  }

  /** 
   * Get property to return the secondary color of the progress bar.
   * @return {string} The secondary color of the progress bar.
   */
  get secondaryColor() 
  { 
    return this.#secondaryColor; 
  }
  
  /** 
   * Set property to set the secondary color of the progress bar.
   * @param {string} value - The secondary color of the progress bar.
   */
  set secondaryColor(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.secondaryColorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.secondaryColorInvalidError);
    this.style.setProperty('--progress-bar-secondary-color', value);
    this.#secondaryColor = value;
  }

  /** 
   * Get property to return the secondary progress value of the progress bar.
   * @return {number} The secondary progress value of the progress bar.
   */
  get secondaryProgress() 
  { 
    return this.#secondaryProgress; 
  }

  /** 
   * Set property to set the secondary progress value of the progress bar.
   * @param {number} value - The secondary progress value of the progress bar.
   */
  set secondaryProgress(value) 
  { 
    if(!typeChecker.check({ type: 'number', value: value })) console.error(this.#errors.secondaryProgressTypeError);
    if(value >= 0 && value <= 100)
    {
      this.setAttribute({ key: 'secondary-value', value: String(value) });
      this.#secondaryProgress = value;
    }
    else console.error(this.#errors.progressValueInvalidError);
  }
}

/////////////////////////////////////////////////

/** Class representing the Rectangle component. */
class Rectangle extends Component
{
  /**
   * Creates the rectangle object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'div', options });

    this.width = options.width || '100px';
    this.height = options.height || '100px';
    this.backgroundColor = options.backgroundColor || 'gray';
  }
}

/////////////////////////////////////////////////

/** Class representing a Row component. */
class Row extends Component 
{
  #errors;

  /**
   * Creates the row object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'ons-row', options });

    this.#errors = 
    {
      columnTypeError: 'Row Error: Expected type column for column when adding to the current row.',
    };
  }

  /**
   * Adds a column to the row.
   * @param {Column} column - An instance of Column.
   */
  addColumn({ column } = {}) 
  {
    if(!typeChecker.check({ type: 'column', value: column })) console.error(this.#errors.columnTypeError);
    this.appendChild({ child: column.element });
  }
}

/////////////////////////////////////////////////

/** Class representing the search bar component. */
class Searchbar extends Component 
{
  #errors;
  #maxLength;
  #onChange;
  #onTextChange;
  #placeholder;
  #textColor;

  /**
   * Creates the progress bar object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'ons-search-input', options: options });

    this.#errors = 
    {
      caretColorInvalidError: 'Searchbar Error: Invalid color value provided for caret color.',
      caretColorTypeError: 'Searchbar Error: Expected type string for caret color.',
      maxLengthTypeError: 'Searchbar Error: Expected type number for max length.',
      onChangeTypeError: 'Searchbar Error: Expected type function for onChange.',
      onTextChangeTypeError: 'Searchbar Error: Expected type function for onTextChange.',
      placeholderTypeError: 'Searchbar Error: Expected type string for placeholder.',
      textColorInvalidError: 'Searchbar Error: Invalid color value provided for text color.',
      textColorTypeError: 'Searchbar Error: Expected type string for text color.',
      textTypeError: 'Searchbar Error: Expected type string for text.'
    };
    
    if(options.caretColor) this.caretColor = options.caretColor;
    if(options.maxLength) this.maxLength = options.maxLength;
    if(options.onChange) this.onChange = options.onChange;
    if(options.onTextChange) this.onTextChange = options.onTextChange;
    if(options.text) this.text = options.text;
    this.placeholder = options.placeholder || "Search...";
    if(options.textColor) this.textColor = options.textColor;
  }
  
  /** 
   * Get property to return the caret color of the search bar.
   * @return {string} The caret color of the search bar.
   */
  get caretColor() 
  { 
    return this.style.caretColor; 
  }
  
  /** 
   * Set property to set the caret color of the search bar.
   * @param {string} value - The caret color of the search bar.
   */
  set caretColor(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.caretColorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.caretColorInvalidError);
    this.style.caretColor = value;
  }
  
  /** 
   * Get property to return the max length value of the search bar.
   * @return {number} The max length value of the search bar.
   */
  get maxLength() 
  { 
    return this.#maxLength; 
  }
  
  /** 
   * Set property to set the max length value of the search bar.
   * @param {number} value - The max length of the search bar.
   */
  set maxLength(value) 
  {
    if(!typeChecker.check({ type: 'number', value: value })) console.error(this.#errors.maxLengthTypeError);
    this.setAttribute({ key: 'maxlength', value: String(value) });
    this.#maxLength = value;
  }
  
  /** 
   * Get property to return the function being called during on change events.
   * @return {function} The function being called during on change events.
   */
  get onChange() 
  { 
    return this.#onChange; 
  }

  /** 
   * Set property to set the function being called during on change events.
   * @param {function} value - The function being called during on change events.
   */
  set onChange(value)
  {
    if(!typeChecker.check({ type: 'function', value: value })) console.error(this.#errors.onChangeTypeError);

    if(this.#onChange) this.removeEventListener({ event: 'change', handler: this.#onChange });
    const handler = (event) => value(event.target.value);

    this.#onChange = handler;
    this.addEventListener({ event: 'change' , handler });
  }

  /** 
   * Get property to return the function being called during on text change events.
   * @return {function} The function being called during on text change events.
   */
  get onTextChange() 
  { 
    return this.#onTextChange; 
  }

  /** 
   * Set property to set the function being called during on text change events.
   * @param {function} value - The function being called during on text change events.
   */
  set onTextChange(value)
  {
    if(!typeChecker.check({ type: 'function', value: value })) console.error(this.#errors.onTextChangeTypeError);

    if(this.#onTextChange) this.removeEventListener({ event: 'input', handler: this.#onTextChange });
    const handler = (event) => value(event.target.value);

    this.#onTextChange = handler;
    this.addEventListener({ event: 'input', handler: handler });
  }

  /** 
   * Get property to return the placeholder value for the search bar.
   * @return {string} The placeholder value for the search bar.
   */
  get placeholder() 
  { 
    return this.#placeholder; 
  }
  
  /** 
   * Set property to set the placeholder value of the search bar.
   * @param {string} value - The placeholder value of the search bar.
   */
  set placeholder(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.placeholderTypeError);
    this.setAttribute({ key: 'placeholder', value: value });
    this.#placeholder = value;
  }
  
  /** 
   * Get property to return the text value for the search bar.
   * @return {string} The text value for the search bar.
   */
  get text() 
  { 
    return this.element.value; 
  }

  /** 
   * Set property to set the text value of the search bar.
   * @param {string} value - The text value of the search bar.
   */
  set text(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.textTypeError);
    this.element.value = value;
  }
  
  /** 
   * Get property to return the text color of the search bar.
   * @return {string} The text color of the search bar.
   */
  get textColor() 
  { 
    return this.#textColor; 
  }
  
  /** 
   * Set property to set the text color of the search bar.
   * @param {string} value - The text color of the search bar.
   */
  set textColor(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.textColorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.textColorInvalidError);

    this.style.setProperty("--input-text-color", value);
    this.#textColor = value;
    setTimeout(() => 
    {
      const input = this.element.querySelector('input');
      if(input) input.style.color = value;
    });
  }
}

/////////////////////////////////////////////////

/** Class representing the segment component. */
class SegmentedControl extends Component
{
  #errors;
  #onChange;
  #segments;
  #color;

  /**
   * Creates the segmented control object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {})
  {
    super({ tagName: "ons-segment", options: options });

    this.#errors = 
    {
      activeIndexTypeError: 'Segmented Control Error: Expected type number for active index.',
      activeIndexTooHighError: 'Segmented Control Error: Index provided was higher than the length of the segments array.',
      activeIndexNegativeError: 'Segmented Control Error: Index cannot be negative.',
      colorInvalidError: 'Segmented Control Error: Invalid color value provided for color.',
      colorTypeError: 'Segmented Control Error: Expected type string for color.',
      onChangeTypeError: 'Segmented Control Error: Expected type function for onChange.',
      segmentTypeError: 'Segmented Control Error: Expected type string for segment.',
      segmentsTypeError: 'Segmented Control Error: Expected type array for segments.'
    };

    this.#segments = [];
    if(options.segments) this.segments = options.segments;
    if(options.onChange) this.onChange = options.onChange;
    this.color = options.color || '#1f8dd6';
    this.width = options.width || '200px';
  }
  
  /** Private method to re-render the segmented control. */
  #render()
  {
    this.#segments.forEach((segment, index) => 
    {
      const button = document.createElement('button');
      button.classList.add('segment__item');
  
      const input = document.createElement("input");
      input.classList.add("segment__input");
      input.type = "radio";
      input.value = index;
      input.name = 'ons-segment-gen-0';
  
      const div = document.createElement("div");
      div.classList.add("segment__button");
      div.textContent = segment;
  
      button.appendChild(input);
      button.appendChild(div);
      this.element.appendChild(button);
    });
  }
  
  /** 
   * Get property to return active index of the segmented control.
   * @return {number} The active index of the segmented control.
   */
  get activeIndex() 
  { 
    return this.element.getActiveButtonIndex(); 
  }
  
  /** 
   * Set property to set the active index of the segmented control.
   * @param {number} value - The active index of the segmented control.
   */
  set activeIndex(value)
  {
    if(!typeChecker.check({ type: 'number', value: value })) console.error(this.#errors.activeIndexTypeError);
    if(value > this.#segments.length) console.error(this.#errors.activeIndexTooHighError);
    if(value < 0 && this.#segments.length > 0)  console.error(this.#errors.activeIndexNegativeError);
    this.element.setActiveButton(value);
  }

  /** 
   * Get property to return the main color of the segmented control.
   * @return {string} The main color of the segmented control.
   */
  get color() 
  { 
    return this.#color; 
  }
  
  /** 
   * Set property to set the main color of the segmented control.
   * @param {string} value - The main color of the segmented control.
   */
  set color(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.colorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.colorInvalidError);

    this.style.setProperty('--segment-color', value );
    this.style.setProperty('--segment-border-top', `1px solid ${value}`);
    this.style.setProperty('--segment-border-bottom', `1px solid ${value}`);
    this.#color = value;
  }
  
  /** 
   * Get property to return the function being called during on change events.
   * @return {function} The function being called during on change events.
   */
  get onChange() 
  { 
    return this.#onChange; 
  }
  
  /** 
   * Set property to set the function being called during on change events.
   * @param {function} value - The function being called during on change events. Returns index of selected segment.
   */
  set onChange(value) 
  {
    if(!typeChecker.check({ type: 'function', value: value })) console.error(this.#errors.onChangeTypeError);
    if(this.#onChange) this.removeEventListener({ event: 'postchange', handler: this.#onChange });
  
    const handler = (event) => 
    {
      const selectedIndex = event.detail.index;
      value(selectedIndex);
    };
  
    this.#onChange = handler;
    this.addEventListener({ event: 'postchange', handler: handler });
  }
  
  /** 
   * Get property to return segments of the segmented control.
   * @return {array} The segments of the segmented control.
   */
  get segments() 
  { 
    return this.#segments; 
  }

  /** 
   * Set property to set the segments of the segmented control.
   * @param {array} value - The sequence of strings with the titles of the control’s segments.
   */
  set segments(value)
  {
    this.element.innerHTML = '';
    this.#segments = [];
    if(!typeChecker.check({ type: 'array', value: value })) console.error(this.#errors.segmentsTypeError);
    value.forEach(segment => 
    { 
      if(!typeChecker.check({ type: 'string', value: segment })) console.error(this.#errors.segmentTypeError);
      this.#segments.push(segment); 
    });
    this.#render();
    this.activeIndex = 0;
  }
}

/////////////////////////////////////////////////

/** Class representing the selector component. */
class Selector extends Component 
{
  #errors;
  #onChange;
  #options;
  #underbar;

  /**
   * Creates the selector object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'ons-select', options: options });

    this.#errors = 
    {
      onChangeTypeError: 'Selector Error: Expected type function for onChange.',
      optionTypeError: 'Selector Error: Expected type string for option.',
      optionsTypeError: 'Selector Error: Expected type array for options.',
      selectedOptionTypeError: 'Selector Error: Expected type string for selected option.',
      selectedOptionNotFoundError: 'Selector Error: The desired selected option could not be found in the options array.',
      underbarTypeError: 'Selector Error: Expected type boolean for underbar.'
    };

    this.#options = [];
    if(options.options) this.options = options.options;
    if(options.onChange) this.onChange = options.onChange;
    if(options.selectedOption) this.selectedOption = options.selectedOption;
    if(options.underbar) this.underbar = options.underbar;
  }
  
  /** 
   * Get property to return the function being called during on change events.
   * @return {function} The function being called during on change events.
   */
  get onChange() 
  { 
    return this.#onChange; 
  }

  /** 
   * Set property to set the function being called during on change events.
   * @param {function} value - The function being called during on change events. Returns the selected option.
   */
  set onChange(value)
  {
    if(!typeChecker.check({ type: 'function', value: value })) console.error(this.#errors.onChangeTypeError);
    if(this.#onChange) this.removeEventListener({ event: 'change', handler: this.#onChange });

    const handler = (event) => 
    {
      const option = event.target.value;
      value(option);
    };

    this.#onChange = handler;
    this.addEventListener({ event: 'change', handler: handler });
  }
  
  /** 
   * Get property to return options of the selector.
   * @return {array} The options of the selector.
   */
  get options() 
  { 
    return this.#options; 
  }
  
  /** 
   * Set property to set the options of the selector.
   * @param {array} value - The sequence of strings with the titles of the selector's options.
   */
  set options(value) 
  {
    if(!typeChecker.check({ type: 'array', value: value })) console.error(this.#errors.optionsTypeError);

    this.element.innerHTML = '';
    this.#options = [];
    this.#options = value;
    const selectElement = document.createElement('select');
    this.#options.forEach((opt) => 
    {
      if(!typeChecker.check({ type: 'string', value: opt })) console.error(this.#errors.optionTypeError);
      const optionElement = document.createElement('option');
      optionElement.textContent = opt;
      optionElement.value = opt;
      selectElement.appendChild(optionElement)
    });
    this.element.appendChild(selectElement);
  }
  
  /** 
   * Get property to return the currently selected option of the selector.
   * @return {string} The currently selected option of the selector.
   */
  get selectedOption() 
  { 
    return this.element.value; 
  }

  /** 
   * Set property to set the selected option of the selector.
   * @param {string} value - The desired option to be selected in the selector. Throws an error if it is not in the set of current options.
   */
  set selectedOption(value) 
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.selectedOptionTypeError);
    if(!this.#options.includes(value)) console.error(this.#errors.selectedOptionNotFoundError);
    this.element.value = value;
  }

  /** 
   * Get property to return if the selector has an underbar underneath it or not.
   * @return {boolean} The selector's underbar value.
   */
  get underbar() 
  { 
    return this.#underbar; 
  }
  
  /** 
   * Set property to set if the selector should have an underbar underneath it or not.
   * @param {boolean} value - The selector's underbar value.
   */
  set underbar(value)
  {
    if(!typeChecker.check({ type: 'boolean', value: value })) console.error(this.#errors.underbarTypeError);
    if(value == true) this.addModifier({ modifier: 'underbar' });
    else this.removeModifier({ modifier: 'underbar' });
    this.#underbar = value;
  }
}

/////////////////////////////////////////////////

/** Class representing the slider component. */
class Slider extends Component
{
  #errors;
  #max;
  #min;
  #step;
  #color;
  #onChange;

  /**
   * Creates the slider object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {})
  {
    super({ tagName: 'ons-range', options: options });

    this.#errors = 
    {
      colorInvalidError: 'Slider Error: Invalid color value provided for color.',
      colorTypeError: 'Slider Error: Expected type string for color.',
      onChangeTypeError: 'Slider Error: Expected type function for onChange.',
      maxTypeError: 'Slider Error: Expected type number for max.',
      minTypeError: 'Slider Error: Expected type number for min.',
      stepTypeError: 'Slider Error: Expected type number for step.',
      valueTypeError: 'Slider Error: Expected type number for value.'
    };
    
    this.max = options.max || 100;
    this.min = options.min || 0;
    this.step = options.step || 10;
    this.color = options.color || '#1f8dd6';

    if(options.onChange) this.onChange = options.onChange;
    if(options.value) this.value = options.value;
  }
  
  /** 
   * Get property to return the max value of the slider.
   * @return {number} The max value of the slider.
   */
  get max() 
  { 
    return this.#max; 
  }
  
  /** 
   * Set property to set the max value of the slider.
   * @param {number} value - The max value of the slider.
   */
  set max(value)
  {
    if(!typeChecker.check({ type: 'number', value: value })) console.error(this.#errors.maxTypeError);
    this.setAttribute({ key: 'max', value: String(value) });
    this.#max = value;
  }
  
  /** 
   * Get property to return the min value of the slider.
   * @return {number} The min value of the slider.
   */
  get min() 
  { 
    return this.#min; 
  }
  
  /** 
   * Set property to set the min value of the slider.
   * @param {number} value - The min value of the slider.
   */
  set min(value)
  {
    if(!typeChecker.check({ type: 'number', value: value })) console.error(this.#errors.minTypeError);
    this.setAttribute({ key: 'min', value: String(value) });
    this.#min = value;
  }
  
  /** 
   * Get property to return the function being called during on change events.
   * @return {function} The function being called during on change events.
   */
  get onChange() 
  { 
    return this.#onChange; 
  }

  /** 
   * Set property to set the function being called during on change events.
   * @param {function} value - The function being called during on change events. Returns the selected option.
   */
  set onChange(value)
  {
    if(!typeChecker.check({ type: 'function', value: value })) console.error(this.#errors.onChangeTypeError);
    if(this.#onChange) this.removeEventListener({ event: 'change', handler: this.#onChange });

    const handler = (event) => 
    {
      const val = event.target.value;
      value(val);
    };

    this.#onChange = handler;
    this.addEventListener({ event: 'change', handler: handler });
  }
  
  /** 
   * Get property to return the step value of the slider.
   * @return {number} The step value of the slider.
   */
  get step() 
  { 
    return this.#step; 
  }
  
  /** 
   * Set property to set the step value of the slider.
   * @param {number} value - The step value of the slider.
   */
  set step(value)
  {
    if(!typeChecker.check({ type: 'number', value: value })) console.error(this.#errors.stepTypeError);
    this.setAttribute({ key: 'step', value: String(value) });
    this.#step = value;
  }
  
  /** 
   * Get property to return the color of the slider.
   * @return {string} The color of the slider.
   */
  get color() 
  { 
    return this.#color; 
  }
  
  /** 
   * Set property to set the color of the slider.
   * @param {string} value - The color of the slider.
   */
  set color(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.colorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.colorInvalidError);
    this.element.style.setProperty('--range-track-background-color-active', value);
    this.#color = value;
  }

  /** 
   * Get property to return the current value of the slider.
   * @return {number} The current value of the slider.
   */
  get value() 
  { 
    return this.element.value; 
  }

  /** 
   * Set property to set the current value of the slider.
   * @param {number} value - The current value of the slider.
   */
  set value(value) 
  { 
    if(!typeChecker.check({ type: 'number', value: value })) console.error(this.#errors.valueTypeError);
    this.element.value = String(value); 
  }
}

/////////////////////////////////////////////////

/** Class representing the splitter component. */
class Splitter extends Component 
{
  #detail;
  #errors;
  #leftMenu;
  #rightMenu;

  /**
   * Creates the splitter object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'ons-splitter', options: options });

    this.#errors = 
    {
      detailTypeError: 'Splitter Error: Detail must be a Page, Tabbar, or Navigator component.',
      leftMenuTypeError: 'Splitter Error: Expected type SplitterMenu for leftMenu.',
      rightMenuTypeError: 'Splitter Error: Expected type SplitterMenu for rightMenu.'
    };
    
    if(options.detail) this.detail = options.detail;
    if(options.leftMenu) this.leftMenu = options.leftMenu;
    if(options.rightMenu) this.rightMenu = options.rightMenu;
  }
  
  /** 
   * Get property to return the left menu of the splitter.
   * @return {SplitterMenu} The left menu of the splitter. 
   */
  get leftMenu() 
  { 
    return this.#leftMenu; 
  }
  
  /** 
   * Set property to set the left menu of the splitter.
   * @param {string} value - The left menu of the splitter.
   */
  set leftMenu(value)
  {
    if(!typeChecker.check({ type: 'splitter-menu', value: value })) console.error(this.#errors.leftMenuTypeError);
    value.side = 'left';
    this.#leftMenu = value;
    this.appendChild({ child: this.#leftMenu });
  }
  
  /** 
   * Get property to return the right menu of the splitter.
   * @return {SplitterMenu} The right menu of the splitter. 
   */
  get rightMenu() 
  {
    return this.#rightMenu; 
  }
  
  /** 
   * Set property to set the right menu of the splitter.
   * @param {string} value - The right menu of the splitter.
   */
  set rightMenu(value)
  {
    if(!typeChecker.check({ type: 'splitter-menu', value: value })) console.error(this.#errors.rightMenuTypeError);
    value.side = 'right';
    this.#rightMenu = value;
    this.appendChild({ child: this.#rightMenu });
  }

  /** 
   * Get property to return the detail of the splitter.
   * @return {multiple} The detail of the splitter. 
   */
  get detail() 
  { 
    return this.#detail; 
  }
  
  /** 
   * Set property to set the detail of the splitter.
   * @param {multiple} value - The detail of the splitter.
   */
  set detail(value)
  {
    if(!typeChecker.checkMultiple({ types: [ 'page', 'navigator', 'tabbar' ], value: value })) console.error(this.#errors.detailTypeError);
  
    this.#detail = value;
  
    const existing = this.element.querySelector('ons-splitter-content');
    if(existing) this.element.removeChild(existing);
    const contentWrapper = document.createElement('ons-splitter-content');

    contentWrapper.appendChild(value.element);
    this.appendChild({ child: contentWrapper });
  }  
}

/////////////////////////////////////////////////

/** Class representing the splitter menu component. */
class SplitterMenu extends Component
{
  #errors;
  #mode;
  #side;
  #swipeable;
  #root;
  #width;
  
  /**
   * Creates the splitter menu object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'ons-splitter-side', options: options });

    this.#errors = 
    {
      modeTypeError: 'Splitter Menu Error: Expected type string for mode.',
      rootTypeError: 'Splitter Menu Error: Root must be a Page, Tabbar, or Navigator component.',
      sideTypeError: 'Splitter Menu Error: Expected type string for side.',
      swipeableTypeError: 'Splitter Menu Error: Expected type swipeable for swipeable.',
      widthTypeError: 'Splitter Menu Error: Expected type string for width.'
    };
    
    this.mode = options.mode || 'split';
    this.swipeable = options.swipeable || true;
    this.width = options.width || '225px';
    if(options.root) this.root = options.root;
  }
  
  /** 
   * Get property to return the mode of the splitter menu.
   * @return {string} The mode of the splitter menu. 
   */
  get mode() 
  { 
    return this.#mode; 
  }
  
  /** 
   * Set property to set the mode of the splitter menu.
   * @param {string} value - The the mode of the splitter menu. Options are split or collpase.
   */
  set mode(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.modeTypeError);
    if(this.#mode)
    {
      this.removeAttribute({ key: 'split' });
      this.removeAttribute({ key: 'collapse' });
    }
    if(value == 'split')
    {
      this.setAttribute({ key: 'split', value: '' });
      this.#mode = value;
    } 
    else
    {
      this.setAttribute({ key: 'collapse', value: '' });
      this.#mode = 'collapse';
    } 
  }
  
  /** 
   * Get property to return the side of the splitter menu.
   * @return {string} The side of the splitter menu. 
   */
  get side() 
  { 
    return this.#side; 
  }
  
  /** 
   * Set property to set the side of the splitter menu.
   * @param {string} value - The side of the splitter menu. Options are left or right, but defaults to left.
   */
  set side(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.sideTypeError);
    if(value == 'right')
    {
      this.setAttribute({ key: 'side', value: 'right' });
      this.#side = value;
    } 
    else 
    {
      this.setAttribute({ key: 'side', value: 'left' });
      this.#side = value;
    }
  }
  
  /** 
   * Get property to return if the splitter menu is swipeable or not.
   * @return {boolean} The splitter menu's swipeable value. 
   */
  get swipeable() 
  {
     return this.#swipeable; 
  }
  
  /** 
   * Set property to set the splitter menu's swipeable value.
   * @param {boolean} value - The splitter menu's swipeable value.
   */
  set swipeable(value)
  {
    if(!typeChecker.check({ type: 'boolean', value: value })) console.error(this.#errors.swipeableTypeError);
    if(value == true) this.setAttribute({ key: 'swipeable', value: '' });
    else this.removeAttribute({ key: 'swipeable' });
    this.#swipeable = value;
  }
  
  /** 
   * Get property to return the root component of the splitter menu.
   * @return {Multiple} The root component of the splitter menu. Supports Page, Navigator or Tabbar. 
   */
  get root() 
  { 
    return this.#root; 
  }
  
  /** 
   * Set property to set the splitter menu's root component.
   * @param {Multiple} value - The root component of the splitter menu.
   */
  set root(value)
  {
    if(!typeChecker.checkMultiple({ types: [ 'page', 'navigator', 'tabbar' ], value: value })) console.error(this.#errors.rootTypeError);
    this.#root = value.element;
    this.appendChild({ child: value.element });
  }
  
  /** 
   * Get property to return the width of the splitter menu.
   * @return {string} The width of the splitter menu. 
   */
  get width() 
  { 
    return this.#width; 
  }
  
  /** 
   * Set property to set the width of the splitter menu.
   * @param {string} value - The width of the splitter menu.
   */
  set width(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.widthTypeError);
    this.setAttribute({ key: 'width', value: value });
    this.#width = value;
  }
  
  /* Public method to close the splitter menu. */
  close() 
  { 
    this.element.close(); 
  }
  
  /* Public method to open the splitter menu. */
  open() 
  { 
    this.element.open(); 
  }
  
  /* Public method to toggle the splitter menu. */
  toggle() 
  { 
    this.element.toggle(); 
  }
}

/////////////////////////////////////////////////

/** Class representing the switch component. */
class Switch extends Component 
{
  #checked;
  #errors;
  #onChange;
  #color;
  
  /**
   * Creates the switch object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'ons-switch', options: options });

    this.#errors = 
    {
      checkedTypeError : 'Switch Error: Expected type boolean for checked.',
      colorInvalidError: 'Switch Error: Invalid color value for color.',
      colorTypeError: 'Switch Error: Expected type string for color.',
      onChangeTypeError: 'Switch Error: Expected type function for onChange.'
    };
    
    this.checked = options.checked || false;
    this.color = options.color || '#44db5e';
    if(options.onChange) this.onChange = options.onChange;
    this.addEventListener({ event: 'click', handler: () => { this.toggle(true); } });
  }
  
  /* Private method to emit switch changes internally. */
  #emitChange()
  {
    const event = new Event('change', { bubbles: true });
    this.element.dispatchEvent(event);
  }
  
  /** 
   * Get property to return the checked value of the switch.
   * @return {boolean} The checked value of the switch. 
   */
  get checked() 
  { 
    return this.#checked; 
  }
  
  /** 
   * Set property to set the checked value of the switch.
   * @param {string} value - The checked value of the switch.
   */
  set checked(value)
  {
    if(!typeChecker.check({ type: 'boolean', value: value })) console.error(this.#errors.checkedTypeError);
    if(value == true) this.on();
    else this.off();
  }
  
  /** 
   * Get property to return the function being called during on change events.
   * @return {function} The function being called during on change events.
   */
  get onChange() 
  { 
    return this.#onChange; 
  }

  /** 
   * Set property to set the function being called during on change events.
   * @param {function} value - The function being called during on change events. Returns the state of the switch.
   */
  set onChange(value)
  {
    if(!typeChecker.check({ type: 'function', value: value })) throw '';
  
    if(this.#onChange) this.removeEventListener({ event: 'change', handler: this.#onChange });
    const handler = (event) => value(event.target.checked);
  
    this.#onChange = handler;
    this.addEventListener({ event: 'change', handler: handler });
  }
  
  /** 
   * Get property to return the color of the switch.
   * @return {string} The color of the switch. 
   */
  get color() 
  { 
    return this.#color; 
  }
  
  /** 
   * Set property to set the color of the switch.
   * @param {string} value - The color of the switch.
   */
  set color(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.colorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.colorInvalidError);
    this.element.style.setProperty("--switch-checked-background-color", value);
    this.element.style.setProperty("--switch-thumb-border-color-active", value);
    this.#color = value;
  }

  /* Public method to turn the switch on. */
  on(tap = false) 
  { 
    this.setAttribute({ key: 'checked', value: '' });
    this.#checked = true;
    if(tap == false) this.#emitChange();
  }

  /* Public method to turn the switch off. */
  off(tap = false) 
  { 
    this.removeAttribute({ key: 'checked' });
    this.#checked = false;
    if(tap == false) this.#emitChange();
  }

  /* Public method to toggle the state of the switch. */
  toggle(tap = false) 
  {
    if(this.#checked == true) this.off(tap);
    else this.on(tap);
  }
}

/////////////////////////////////////////////////

/** Class representing the tab component. */
class Tab extends Component 
{
  #badge;
  #errors;
  #text;
  #icon;
  #root;
  #color;

  /**
   * Creates the tab object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'ons-tab', options: options });

    this.#errors = 
    {
      badgeTypeError: 'Tab Error: Expected type string for badge.',
      colorInvalidError: 'Tab Error: Invalid color value for color.',
      colorTypeError: 'Tab Error: Expected type string for color.',
      iconTypeError: 'Tab Error: Expected type string for icon.',
      rootTypeError: 'Tab Error: Root must be a Page or Navigator component.',
      textTypeError: 'Tab Error: Expected type string for text.'
    };
    
    if(options.badge) this.badge = options.badge;
    this.color = options.color || '#1f8dd6';
    if(options.icon) this.icon = options.icon;
    if(options.root) this.root = options.root;
    if(options.text) this.text = options.text;
    this.addEventListener({ event: 'click', handler: () => { this.onSelect?.(this); }});
  }
  
  /** 
   * Get property to return the badge value of the tab.
   * @return {string} The badge value of tab. 
   */
  get badge() 
  { 
    return this.#badge; 
  }
  
  /** 
   * Set property to set the badge value of the tab.
   * @param {string} value - The badge value of the tab. Setting value to none will remove the badge.
   */
  set badge(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.badgeTypeError);
    this.setAttribute({ key: 'badge', value: value });
    if(value == 'none') this.removeAttribute({ key: 'badge' });
    this.#badge = value;
  }
  
  /** 
   * Get property to return the text value of the tab.
   * @return {string} The text value of tab. 
   */
  get text() 
  { 
    return this.#text; 
  } 
  
  /** 
   * Set property to set the text value of the tab.
   * @param {string} value - The text value of the tab.
   */
  set text(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.textTypeError);
    this.setAttribute({ key: 'label', value: value });
    this.#text = value;
  }
  
  /** 
   * Get property to return the icon value of the tab.
   * @return {string} The icon value of tab. 
   */
  get icon() 
  { 
    return this.#icon; 
  }
  
  /** 
   * Set property to set the icon value of the tab.
   * @param {string} value - The icon value of the tab.
   */
  set icon(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.iconTypeError);
    this.setAttribute({ key: 'icon', value: value });
    this.#icon = value;
  }

  /** 
   * Get property to return the root component of the tab.
   * @return {Multiple} The root component of the tab. Supports Page or Navigator. 
   */
  get root() 
  { 
    return this.#root; 
  }
  
  /** 
   * Set property to set the tab's root component.
   * @param {Multiple} value - The root component of the tab.
   */
  set root(value)
  {
    if(!typeChecker.checkMultiple({ types: [ 'page', 'navigator' ], value: value })) console.error(this.#errors.rootTypeError);
    this.#root = value;
    //setTimeout(() => { value.element.classList.remove('ons-swiper-blocker'); }, 5)
  }

  /** 
   * Get property to return the color of the tab.
   * @return {string} The color of the tab. 
   */
  get color() 
  { 
    return this.#color; 
  }
  
  /** 
   * Set property to set the color of the tab.
   * @param {string} value - The color of the tab.
   */
  set color(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.colorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.colorInvalidError);
    this.#color = value;
  }
}

/////////////////////////////////////////////////

/** Class representing the tabbar component. */
class Tabbar extends Component 
{
  #activetab;
  #errors;
  #tabs;
  #rootComponents;
  #contentContainer;

  /**
   * Creates the tabbar object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'ons-tabbar', options: options });

    this.#errors = 
    {
      activeTabIndexOutOfBoundsError: 'Tabbar Error: Index out of bounds.',
      activeTabTypeError: 'Tabbar Error: Expected type number for activeTab.',
      tabsAlreadySetError: 'Tabbar Error: Setting tabs can only be done statically once.',
      tabTypeError: 'Tabbar Error: Expected type tab in tabs.',
      tabsTypeError: 'Tabbar Error: Expected type array for tabs.'
    };

    this.#contentContainer = document.createElement('div');
    this.#contentContainer.className = 'tabbar__content';
    this.element.appendChild(this.#contentContainer);
    if(options.tabs) this.tabs = options.tabs;
  }

  /** 
   * Get property to return the active tab of the tabbar.
   * @return {Tab} The active tab of the tabbar. 
   */
  get activeTab() 
  {
    return this.#activetab;
  }

  /** 
   * Set property to set the active tab by index.
   * @param {number} value - The index of the tab that nedds to be shown as active in the tabbar. First tab starts at 1.
   */
  set activeTab(value) 
  {
    if(!typeChecker.check({ type: 'number', value: value })) console.error(this.#errors.activeTabTypeError);

    let selectedTab = null;
    const index = value === 0 ? 1 : value;
    if(index < 1 || index >= this.#tabs.length) console.error(this.#errors.activeTabIndexOutOfBoundsError);
    selectedTab = this.#tabs[index];

    if(selectedTab === 0) selectedTab = 1;
  
    this.#rootComponents.forEach((component, index) => 
    {
      const tab = this.#tabs[index];
      const isActive = (tab === selectedTab);

      component.element.style.display = isActive ? "block" : "none";
      setTimeout(() => { component.element.classList.remove('ons-swiper-blocker'); }, 5);

      const icon = tab.element.querySelector(".tabbar__icon ons-icon");
      const text = tab.element.querySelector(".tabbar__label");
  
      if(icon) icon.style.color = isActive ? tab.color : '#999';
      if(text) text.style.color = isActive ? tab.color : '#999';
    });
  
    const selectedIndex = this.#tabs.indexOf(selectedTab);
    const selectedComponent = this.#rootComponents[selectedIndex];

    if(selectedComponent?.constructor?.name === 'Page') 
    {
      const content = selectedComponent.element.querySelector('.page__content');
      const background = selectedComponent.element.querySelector('.page__background');
      const toolbar = selectedComponent.element.querySelector('ons-toolbar');
  
      if(toolbar) if(background) background.style.marginTop = '-44px'; 
      else 
      {
        if(content) content.style.marginTop = '0px';
        if(background) background.style.marginTop = '0px';
      }
    }

    this.#activetab = selectedTab;
  }

  /** 
   * Get property to return the tabs in the tabbar.
   * @return {array} The tabs in the tabbar. 
   */
  get tabs() 
  { 
    return this.#tabs; 
  }

  /** 
   * Set property to set the tabs of the tabbar.
   * @param {array} value - The tabs of the tabbar.
   */
  set tabs(value)
  {
    if(!typeChecker.check({ type: 'array', value: value })) console.error(this.#errors.tabsTypeError);

    if(!this.#tabs)
    {
      this.#tabs = [];
      this.#rootComponents = [];
      this.#contentContainer.innerHTML = '';

      value.forEach(tab => { if(!typeChecker.check({ type: 'tab', value: tab })) console.error(this.#errors.tabTypeError); });
      this.#tabs = value;
      const ghostTab = new Tab({ text: '', icon: '', root: new Page(), color: 'transparent' });
      ghostTab.element.style.display = 'none';
      ghostTab.root.element.style.display = 'none';
    
      this.#tabs.unshift(ghostTab);
      this.#tabs.forEach((tab, index) => 
      {
        tab.onSelect = () => this.activeTab = index;
        this.appendChild({ child: tab.element });
      });
    
      this.#rootComponents = this.#tabs.map((tab) => tab.root);
      this.#rootComponents.forEach((component) => { this.#contentContainer.appendChild(component.element); });
    
      setTimeout(() => { if(this.#tabs.length > 1) this.activeTab = 1; }, 1);
    }
    else console.error(this.#errors.tabsAlreadySetError);
  }
}

/////////////////////////////////////////////////

/** Class representing the text component. */
class Text extends Component 
{
  #errors;
  #type;
  
  /**
   * Creates the tabbar object.
   * @param {object} options - Custom options object to init properties from the constructor. Type can only be configured in the constructor. 
   */
  constructor(options = {}) 
  {
    let validTypes = 
    {
      h1: 'header-1',
      h2: 'header-2',
      h3: 'header-3',
      h4: 'header-4',
      h5: 'header-5',
      h6: 'header-6',
      p: 'paragraph'
    };

    let tagName = 'p';
    if(options.type  == validTypes.h1) tagName = 'h1';
    else if(options.type  == validTypes.h2) tagName = 'h2';
    else if(options.type  == validTypes.h3) tagName = 'h3';
    else if(options.type  == validTypes.h4) tagName = 'h4';
    else if(options.type  == validTypes.h5) tagName = 'h5';
    else if(options.type  == validTypes.h6) tagName = 'h6';

    if(!typeChecker.check({ type: 'string', value: tagName })) throw 'Text Error: Expected type string for type.';

    super({ tagName: tagName, options: options });
    this.#type = tagName;

    this.#errors = 
    {
      colorInvalidError: 'Text Error: Invalid color value for color.',
      colorTypeError: 'Text Error: Expected type string for color.',
      fontSizeTypeError: 'Text Error: Expected type string for font size.',
      fontTypeError: 'Text Error: Expected type string for font.',
      textTypeError: 'Text Error: Expected type string for text.'
    };

    if(options.text) this.text = options.text;
    this.font = options.font || "-apple-system, 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif";
    if(options.fontSize) this.fontSize = options.fontSize;
    if(options.color) this.color = options.color;
  }

  /** 
   * Get property to return the color of the text object.
   * @return {string} The color of the text object. 
   */
  get color() 
  { 
    return this.style.color; 
  }
  
  /** 
   * Set property to set the color of the the text object.
   * @param {string} value - The color of the text object.
   */
  set color(value) 
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.colorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.colorInvalidError);
    this.style.color = value;
  }
  
  /** 
   * Get property to return the font value of the text object.
   * @return {string} The font value of text object. 
   */
  get font() 
  { 
    return this.style.fontFamily; 
  }
  
  /** 
   * Set property to set the font value of the the text object.
   * @param {string} value - The font value of the the text object.
   */
  set font(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.fontTypeError);
    this.style.fontFamily = value;
  }
  
  /** 
   * Get property to return the font size of the text object.
   * @return {string} The font size of text object. 
   */
  get fontSize() 
  { 
    return this.style.fontSize; 
  }
  
  /** 
   * Set property to set the font size of the the text object.
   * @param {string} value - The font size of the the text object.
   */
  set fontSize(value) 
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.fontSizeTypeError);
    this.style.fontSize = value;
  }

  /** 
   * Get property to return the text value of the text object.
   * @return {string} The text value of text object. 
   */
  get text() 
  { 
    return this.element.textContent; 
  }
  
  /** 
   * Set property to set the text value of the the text object.
   * @param {string} value - The text value of the the text object.
   */
  set text(value) 
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.textTypeError);
    this.element.textContent = value;
  }

  /** 
   * Get property to return the type of the text object.
   * @return {string} The type of the text object. 
   */
  get type()
  {
    return this.#type;
  }
}

/////////////////////////////////////////////////

/** Class representing the textarea component. */
class TextArea extends Component 
{
  #caretColor;
  #cols;
  #errors;
  #maxLength;
  #onChange;
  #onTextChange;
  #placeholder;
  #resizable;
  #rows;
  
  /**
   * Creates the TextArea object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'textarea', options: options });

    this.#errors = 
    {
      caretColorInvalidError: 'TextArea Error: Invalid color value provided for caretColor.',
      caretColorTypeError: 'TextArea Error: Expected type string for caretColor.',
      colsTypeError: 'TextArea Error: Expected type number for cols.',
      maxLengthTypeError: 'TextArea Error: Expected type number for maxLength.',
      onChangeTypeError: 'TextArea Error: Expected type function for onChange.',
      onTextChangeTypeError: 'TextArea Error: Expected type function for onTextChange.',
      placeholderTypeError: 'TextArea Error: Expected type string for placeholder.',
      resizableTypeError: 'TextArea Error: Expected boolean value for resizable.',
      rowsTypeError: 'TextArea Error: Expected type number for rows.',
      textColorInvalidError: 'TextArea Error: Invalid color value provided for textColor.',
      textColorTypeError: 'TextArea Error: Expected type string for textColor.',
      textTypeError: 'TextArea Error: Expected type string for text.'
    };
    
    if(options.caretColor) this.caretColor = options.caretColor;
    if(options.cols) this.cols = options.cols;
    if(options.maxLength) this.maxLength = options.maxLength;
    if(options.onChange) this.onChange = options.onChange;
    if(options.onTextChange) this.onTextChange = options.onTextChange;
    if(options.placeholder) this.placeholder = options.placeholder;
    this.resizable = options.resizable || false;
    if(options.rows) this.rows = options.rows;
    if(options.text) this.text = options.text;
    if(options.textColor) this.textColor = options.textColor;
  }
  
  /** 
   * Get property to return the caret color of the text area.
   * @return {string} The caret color of the text area.
   */
  get caretColor() 
  { 
    return this.#caretColor; 
  }
  
  /** 
   * Set property to set the caret color of the text area.
   * @param {string} value - The caret color of the text area.
   */
  set caretColor(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.caretColorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.caretColorInvalidError);
    this.style.caretColor = value;
  }
  
  /** 
   * Get property to return the number of cols for the text area.
   * @return {number} The number of cols for the text area.
   */
  get cols() 
  { 
    return this.#cols; 
  }
  
  /** 
   * Set property to set the number of cols for the text area.
   * @param {number} value - The number of cols for the text area.
   */
  set cols(value)
  {
    if(!typeChecker.check({ type: 'number', value: value })) console.error(this.#errors.colsTypeError);
    this.setAttribute({ key: 'cols', value: String(value) });
    this.#cols = value;
  }
  
  /** 
   * Get property to return the max character length for the text area.
   * @return {number} The max character length for the text area.
   */
  get maxLength() 
  { 
    return this.#maxLength; 
  }
  
  /** 
   * Set property to set the max character length for the text area.
   * @param {number} value - The max character length for the text area.
   */
  set maxLength(value) 
  {
    if(!typeChecker.check({ type: 'number', value: value })) console.error(this.#errors.maxLengthTypeError);
    this.setAttribute({ key: 'maxlength', value: String(value) });
    this.#maxLength = value;
  }
  
  /** 
   * Get property to return the function being called during on change events.
   * @return {function} The function being called during on change events.
   */
  get onChange() 
  { 
    return this.#onChange; 
  }

  /** 
   * Set property to set the function being called during on change events.
   * @param {function} value - The function being called during on change events.
   */
  set onChange(value)
  {
    if(!typeChecker.check({ type: 'function', value: value })) console.error(this.#errors.onChangeTypeError);

    if(this.#onChange) this.removeEventListener({ event: 'change', handler: this.#onChange });
    const handler = (event) => value(event.target.value);

    this.#onChange = handler;
    this.addEventListener({ event: 'change', handler: handler });
  }
  
  /** 
   * Get property to return the function being called during on text change events.
   * @return {function} The function being called during on text change events.
   */
  get onTextChange() 
  { 
    return this.#onTextChange; 
  }

  /** 
   * Set property to set the function being called during on text change events.
   * @param {function} value - The function being called during on text change events.
   */
  set onTextChange(value)
  {
    if(!typeChecker.check({ type: 'function', value: value })) console.error(this.#errors.onTextChangeTypeError);

    if(this.#onTextChange) this.removeEventListener({ event: 'input', handler: this.#onTextChange });
    const handler = (event) => value(event.target.value);

    this.#onTextChange = handler;
    this.addEventListener({ event: 'input', handler: handler });
  }
  
  /** 
   * Get property to return the placeholder value for the text area.
   * @return {string} The placeholder value for the text area.
   */
  get placeholder() 
  { 
    return this.#placeholder; 
  }
  
  /** 
   * Set property to set the placeholder value of the text area.
   * @param {string} value - The placeholder value of the text area.
   */
  set placeholder(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.placeholderTypeError);
    this.setAttribute({ key: 'placeholder', value: value });
    this.#placeholder = value;  
  }

  /** 
   * Get property to return whether the textarea is resizable.
   * @return {boolean} Whether the textarea is resizable.
   */
  get resizable() 
  {
    return this.#resizable;
  }

  /** 
   * Set property to control whether the textarea is resizable.
   * @param {boolean} value - True to make it resizable, false to disable resizing.
   */
  set resizable(value) 
  {
    if(!typeChecker.check({ type: 'boolean', value })) console.error(this.#errors.resizableTypeError); 
    this.style.resize = value ? 'both' : 'none';
    this.#resizable = value;
  }
  
  /** 
   * Get property to return the number of rows for the text area.
   * @return {number} The number of rows for the text area.
   */
  get rows() 
  { 
    return this.#rows; 
  }
  
  /** 
   * Set property to set the number of rows for the text area.
   * @param {number} value - The number of rows for the text area.
   */
  set rows(value)
  {
    if(!typeChecker.check({ type: 'number', value: value })) console.error(this.#errors.rowsTypeError);
    this.setAttribute({ key: 'rows', value: String(value) });
    this.#rows = value;
  }

  /** 
   * Get property to return the text value for the text area.
   * @return {string} The text value for the text area.
   */
  get text() 
  { 
    return this.element.value; 
  }

  /** 
   * Set property to set the text value of the text area.
   * @param {string} value - The text value of the text area.
   */
  set text(value) 
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.textTypeError);
    this.element.value = value;
  }
  
  /** 
   * Get property to return the text color of the text area.
   * @return {string} The text color of the text area.
   */
  get textColor() 
  { 
    return this.style.color;
  }
  
  /** 
   * Set property to set the text color of the text area.
   * @param {string} value - The text color of the text area.
   */
  set textColor(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.textColorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.textColorInvalidError);
    this.style.color = value;
  }
}

/////////////////////////////////////////////////

/** Class representing the Textfield component. */
class Textfield extends Component
{
  #caretColor;
  #errors;
  #maxLength;
  #onChange;
  #onTextChange;
  #placeholder;
  #type;
  #textColor;
  #underbar;
  #validTypes;
  
  /**
   * Creates the Textfield object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {})
  {  
    super({ tagName: 'ons-input', options: options });

    this.#validTypes = 
    {
      email: 'email',
      password: 'password',
      tel: 'tel',
      text: 'text'
    };

    this.#errors = 
    {
      caretColorInvalidError: 'Textfield Error: Invalid color value provided for caretColor.',
      caretColorTypeError: 'Textfield Error: Expected type string for caretColor.',
      maxLengthTypeError: 'Textfield Error: Expected type number for maxLength.',
      onChangeTypeError: 'Textfield Error: Expected type function for onChange.',
      onTextChangeTypeError: 'Textfield Error: Expected type function for onTextChange.',
      placeholderTypeError: 'Textfield Error: Expected type string for placeholder.',
      textColorInvalidError: 'Textfield Error: Invalid color value provided for textColor.',
      textColorTypeError: 'Textfield Error: Expected type string for textColor.',
      textTypeError: 'Textfield Error: Expected type string for text.',
      typeInvalidError: 'Textfield Error: Invalid value provided for type.',
      typeTypeError: 'Textfield Error: Expected type string for type.',
      underbarTypeError: 'Textfield Error: Expected type boolean for underbar.'
    };
    
    if(options.caretColor) this.caretColor = options.caretColor;
    if(options.maxLength) this.maxLength = options.maxLength;
    if(options.onChange) this.onChange = options.onChange;
    if(options.onTextChange) this.onTextChange = options.onTextChange;
    if(options.placeholder) this.placeholder = options.placeholder;
    if(options.text) this.text = options.text;
    if(options.textColor) this.textColor = options.textColor;
    this.type = options.type || 'text';
    this.underbar = options.underbar || true;
  }
  
  /** 
   * Get property to return the caret color of the textfield.
   * @return {string} The caret color of the textfield.
   */
  get caretColor() 
  { 
    return this.#caretColor; 
  }
  
  /** 
   * Set property to set the caret color of the textfield.
   * @param {string} value - The caret color of the textfield.
   */
  set caretColor(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.caretColorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.caretColorInvalidError); 
    this.style.caretColor = value;
  }
  
  /** 
   * Get property to return the max character length for the textfield.
   * @return {number} The max character length for the textfield.
   */
  get maxLength() 
  { 
    return this.#maxLength; 
  }
  
  /** 
   * Set property to set the max character length for the textfield.
   * @param {number} value - The max character length for the textfield.
   */
  set maxLength(value) 
  {
    if(!typeChecker.check({ type: 'number', value: value })) console.error(this.#errors.maxLengthTypeError);
    this.setAttribute({ key: 'maxlength', value: String(value) });
    this.#maxLength = value;
  }
  
  /** 
   * Get property to return the function being called during on change events.
   * @return {function} The function being called during on change events.
   */
  get onChange() 
  { 
    return this.#onChange; 
  }

  /** 
   * Set property to set the function being called during on change events.
   * @param {function} value - The function being called during on change events.
   */
  set onChange(value)
  {
    if(!typeChecker.check({ type: 'function', value: value })) console.error(this.#errors.onChangeTypeError);

    if(this.#onChange) this.removeEventListener({ event: 'change', handler: this.#onChange });
    const handler = (event) => value(event.target.value);

    this.#onChange = handler;
    this.addEventListener({ event: 'change', handler: handler });
  }
  
  /** 
   * Get property to return the function being called during on text change events.
   * @return {function} The function being called during on text change events.
   */
  get onTextChange() 
  { 
    return this.#onTextChange; 
  }

  /** 
   * Set property to set the function being called during on text change events.
   * @param {function} value - The function being called during on text change events.
   */
  set onTextChange(value)
  {
    if(!typeChecker.check({ type: 'function', value: value })) console.error(this.#errors.onTextChangeTypeError);

    if(this.#onTextChange) this.removeEventListener({ event: 'input', handler: this.#onTextChange });
    const handler = (event) => value(event.target.value);

    this.#onTextChange = handler;
    this.addEventListener({ event: 'input', handler: handler });
  }

  /** 
   * Get property to return the placeholder value for the textfield.
   * @return {string} The placeholder value for the textfield.
   */
  get placeholder() 
  { 
    return this.#placeholder; 
  }
  
  /** 
   * Set property to set the placeholder value of the textfield.
   * @param {string} value - The placeholder value of the textfield.
   */
  set placeholder(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.placeholderTypeError);
    this.setAttribute({ key: 'placeholder', value: value });
    this.#placeholder = value;  
  }
  
  /** 
   * Get property to return the text value for the textfield.
   * @return {string} The text value for the textfield.
   */
  get text() 
  { 
    return this.element.value; 
  }
  
  /** 
   * Set property to set the text value of the textfield.
   * @param {string} value - The text value of the textfield.
   */
  set text(value) 
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.textTypeError);
    this.element.value = value;
  }
  
  /** 
   * Get property to return the text color of the textfield.
   * @return {string} The text color of the textfield.
   */
  get textColor() 
  { 
    return this.#textColor;
  }
  
  /** 
   * Set property to set the text color of the textfield
   * @param {string} value - The text color of the textfield.
   */
  set textColor(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.textColorTypeError);
    if(!color.isValid({ color: value })) console.error(this.#errors.textColorInvalidError);
    this.style.setProperty("--input-text-color", value);
    this.#textColor = value;
    setTimeout(() => 
    {
      const input = this.element.querySelector('input');
      if(input) input.style.color = value;
    });
  }
  
  /** 
   * Get property to return the type of the textfield.
   * @return {string} The type of the textfield. 
   */
  get type() 
  { 
    return this.#type; 
  }

  /** 
   * Set property to set the type of the textfield
   * @param {string} value - The type of the textfield.
   */
  set type(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.typeTypeError);
    if(!Object.values(this.#validTypes).includes(value)) console.error(this.#errors.typeInvalidError);
    this.setAttribute({ key: 'type', value: value });
    this.#type = value;
  }
  
  /** 
   * Get property to return if the textfield has an underbar underneath it or not.
   * @return {boolean} The textfield's underbar value.
   */
  get underbar() 
  { 
    return this.#underbar; 
  }

  /** 
   * Set property to set if the textfield should have an underbar underneath it or not.
   * @param {boolean} value - The textfield's underbar value.
   */
  set underbar(value)
  {
    if(!typeChecker.check({ type: 'boolean', value: value })) console.error(this.#errors.underbarTypeError);
    if(value == true) this.addModifier({ modifier: 'underbar' });
    else this.removeModifier({ modifier: 'underbar' });
    this.#underbar = value;
  }
}

/////////////////////////////////////////////////

/** Class representing the Toast component. */
class Toast extends Component
{
  #animation;
  #animationTypes;
  #dismissButton;
  #dismissIcon;
  #errors;
  #messageElement;
  #timeout;

  /**
   * Creates the Toast object.
   * @param {object} options - Custom options object to init properties from the constructor.
   */
  constructor(options = {}) 
  {
    super({ tagName: 'ons-toast', options: options });

    this.#animationTypes = 
    {
      ascend: 'ascend',
      lift: 'lift',
      fall: 'fall',
      fade: 'fade',
      none: 'none'
    };

    this.#errors = 
    {
      animationInvalidError: 'Toast Error: Invalid value provided for animation.',
      animationTypeError: 'Toast Error: Expected type string for animation.',
      dismissIconTypeError: 'Toast Error: Expected type string for dismissIcon.',
      messageTypeError: 'Toast Error: Expected type string for message.',
      timeoutTypeError: 'Toast Error: Expected type number for timeout.'
    };

    this.#messageElement = document.createElement('span');
    this.#dismissButton = document.createElement('button');
    this.#dismissButton.classList.add('toast-dismiss');

    this.element.appendChild(this.#messageElement);
    this.element.appendChild(this.#dismissButton);

    if(options.animation) this.animation = options.animation;
    if(options.dismissIcon) this.dismissIcon = options.dismissIcon;
    if(options.message) this.message = options.message;
    if(options.timeout) this.timeout = options.timeout;
  }

  /** 
   * Get property to return the animation type of the toast notification.
   * @return {string} The animation type of the toast notification.
   */
  get animation()
  {
    return this.#animation;
  }

  /** 
   * Set property to set the animation type of the toast notification.
   * @param {string} value - The animation type of the toast notification.
   */
  set animation(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.animationTypeError);
    if(!Object.values(this.#animationTypes).includes(value)) console.error(this.#errors.animationInvalidError);
    this.element.setAttribute('animation', value);
    this.#animation = value;
  }

  /** 
   * Get property to return the dismiss icon of the toast notification.
   * @return {string} The dismiss icon of the toast notification.
   */
  get dismissIcon()
  {
    return this.#dismissIcon;
  }

  /** 
   * Set property to set the dismiss icon of the toast notification.
   * @param {string} value - The dismiss icon of the toast notification.
   */
  set dismissIcon(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.dismissIconTypeError);
    if(this.#dismissIcon) this.#dismissButton.innerHTML = '';
    this.#dismissIcon = new Icon({ icon: value, size: '22px' });
    this.#dismissButton.appendChild(this.#dismissIcon.element);
    this.#dismissButton.onclick = () => this.dismiss();
    this.#dismissIcon = value;
  }

  /** 
   * Get property to return the message of the toast notification.
   * @return {string} The message of the toast notification.
   */
  get message()
  {
    return this.#messageElement.textContent;
  }

  /** 
   * Set property to set the message of the toast notification.
   * @param {string} value - The message of the toast notification.
   */
  set message(value)
  {
    if(!typeChecker.check({ type: 'string', value: value })) console.error(this.#errors.messageTypeError);  
    this.#messageElement.textContent = value;
  }

  /** 
   * Get property to return the timeout of the toast notification.
   * @return {number} The timeout of the toast notification.
   */
  get timeout()
  {
    return this.#timeout;
  }

  /** 
   * Set property to set the timeout of the toast notification in milliseconds.
   * @param {number} value - The timeout of the toast notification in milliseconds.
   */
  set timeout(value)
  {
    if(!typeChecker.check({ type: 'number', value: value })) console.error(this.#errors.timeoutTypeError);
    this.#timeout = value;
  }
  
  /** Public method to present a toast notification.*/
  present() 
  {
    document.body.appendChild(this.element);
    this.element.show();
    if(this.#timeout) setTimeout(() => this.dismiss(), this.#timeout);
  }
  
  /** Public method to dismiss a toast notification.*/
  dismiss()
  {
    this.element.hide();
  }
}

///////////////////////////////////////////////////////////
// BROWSER MODULE
///////////////////////////////////////////////////////////

/** Singleton class representing the main BrowserManager object. */
class BrowserManager
{
  #errors;
  static #instance = null;

  /** Creates the browser object. **/
  constructor() 
  {
    this.#errors = 
    {
      animatedTypeError: 'Browser Error: Expected type boolean for animated.',
      inAppTypeError: 'Browser Error: Expected type boolean for inApp.',
      singleInstanceError: 'Browser Manager Error: Only one BrowserManager object can exist at a time.',
      urlInvalidError: 'Browser Error: Invalid url supplied, could not open.',
      urlTypeError: 'Browser Error: Expected type string for url.'
    };

    if(BrowserManager.#instance) console.error(this.#errors.singleInstanceError);
    else BrowserManager.#instance = this;
  }

  /** Static method to return a new BrowserManager instance. Allows for Singleton+Module pattern. */
  static getInstance() 
  {
    return new BrowserManager();
  }

  /** 
   * Public method to check if url is a valid website url.
   * @param {string} url - The url to be checked.
   * @return {boolean} If the url is a valid website url or not.
   */
  isValidWebsiteUrl({ url } = {}) 
  {
    if(!typeChecker.check({ type: 'string', value: url })) console.error(this.#errors.urlTypeError);
    const regex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;
    return regex.test(url);
  }

  /** 
   * Public method to open a website url in safari, either within the app or outside in a seperate app.
   * @param {string} url - The url to be opened.
   * @param {boolean} inApp - Flag dictating if the the url should be opened inside or outside the current app.
   * @param {boolean} animated - If the url should be opened with animation or not. Only works when inApp is true.
   */
  open({ url, inApp = true, animated = true } = {})
  {
    if(!typeChecker.check({ type: 'string', value: url })) console.error(this.#errors.urlTypeError);
    if(!this.isValidWebsiteUrl({ url: url })) console.error(this.#errors.urlInvalidError);
    if(!typeChecker.check({ type: 'boolean', value: inApp })) console.error(this.#errors.inAppTypeError);
    if(!typeChecker.check({ type: 'boolean', value: animated })) console.error(this.#errors.animatedTypeError);
    window.webkit.messageHandlers.browserMessageManager.postMessage({ url: url, inApp: inApp, animated: animated });
  }
}

///////////////////////////////////////////////////////////
// DEVICE MODULE
///////////////////////////////////////////////////////////

/** Singleton class representing the main DeviceManager object. */
class DeviceManager
{
  #errors;
  #batteryLevel;
  #batteryState;
  #interfaceStyle;
  #systemName;
  #systemVersion;
  static #instance = null;

  /** Creates the device object. **/
  constructor() 
  {
    this.#errors = 
    {
      singleInstanceError: 'Device Manager Error: Only one DeviceManager object can exist at a time.',
    };

    if(DeviceManager.#instance) console.error(this.#errors.singleInstanceError);
    else DeviceManager.#instance = this;

    this.update();
    setInterval(() => this.update(), 15000); // every 15 seconds.
  }

  /** Static method to return a new DeviceManager instance. Allows for Singleton+Module pattern. */
  static getInstance() 
  {
    return new DeviceManager();
  }

  /** 
   * Get property to return the latest stored battery level.
   * @return {string} The latest stored battery level.
   */
  get batteryLevel()
  {
    return this.#batteryLevel;
  }

  /** 
   * Get property to return the latest stored battery state.
   * @return {string} The latest stored battery state.
   */
  get batteryState()
  {
    return this.#batteryState;
  }

  /** 
   * Get property to return the current orientation.
   * @return {string} The current orientation. Returns either portrait or landscape.
   */
  get currentOrientation()
  {
    if(this.isPortrait === true) return 'portrait';
    else return 'landscape';
  }

  /** 
   * Get property to return the current interface style.
   * @return {string} The current interface style. Returns either light or dark.
   */
  get interfaceStyle()
  {
    return this.#interfaceStyle;
  }

  /** 
   * Get property to return if the current device is an iPad or not.
   * @return {boolean} Value informing the user if current device is an iPad or not.
   */
  get isIpad()
  {
    return ons.platform.isIPad();
  }

  /** 
   * Get property to return if the current device is an iPhone or not.
   * @return {boolean} Value informing the user if current device is an iPhone or not.
   */
  get isIphone()
  {
    return ons.platform.isIPhone();
  }

  /** 
   * Get property to return if the current device is in landscape orientation or not.
   * @return {boolean} Value informing the user if current device is in landscape orientation or not.
   */
  get isLandscape()
  {
    return ons.orientation.isLandscape();
  }

  /** 
   * Get property to return if the current device is in portrait orientation or not.
   * @return {boolean} Value informing the user if current device is in portrait orientation or not.
   */
  get isPortrait()
  {
    return ons.orientation.isPortrait();
  }

  /** 
   * Get property to return the device's screen height.
   * @return {number} The device's screen height.
   */
  get screenHeight()
  {
    if(this.isPortrait === true) return window.innerHeight;
    else return window.innerWidth;
  }

  /** 
   * Get property to return the device's screen width.
   * @return {number} The device's screen width.
   */
  get screenWidth()
  {
    if(this.isPortrait === true) return window.innerWidth;
    else return window.innerHeight;
  }

  /** 
   * Get property to return the device's system name.
   * @return {string} The device's system name.
   */
  get systemName()
  {
    return this.#systemName;
  }

  /** 
   * Get property to return the device's system version.
   * @return {string} The device's system version.
   */
  get systemVersion()
  {
    return this.#systemVersion;
  }

  /** 
  * Public method called by iOS to populate device info. 
  * @param {object} data - The populated device info within a json object.
  */
  receive(data) 
  {
    this.#batteryLevel = data.batteryLevel;
    this.#batteryState = data.batteryState;
    this.#interfaceStyle = data.interfaceStyle;
    this.#systemName = data.systemName;
    this.#systemVersion = data.systemVersion;
  }

  /** Public method called by every 30 seconds to retrieve the latest device information in the background. */
  update() 
  { 
    window.webkit?.messageHandlers?.deviceMessageManager?.postMessage(null);
  }
}

///////////////////////////////////////////////////////////
// CONFETTI
///////////////////////////////////////////////////////////

/** Singleton class representing the Confetti animation controller. */
class ConfettiManager 
{
  #animationTimer;
  #canvas;
  #colors;
  #context;
  #errors;
  #particles;
  #lastFrameTime;
  #pause;
  #streaming;
  #waveAngle;
  static #instance = null;

  alpha;
  frameInterval;
  gradient;
  maxCount;
  speed;
  
  /** Creates the confetti manager. */
  constructor() 
  {
    this.alpha = 1.0;
    this.frameInterval = 15;
    this.gradient = false;
    this.maxCount = 150;
    this.speed = 2;
  
    this.#colors = 
    [
      "rgba(30,144,255,", "rgba(107,142,35,", "rgba(255,215,0,", "rgba(255,192,203,",
      "rgba(106,90,205,", "rgba(173,216,230,", "rgba(238,130,238,", "rgba(152,251,152,",
      "rgba(70,130,180,", "rgba(244,164,96,", "rgba(210,105,30,", "rgba(220,20,60,"
    ];

    this.#errors = 
    {
      singleInstanceError: 'ConfettiManager Error: Only one ConfettiManager instance can exist at a time.',
      timeoutTypeError: 'Confetti Error: Expected type number for timeout.'
    };

    this.#lastFrameTime = Date.now();
    this.#particles = [];
    this.#pause = false;
    this.#streaming = false;
    this.#waveAngle = 0;

    if(ConfettiManager.#instance) 
    {
      console.error(this.#errors.singleInstanceError);
      return ConfettiManager.#instance;
    }
    ConfettiManager.#instance = this;
  }

  /** Static method to return a singleton instance. */
  static getInstance() 
  {
    return new ConfettiManager();
  }

  /** Private method to draw all confetti particles. */
  #drawParticles() 
  {
    for(const p of this.#particles) 
    {
      this.#context.beginPath();
      const x2 = p.x + p.tilt;
      const y2 = p.y + p.tilt + p.diameter / 2;
      const x = x2 + p.diameter / 2;

      if(this.gradient) 
      {
        const grad = this.#context.createLinearGradient(p.x, p.y, x2, y2);
        grad.addColorStop("0", p.color);
        grad.addColorStop("1.0", p.color2);
        this.#context.strokeStyle = grad;
      } 
      else this.#context.strokeStyle = p.color;

      this.#context.lineWidth = p.diameter;
      this.#context.moveTo(x, p.y);
      this.#context.lineTo(x2, y2);
      this.#context.stroke();
    }
  }

  /** Private method to create canvas if it doesn’t exist. */
  #initCanvas() 
  {
    if(!this.#canvas) 
    {
      this.#canvas = document.createElement('canvas');
      this.#canvas.id = 'confetti-canvas';
      this.#canvas.style.cssText = 'display:block;z-index:999999;pointer-events:none;position:fixed;top:0;left:0;';
      document.body.prepend(this.#canvas);
      this.#canvas.width = window.innerWidth;
      this.#canvas.height = window.innerHeight;
      window.addEventListener('resize', () => 
      {
        this.#canvas.width = window.innerWidth;
        this.#canvas.height = window.innerHeight;
      });
      this.#context = this.#canvas.getContext('2d');
    }
  }

  /** Private method to reset particle state. */
  #resetParticle(p, width, height) 
  {
    p.color = this.#colors[Math.floor(Math.random() * this.#colors.length)] + this.alpha + ")";
    p.color2 = this.#colors[Math.floor(Math.random() * this.#colors.length)] + this.alpha + ")";
    p.x = Math.random() * width;
    p.y = Math.random() * height - height;
    p.diameter = Math.random() * 10 + 5;
    p.tilt = Math.random() * 10 - 10;
    p.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
    p.tiltAngle = Math.random() * Math.PI;
    return p;
  }

  /** Private method to animate confetti frame by frame. */
  #runAnimation() 
  {
    if(this.#pause) return;

    const now = Date.now();
    const delta = now - this.#lastFrameTime;

    if(delta > this.frameInterval) 
    {
      this.#context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      this.#updateParticles();
      this.#drawParticles();
      this.#lastFrameTime = now - (delta % this.frameInterval);
    }

    if(this.#particles.length > 0) this.#animationTimer = requestAnimationFrame(() => this.#runAnimation());
    else 
    {
      this.#context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      this.#animationTimer = null;
    }
  }

  /** Private method to update all particle positions. */
  #updateParticles() 
  {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.#waveAngle += 0.01;

    for(let i = 0; i < this.#particles.length; i++) 
    {
      const p = this.#particles[i];
      if(!this.#streaming && p.y < -15) p.y = height + 100;
      else 
      {
        p.tiltAngle += p.tiltAngleIncrement;
        p.x += Math.sin(this.#waveAngle) - 0.5;
        p.y += (Math.cos(this.#waveAngle) + p.diameter + this.speed) * 0.5;
        p.tilt = Math.sin(p.tiltAngle) * 15;
      }

      if(p.x > width + 20 || p.x < -20 || p.y > height) 
      {
        if(this.#streaming && this.#particles.length <= this.maxCount) this.#particles[i] = this.#resetParticle({}, width, height);
        else 
        {
          this.#particles.splice(i, 1);
          i--;
        }
      }
    }
  }

  /** 
   * Get property to return if the animation is currently paused or not.
   * @return {boolean} If animation is currently paused or not.
   */
  get isPaused() 
  {
    return this.#pause;
  }

  /** 
   * Get property to return if the animation is currently running or not.
   * @return {boolean} If animation is currently running or not.
   */
  get isRunning() 
  {
    return this.#streaming;
  }

  /** Public method to pause animation. */
  pause() 
  {
    this.#pause = true;
  }

  /** Public method to completely remove all confetti and the canvas. */
  remove() 
  {
    this.stop();
    this.#pause = false;
    this.#particles = [];
    if(this.#canvas) 
    {
      this.#canvas.remove();
      this.#canvas = null;
      this.#context = null;
    }
  }

  /** Public method to resume animation. */
  resume() 
  {
    if(!this.#pause) return;
    this.#pause = false;
    this.#runAnimation();
  }

  /** 
  * Public method to start the confetti animation. 
  * @param {number} timeout - The time amount for delaying the stop of the animation in milliseconds.
  */
  start({ timeout } = {}) 
  {
    let min = null;
    let max = null;

    if(timeout)
    {
      if(!typeChecker.check({ type: 'number', value: timeout })) console.error(this.#errors.timeoutTypeError);
    }
    
    this.#initCanvas();

    let width = window.innerWidth;
    let height = window.innerHeight;
    let count = this.maxCount;

    if(min !== null) 
    {
      if(max !== null) count += (min === max) ? max : Math.floor(Math.random() * (Math.max(min, max) - Math.min(min, max)) + Math.min(min, max)); 
      else count += min;
    } 
    else if(max !== null) count += max;

    while(this.#particles.length < count) this.#particles.push(this.#resetParticle({}, width, height));
  
    this.#streaming = true;
    this.#pause = false;
    this.#runAnimation();

    if(timeout) setTimeout(() => this.stop(), timeout);
  }

  /** Public method to stop generating new confetti, but let existing fall. */
  stop() 
  {
    this.#streaming = false;
  }

  /** Public method to toggle confetti on or off. */
  toggle() 
  {
    this.#streaming ? this.stop() : this.start();
  }

  /** Public method to toggle the pause. */
  togglePause() 
  {
    this.#pause ? this.resume() : this.pause();
  }
}

///////////////////////////////////////////////////////////
// VALIDATION MODULE
///////////////////////////////////////////////////////////
 
/** Singleton class representing the ValidationManager object. */
class ValidationManager 
{
  #errors;
  static #instance = null;
 
  /** Creates the ValidationManager object. **/
  constructor() 
  {
    this.#errors = 
    {
      cardNumberTypeError: 'Validator Error: Expected type string for cardNumber.',
      dateStringTypeError: 'Validator Error: Expected type string for dateString.',
      emailTypeError: 'Validator Error: Expected type string for email.',
      maxTypeError: 'Validator Error: Expected type number for max.',
      minTypeError: 'Validator Error: Expected type number for min.',
      numberTypeError: 'Validator Error: Expected type number for number.',
      passwordTypeError: 'Validator Error: Expected type string for password.',
      phoneNumberTypeError: 'Validator Error: Expected type string for phone number.',
      singleInstanceError: 'ValidationManager Error: Only one ValidationManager instance can exist at a time.',
      stringTypeError: 'Validator Error: Expected type string for string.',
      urlTypeError: 'Validator Error: Expected type string for url.',
      usernameTypeError: 'Validator Error: Expected type string for username.'
    };

    if(ValidationManager.#instance) console.error(this.#errors.singleInstanceError);
    else ValidationManager.#instance = this;
  }
 
  /** Static method to return a new ValidationManager instance. Allows for Singleton+Module pattern. */
  static getInstance() 
  {
    return new ValidationManager();
  }
 
  /**
   * Checks if a string is empty or contains only whitespace.
   * @param {string} string - The string to check.
   * @return {boolean} True if the string is empty, false otherwise.
   */
  isStringEmpty({ string } = {}) 
  {
    if(!typeChecker.check({ type: 'string', value: string })) console.error(this.#errors.stringTypeError);
    return !string || string.trim().length === 0;
  }
 
  /**
   * Checks if an email address is valid.
   * @param {string} email - The email address to check.
   * @return {boolean} True if the email address is valid, false otherwise.
   */
  isValidEmail({ email } = {}) 
  {
    if(!typeChecker.check({ type: 'string', value: email })) console.error(this.#errors.emailTypeError);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
 
  /**
   * Checks if a phone number is valid.
   * @param {string} phoneNumber - The phone number to check.
   * @return {boolean} True if the phone number is valid, false otherwise.
   */
  isValidPhoneNumber({ phoneNumber } = {}) 
  {
    if(!typeChecker.check({ type: 'string', value: phoneNumber })) console.error(this.#errors.phoneNumberTypeError);
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phoneRegex.test(phoneNumber);
  }
 
  /**
   * Checks if a URL is valid.
   * @param {string} url - The URL to check.
   * @return {boolean} True if the URL is valid, false otherwise.
   */
  isValidURL({ url } = {}) 
  {
    if(!typeChecker.check({ type: 'string', value: url })) console.error(this.#errors.urlTypeError);
    const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-]*)*$/;
    return urlRegex.test(url);
  }
 
  /**
   * Checks if a password meets requirements (min length, uppercase, lowercase, number).
   * @param {string} password - The password to check.
   * @return {boolean} True if the password is valid, false otherwise.
   */
  isValidPassword({ password } = {}) 
  {
    if(!typeChecker.check({ type: 'string', value: password })) console.error(this.#errors.passwordTypeError);
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  }
 
  /**
   * Checks if a number is within a specified range.
   * @param {number} number - The number to check.
   * @param {number} min - The minimum value of the range.
   * @param {number} max - The maximum value of the range.
   * @return {boolean} True if the number is within range, false otherwise.
   */
  isNumberInRange({ number, min, max } = {}) 
  {
    if(!typeChecker.check({ type: 'number', value: number })) console.error(this.#errors.numberTypeError);
    if(!typeChecker.check({ type: 'number', value: min })) console.error(this.#errors.minTypeError);
    if(!typeChecker.check({ type: 'number', value: max })) console.error(this.#errors.maxTypeError);
    return typeof number === 'number' && number >= min && number <= max;
  }
 
  /**
   * Checks if a date string is valid and in the correct format (YYYY-MM-DD).
   * @param {string} dateString - The date string to check.
   * @return {boolean} True if the date is valid, false otherwise.
   */
  isValidDate({ dateString } = {}) 
  {
    if(!typeChecker.check({ type: 'string', value: dateString })) console.error(this.#errors.dateStringTypeError);

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;
 
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
 
  /**
   * Checks if a username is valid (alphanumeric, underscores, 3-16 characters).
   * @param {string} username - The username to check.
   * @return {boolean} True if the username is valid, false otherwise.
   */
  isValidUsername({ username } = {}) 
  {
    if(!typeChecker.check({ type: 'string', value: username })) console.error(this.#errors.usernameTypeError);

    const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
    return usernameRegex.test(username);
  }
 
  /**
   * Validates a credit card number using the Luhn algorithm.
   * @param {string} cardNumber - The credit card number to check.
   * @return {boolean} True if the credit card number is valid, false otherwise.
   */
  isValidCreditCardNumber({ cardNumber } = {}) 
  {
    if(!typeChecker.check({ type: 'string', value: cardNumber })) console.error(this.#errors.cardNumberTypeError);

    const cardRegex = /^\d{13,19}$/;
    if(!cardRegex.test(cardNumber)) return false;
 
    let sum = 0;
    let shouldDouble = false;
 
    for(let i = cardNumber.length - 1; i >= 0; i--) 
    {
      let digit = parseInt(cardNumber[i], 10);
      if(shouldDouble) 
      {
        digit *= 2;
        if(digit > 9) digit -= 9;
      }
 
      sum += digit;
      shouldDouble = !shouldDouble;
    }
 
    return sum % 10 === 0;
  }
}

///////////////////////////////////////////////////////////
// PHASER
///////////////////////////////////////////////////////////

/** Class representing the PhaserGame component. */
class PhaserGame extends Component 
{
  #game;

  /**
   * Creates the PhaserGame object.
   * @param {object} gameConfig - Custom phaser game options to init properties for the internal Phaser.Game object.
   * @param {object} options - Custom options object to init properties from the constructor for the component itself.
   */
  constructor({ config = {}, ...options } = {}) 
  {
    super({ tagName: 'div', options: options });

    this.width = '100%';
    this.height = '100%';
    this.style.position = 'relative';
    if(!config.width) config.width = '100%';
    if(!config.height) config.height = '100%';

    this.#game = new Phaser.Game({ type: Phaser.CANVAS, parent: this.element, ...config });
  }

  /** 
   * Get property to return the game object created internally.
   * @return {Phaser.Game} The game object created internally.
   */
  get game()
  {
    return this.#game;
  }
}

///////////////////////////////////////////////////////////

globalThis.consoleManager = ConsoleManager.getInstance();
globalThis.typeChecker = TypeChecker.getInstance();
globalThis.color = ColorManager.getInstance();
globalThis.app = App.getInstance();
globalThis.ui = UserInterface.getInstance();
globalThis.browser = BrowserManager.getInstance();
globalThis.device = DeviceManager.getInstance();
globalThis.confetti = ConfettiManager.getInstance();
globalThis.validator = ValidationManager.getInstance();

typeChecker.register({ name: 'action-sheet', constructor: ActionSheet });
typeChecker.register({ name: 'action-sheet-button', constructor: ActionSheetButton });
typeChecker.register({ name: 'alert-dialog', constructor: AlertDialog });
typeChecker.register({ name: 'alert-dialog-button', constructor: AlertDialogButton });
typeChecker.register({ name: 'back-bar-button', constructor: BackBarButton });
typeChecker.register({ name: 'bar-button', constructor: BarButton });
typeChecker.register({ name: 'button', constructor: Button });
typeChecker.register({ name: 'card', constructor: Card });
typeChecker.register({ name: 'circular-progress', constructor: CircularProgress });  
typeChecker.register({ name: 'color-picker', constructor: ColorPicker });
typeChecker.register({ name: 'column', constructor: Column }); 
typeChecker.register({ name: 'component', constructor: Component });
typeChecker.register({ name: 'dialog', constructor: Dialog });
typeChecker.register({ name: 'fab-button', constructor: FabButton });
typeChecker.register({ name: 'icon', constructor: Icon });
typeChecker.register({ name: 'image', constructor: Image });
typeChecker.register({ name: 'list', constructor: List }); 
typeChecker.register({ name: 'list-header', constructor: ListHeader });
typeChecker.register({ name: 'list-item', constructor: ListItem });
typeChecker.register({ name: 'list-title', constructor: ListTitle });   
typeChecker.register({ name: 'modal', constructor: Modal });
typeChecker.register({ name: 'navigator', constructor: Navigator });
typeChecker.register({ name: 'page', constructor: Page });
typeChecker.register({ name: 'phaser-scene', constructor: PhaserGame });
typeChecker.register({ name: 'popover', constructor: Popover });
typeChecker.register({ name: 'progress-bar', constructor: ProgressBar });
typeChecker.register({ name: 'rectangle', constructor: Rectangle });
typeChecker.register({ name: 'row', constructor: Row });
typeChecker.register({ name: 'searchbar', constructor: Searchbar });
typeChecker.register({ name: 'segmented-control', constructor: SegmentedControl });
typeChecker.register({ name: 'selector', constructor: Selector });
typeChecker.register({ name: 'slider', constructor: Slider });
typeChecker.register({ name: 'splitter', constructor: Splitter });
typeChecker.register({ name: 'splitter-menu', constructor: SplitterMenu });
typeChecker.register({ name: 'switch', constructor: Switch });
typeChecker.register({ name: 'tab', constructor: Tab }); 
typeChecker.register({ name: 'tabbar', constructor: Tabbar });
typeChecker.register({ name: 'text', constructor: Text }); 
typeChecker.register({ name: 'text-area', constructor: TextArea }); 
typeChecker.register({ name: 'textfield', constructor: Textfield }); 
typeChecker.register({ name: 'toast', constructor: Toast }); 
 
ui.register({ name: 'ActionSheet', constructor: ActionSheet });
ui.register({ name: 'ActionSheetButton', constructor: ActionSheetButton });
ui.register({ name: 'AlertDialog', constructor: AlertDialog });
ui.register({ name: 'AlertDialogButton', constructor: AlertDialogButton });
ui.register({ name: 'BackBarButton', constructor: BackBarButton });
ui.register({ name: 'BarButton', constructor: BarButton });
ui.register({ name: 'Button', constructor: Button });
ui.register({ name: 'Card', constructor: Card });
ui.register({ name: 'CircularProgress', constructor: CircularProgress });
ui.register({ name: 'ColorPicker', constructor: ColorPicker });
ui.register({ name: 'Column', constructor: Column });
ui.register({ name: 'Component', constructor: Component });
ui.register({ name: 'Dialog', constructor: Dialog });
ui.register({ name: 'FabButton', constructor: FabButton });
ui.register({ name: 'Icon', constructor: Icon });
ui.register({ name: 'Image', constructor: Image });
ui.register({ name: 'List', constructor: List });
ui.register({ name: 'ListHeader', constructor: ListHeader });
ui.register({ name: 'ListItem', constructor: ListItem });
ui.register({ name: 'ListTitle', constructor: ListTitle });
ui.register({ name: 'Modal', constructor: Modal });
ui.register({ name: 'Navigator', constructor: Navigator });
ui.register({ name: 'Page', constructor: Page });
ui.register({ name: 'PhaserGame', constructor: PhaserGame });
ui.register({ name: 'Popover', constructor: Popover });
ui.register({ name: 'ProgressBar', constructor: ProgressBar });
ui.register({ name: 'Rectangle', constructor: Rectangle });
ui.register({ name: 'Row', constructor: Row });
ui.register({ name: 'Searchbar', constructor: Searchbar });
ui.register({ name: 'SegmentedControl', constructor: SegmentedControl });
ui.register({ name: 'Selector', constructor: Selector });
ui.register({ name: 'Slider', constructor: Slider });
ui.register({ name: 'Splitter', constructor: Splitter });
ui.register({ name: 'SplitterMenu', constructor: SplitterMenu });
ui.register({ name: 'Switch', constructor: Switch });
ui.register({ name: 'Tab', constructor: Tab });
ui.register({ name: 'Tabbar', constructor: Tabbar });
ui.register({ name: 'Text', constructor: Text });
ui.register({ name: 'TextArea', constructor: TextArea });
ui.register({ name: 'Textfield', constructor: Textfield });
ui.register({ name: 'Toast', constructor: Toast });

///////////////////////////////////////////////////////////