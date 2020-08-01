/*global window, document */
/*jshint supernew:true */

var Item = require('./item');
var FPSDisplay = require('fpsdisplay');
var Utils = require('burner').Utils;
var Vector = require('burner').Vector;
var World = require('./world');

if (typeof window !== 'undefined') {
  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
}

/** @namespace */
var System = {
  name: 'System'
};

/**
 * Holds additional classes that can be defined at runtime.
 * @memberof System
 */
System.Classes = {
  'Item': Item
};

/**
 * Holds a vector describing the system gravity.
 * @memberof System
 */
System.gravity = new Vector(0, 1);

/**
 * Holds a vector describing the system wind.
 * @memberof System
 */
System.wind = new Vector();

/**
 * Stores references to all items in the system.
 * @memberof System
 * @private
 */
System._records = [];

/**
 * Stores references to all items removed from the system.
 * @memberof System
 * @private
 */
System._pool = [];

/**
 * Holds the current and last mouse/touch positions relative
 * to the browser window. Also, holds the current mouse velocity.
 * @public
 */
System.mouse = {
  location: new Vector(),
  lastLocation: new Vector(),
  velocity: new Vector()
};

/**
 * Increments with each call to System.loop.
 * @type {number}
 * @private
 */
System.clock = 0;

/**
 * System.loop() calls this function. Use to execute
 * a function in the animation loop outside of any items.
 * @type {Function}
 * @private
 */
System.frameFunction = null;

/**
 * Stores references to all buffers in the system.
 * @private
 */
System._buffers = {};

/**
 * Set to 1 to sort System._records.list by zIndex.
 * @type Number
 */
System.zSort = 0;

/**
 * Set to true to save properties defined in System.saveItemProperties from
 * each object in each frame.
 * @type boolean
 */
System.saveData = false;

/**
 * Recording starts with this frame number.
 * @type number
 */
System.saveStartFrame = -1;

/**
 * Recording ends with this frame number.
 * @type number
 */
System.saveEndFrame = -1;

/**
 * Time in milliseconds to wait before calling animation loop.
 * @type number
 */
System.saveDataTimeoutLength = 500;

/**
 * Defines the properties to save in System.data for each item
 * in each frame.
 * @type Object
 */
System.saveItemProperties = {
  id: true,
  name: true,
  scale: true,
  location: true,
  velocity: true,
  angle: true,
  minSpeed: true,
  maxSpeed: true,
  hue: true,
  saturation: true,
  lightness: true,
  color: true,
  opacity: true
};

/**
 * Defines the properties to save in System.data for each world
 * in each frame.
 * @type Object
 */
System.saveWorldProperties = {
  id: true,
  name: true,
  width: true,
  height: true,
  color: true,
  resolution: true,
  colorMode: true
};

/**
 * Stores properties from each object in each frame.
 * @type Array
 * @example
 [
    {
      frame: 0,
      items: [
        {},
        {},
        ...
      ]
    }
 ]
 */
System.data = null;

/**
 * Returns all worlds.
 *
 * @function getAllWorlds
 * @memberof System
 * @return {Array.<Buffer>} An array of worlds.
 */
System.getAllWorlds = function() {
  return System.getAllItemsByName('World');
};

/**
 * Returns all buffers.
 *
 * @function getAllBuffers
 * @memberof System
 * @return {Array.<Buffer>} An array of buffers.
 */
System.getAllBuffers = function() {
  return System._buffers;
};

 /**
  * Call to execute any setup code before starting the animation loop.
  * @function setup
  * @param  {Object} opt_func   A function to run before the function exits.
  * @memberof System
  */
System.setup = function(opt_func) {

  var func = opt_func || function() {}, i, l, max;

  document.body.onorientationchange = System.updateOrientation;

  // save the current and last mouse position
  Utils.addEvent(document, 'mousemove', System._recordMouseLoc);

  // save the current and last touch position
  Utils.addEvent(window, 'touchstart', System._recordMouseLoc);
  Utils.addEvent(window, 'touchmove', System._recordMouseLoc);
  Utils.addEvent(window, 'touchend', System._recordMouseLoc);

  // listen for key up
  Utils.addEvent(window, 'keyup', System._keyup);

  // save the setup callback in case we need to reset the system.
  System.setupFunc = func;

  System.setupFunc.call(this);
};

/**
 * Adds instances of class to _records and calls init on them.
 * @function add
 * @memberof System
 * @param {string} [opt_klass = 'Item'] The name of the class to add.
 * @param {Object} [opt_options=] A map of initial properties.
 * @param {Object} [opt_world = System._records[0]] An instance of World to contain the item.
 * @returns {Object} An instance of the added item.
 */
System.add = function(opt_klass, opt_options, opt_world) {

  var klass = opt_klass || 'Item',
      options = opt_options || {},
      world = opt_world || System.firstWorld(),
      records = this._records, obj;

  // recycle object if one is available; obj must be an instance of the same class
  for (var i = 0, max = System._pool.length; i < max; i++) {
    if (System._pool[i].name === klass) {
      obj = System._cleanObj(System._pool.splice(i, 1)[0]);
      break;
    }
  }

  if (!obj) {
    if (klass.toLowerCase() === 'world') {
      obj = new World(options);
    } else if (System.Classes[klass]) {
      obj = new System.Classes[klass](options);
    } else {
      obj = new Item();
    }
  }

  options.name = klass;
  obj.init(world, options);
  records.push(obj);
  return obj;
};

/**
 * Removes all properties from the passed object.
 * @param  {Object} obj An object.
 * @return {Object}     The passed object.
 */
System._cleanObj = function(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      delete obj[prop];
    }
  }
  return obj;
};

/**
 * Removes an item from the system.
 * @function remove
 * @memberof System
 * @param {Object} obj The item to remove.
 */
System.remove = function (obj) {

  var i, max, records = System._records;

  for (i = 0, max = records.length; i < max; i++) {
    if (records[i].id === obj.id) {
      if (records[i].el) {
        records[i].el.style.visibility = 'hidden'; // hide item
      }
      System._pool[System._pool.length] = records.splice(i, 1)[0]; // move record to pool array
      break;
    }
  }
};

/**
 * Iterates over records.
 * @param {Function} [opt_function=function(){}] A function.
 * @function loop
 * @memberof System
 */
System.loop = function(opt_function) {

  var i, record, records = System._records,
      len = System._records.length,
      frameFunction = opt_function || function() {},
      worlds = System.getAllWorlds(),
      buffers = System.getAllBuffers(),
      shadows = '';

  if (!System.frameFunction) {
    System.frameFunction = frameFunction;
  }

  // check if we've exceeded totalFrames
  if (System.checkFramesSaved()) {
    return;
  }

  // setup entry in System.data
  if (System.saveData) {
    System.data = System._resetData();
  }

  for (i = len - 1; i >= 0; i -= 1) {

    record = records[i];

    if (record && record.step && !record.world.pauseStep) {

      if (record.life < record.lifespan) {
        record.life += 1;
      } else if (record.lifespan !== -1) {
        System.remove(record);
        continue;
      }

      if (record instanceof World) {
        System._buffers[record.id] = '';
      }

      record.step();

      if (System.saveData && record.name !== 'World' && record.opacity) { // we don't want to record World data as Item
        if (!System._checkSaveFrame()) {
          continue;
        }
        System._saveItemProperties(System.data.items.length, record);
      }
    }
  }

  if (System.zSort) {
    records = records.sort(function(a,b){return (a.zIndex - b.zIndex);});
  }

  len = System._records.length; // check length in case items were removed in step()

  // loop thru records and build box shadows
  for (i = records.length - 1; i >= 0; i -= 1) {
    record = records[i];
    if (record.world && record.location && record.opacity && !(record instanceof World)) {

      shadows = buffers[record.world.id];

      if (record.world.colorMode === 'rgb' && record.color) {
        shadows = shadows + System._buildStringRGBA(record);
      } else if (record.world.colorMode === 'hsl' && record.color) {
        shadows = shadows + System._buildStringHSLA(record);
      } else {
        throw new Error('System: current color mode not supported.');
      }
      buffers[record.world.id] = shadows;
    }
  }

  // loop thru worlds and apply box shadow
  for (i = worlds.length - 1; i >= 0; i -= 1) {
    world = worlds[i];
    style = world.el.style;
    buffer = buffers[world.id];
    buffers[worlds[i].id] = ''; // clear buffer
    style.boxShadow = buffer.substr(0, buffer.length - 1); // remove the last comma
    style.borderRadius = world.borderRadius + '%';
  }

  // check to call frame complete callback.
  if (System.saveData && System._checkSaveFrame()) {
    System.saveDataComplete(System.clock, System.data);
  }
  System.clock++;
  if (FPSDisplay.active) { // TODO: test this
    FPSDisplay.update(len);
  }
  System.frameFunction.call(this);
  if (typeof window.requestAnimationFrame !== 'undefined' && !System._checkSaveFrame()) {
    window.requestAnimationFrame(System.loop);
  } else {
    setTimeout(System.loop, System.saveDataTimeoutLength);
  }
};

/**
 * Called when frame has completed rendering. You should
 * override this function with your own handler.
 * @param {number} frameNumber The current frame number (System.clock).
 * @param {Object} data The data saved from the current frame.
 * @throws {Object} If not overridden.
 */
System.saveDataComplete = function(frameNumber, data) {
  throw new Error('System.saveDataComplete not implemented. Override this function.');
};

/**
 * Called if saveEndFrame - saveStartFrame exceeds System.clock.
 */
System.totalFramesCallback = function() {
  var totalFrames = System.saveEndFrame - System.saveStartFrame;
  console.log('Rendered ' + totalFrames + ' frames.');
};

/**
 * Checks if the System recorded the total number of frames.
 * @return {boolean} True if system has recorded the total number of frames.
 */
System.checkFramesSaved = function() {
  var totalFrames = System.saveEndFrame - System.saveStartFrame;
  if (totalFrames > 0 && System.clock >= System.saveEndFrame) {
    System.totalFramesCallback();
    return true;
  }
};

/**
 * Checks if System.clock is within bounds.
 * @returns {Boolean} True if frame should be recorded.
 */
System._checkSaveFrame = function() {
  if (System.clock >= System.saveStartFrame && System.clock <= System.saveEndFrame) {
    return true;
  }
};

/**
 * Resets System.data.
 */
System._resetData = function() {
  return {
    frame: System.clock,
    world: {},
    items: []
  };
};

/**
 * Saves properties of the passed record that match properties
 * defined in System.saveItemProperties.
 * @param {number} index The array index for this object.
 * @param {Object} record An Item instance.
 */
System._saveItemProperties = function(index, record) {

  for (var i in record) {
    if (record.hasOwnProperty(i) && System.saveItemProperties[i]) {
      var val = record[i];
      if (val instanceof Vector) { // we want to copy the scalar values out of the Vector
        val = {
          x: parseFloat(record[i].x.toFixed(2), 10),
          y: parseFloat(record[i].y.toFixed(2), 10)
        };
      }
      if (typeof val === 'number') {
        val = parseFloat(val.toFixed(2), 10);
      }
      var frame = System.data;
      var item = frame.items[index];
      if (typeof item !== 'object') {
        frame.items[index] = {};
      }
      frame.items[index][i] = val;
    }
    if (!System.data.world.id) {
      for (var j in record.world) {
        if (record.world.hasOwnProperty(j) && System.saveWorldProperties[j]) {
          System.data.world[j] = record.world[j];
        }
      }
    }
  }
};

// TODO: implement step forward function
/**
 * Pauses the system and processes one step in records.
 *
 * @function _stepForward
 * @memberof System
 * @private
 */
/*System._stepForward = function() {

  var i, j, max, records = System._records,
      world, worlds = System.getAllWorlds();

  System.clock++;
};*/

/**
 * Builds an hsla box shadow string based on the passed
 * object's properties.
 * @private
 */
System._buildStringHSLA = function(item) {

    var resolution = item.world.resolution,
        loc = item.location;

    return (loc.x * resolution) + 'px ' + // left offset
        (loc.y * resolution) + 'px ' + // right offset
        item.blur + 'px ' + // blur
        (resolution * item.scale) + 'px ' + // spread
        'hsla(' + item.color[0] + ',' + (item.color[1] * 100) + '%,' + (item.color[2] * 100) + '%' + // color
        ', ' + item.opacity + '),'; // opacity
};

/**
 * Builds an rgba box shadow string based on the passed
 * object's properties.
 * @private
 */
System._buildStringRGBA = function(item) {

    var resolution = item.world.resolution,
        loc = item.location;

    return (loc.x * resolution) + 'px ' + // left offset
        (loc.y * resolution) + 'px ' + // right offset
        item.blur + 'px ' + // blur
        (resolution * item.scale) + 'px ' + // spread
        'rgba(' + item.color[0] + ',' + item.color[1] + ',' + item.color[2] + // color
        ', ' + item.opacity + '),'; // opacity
};

/**
 * Saves the mouse/touch location relative to the browser window.
 *
 * @function _recordMouseLoc
 * @memberof System
 * @private
 */
System._recordMouseLoc = function(e) {

  var touch, world = System.firstWorld();

  System.mouse.lastLocation.x = System.mouse.location.x;
  System.mouse.lastLocation.y = System.mouse.location.y;

  if (e.changedTouches) {
    touch = e.changedTouches[0];
  }

  /**
   * Mapping window size to world size allows us to
   * lead an agent around a world that's not bound
   * to the window.
   */
  if (e.pageX && e.pageY) {
    System.mouse.location.x = Utils.map(e.pageX, 0, window.innerWidth, 0, world.width);
    System.mouse.location.y = Utils.map(e.pageY, 0, window.innerHeight, 0, world.height);
  } else if (e.clientX && e.clientY) {
    System.mouse.location.x = Utils.map(e.clientX, 0, window.innerWidth, 0, world.width);
    System.mouse.location.y = Utils.map(e.clientY, 0, window.innerHeight, 0, world.height);
  } else if (touch) {
    System.mouse.location.x = touch.pageX;
    System.mouse.location.y = touch.pageY;
  }

  System.mouse.velocity.x = System.mouse.lastLocation.x - System.mouse.location.x;
  System.mouse.velocity.y = System.mouse.lastLocation.y - System.mouse.location.y;
};

/**
 * Returns the first world in the system.
 *
 * @function firstWorld
 * @memberof System
 * @returns {null|Object} An instance of World.
 */
System.firstWorld = function() {
  return this._records.length ? this._records[0] : null;
};

/**
 * Returns all worlds.
 *
 * @function allWorlds
 * @memberof System
 * @return {Array.<World>} An array of worlds.
 */
System.allWorlds = function() {
  return System.getAllItemsByName('World');
};

/**
 * Returns an array of items created from the same constructor.
 *
 * @function getAllItemsByName
 * @memberof System
 * @param {string} name The 'name' property.
 * @param {Array} [opt_list = this._records] An optional list of items.
 * @returns {Array} An array of items.
 */
System.getAllItemsByName = function(name, opt_list) {

  var i, max, arr = [],
      list = opt_list || this._records;

  for (i = 0, max = list.length; i < max; i++) {
    if (list[i].name === name) {
      arr[arr.length] = list[i];
    }
  }
  return arr;
};

/**
 * Returns an array of items with an attribute that matches the
 * passed 'attr'. If 'opt_val' is passed, 'attr' must equal 'val'.
 *
 * @function getAllItemsByAttribute
 * @memberof System
 * @param {string} attr The property to match.
 * @param {*} [opt_val=] The 'attr' parameter must equal this param.
 * @param {string} name The item's name property must equal this param.
 * @returns {Array} An array of items.
 */
System.getAllItemsByAttribute = function(attr, opt_val, opt_name) { // TODO: add test

  var i, max, arr = [], records = this._records,
      val = typeof opt_val !== 'undefined' ? opt_val : null,
      name = opt_name || false;

  for (i = 0, max = records.length; i < max; i++) {
    if (typeof records[i][attr] !== 'undefined') {
      if (val !== null && records[i][attr] !== val) {
        continue;
      }
      if (name && records[i].name !== name) {
        continue;
      }
      arr[arr.length] = records[i];
    }
  }
  return arr;
};

/**
 * Handles keyup events.
 *
 * @function _keyup
 * @memberof System
 * @private
 * @param {Object} e An event.
 */
System._keyup = function(e) {

  var i, max, world, worlds = System.allWorlds();

  switch(e.keyCode) {
    case 39:
      //System._stepForward();
      break;
    case 80: // p; pause/play
      for (i = 0, max = worlds.length; i < max; i++) {
        world = worlds[i];
        world.pauseStep = !world.pauseStep;
      }
      break;
    case 82: // r; reset
      System._resetSystem();
      break;
    case 83: // s; reset
      System._toggleStats();
      break;
  }
};

/**
 * Toggles stats display.
 *
 * @function _toggleStats
 * @memberof System
 * @private
 */
System._toggleStats = function() {

  if (!FPSDisplay.fps) {
    FPSDisplay.init();
  } else {
    FPSDisplay.active = !FPSDisplay.active;
  }

  if (!FPSDisplay.active) {
    FPSDisplay.hide();
  } else {
    FPSDisplay.show();
  }
};

/**
 * Resets the system.
 *
 * @function _resetSystem
 * @memberof System
 * @private
 */
System._resetSystem = function() {

  var i, max, worlds = System.allWorlds();

  for (i = 0, max = worlds.length; i < max; i++) {
    worlds[i].pauseStep = false;
  }

  System._records = [];
  System._pool = [];
  System.clock = 0;
  System.setup(System.setupFunc);
};

module.exports = System;
