/*jslint browser: true, devel: true, onevar: true, undef: true, regexp: true, bitwise: true, newcap: true*/
/*globals doodle*/
(function () {
  var layer_static_properties,
      layer_count = 0,
      /*DEBUG*/
      type_check = doodle.utils.debug.type_check,
      range_check = doodle.utils.debug.range_check,
      /*END_DEBUG*/
      set_element_property = doodle.utils.set_element_property;
  
  /**
   * @name doodle.createLayer
   * @class
   * @augments doodle.ElementNode
   * @param {string=} id
   * @param {HTMLCanvasElement=} element
   * @return {doodle.Layer}
   * @throws {SyntaxError}
   */
  doodle.Layer = doodle.createLayer = function (id, element) {
    var layer_name = (typeof id === 'string') ? id : "layer"+ String('00'+layer_count).slice(-2),
        layer = Object.create(doodle.createElementNode(undefined, layer_name));

    Object.defineProperties(layer, layer_static_properties);
    //properties that require privacy
    Object.defineProperties(layer, (function () {
      //defaults
      var width = 0,
          height = 0,
          filters = null,
          context = null;
      
      return {
        /**
         * Canvas dimensions need to apply to HTML attributes.
         * @name width
         * @return {number}
         * @throws {TypeError}
         * @property
         * @override
         */
        'width': {
          enumerable: true,
          configurable: true,
          get: function () { return width; },
          set: function (n) {
            /*DEBUG*/
            type_check(n,'number', {label:'Layer.width', id:this.id});
            range_check(window.isFinite(n), {label:'Layer.width', id:this.id, message:"Parameter must be a finite number."});
            /*END_DEBUG*/
            width = set_element_property(this.element, 'width', n, 'html');
          }
        },

        /**
         * 
         * @name height
         * @return {number}
         * @throws {TypeError}
         * @property
         * @override
         */
        'height': {
          enumerable: true,
          configurable: true,
          get: function () { return height; },
          set: function (n) {
            /*DEBUG*/
            type_check(n,'number', {label:'Layer.height', id:this.id});
            range_check(window.isFinite(n), {label:'Layer.height', id:this.id, message:"Parameter must be a finite number."});
            /*END_DEBUG*/
            height = set_element_property(this.element, 'height', n, 'html');
          }
        },

        /**
         * 
         * @name context
         * @return {CanvasRenderingContext2D}
         * @property
         * @override
         */
        'context': {
          enumerable: true,
          configurable: true,
          get: function () { return context; }
        },

        /**
         * Collection of filters to apply to the canvas bitmap.
         * @name filters
         * @return {Array}
         * @property
         */
        'filters': {
          enumerable: true,
          configurable: true,
          get: function () { return filters; },
          set: function (filtersVar) {
            /*DEBUG*/
            if (filtersVar !== null) {
              type_check(filtersVar,'array', {label:'Layer.filters', id:this.id});
            }
            /*END_DEBUG*/
            filters = filtersVar;
          }
        },
        
        /**
         * Layer specific things to setup when adding a dom element.
         * Called in ElementNode.element
         * @name __addDomElement
         * @param {HTMLElement} elementArg
         * @throws {TypeError}
         * @override
         * @private
         */
        '__addDomElement': {
          enumerable: false,
          writable: false,
          value: function (elementArg) {
            /*DEBUG*/
            console.assert(typeof elementArg === 'object' && elementArg.toString() === '[object HTMLCanvasElement]', "elementArg is a canvas", elementArg);
            /*END_DEBUG*/
            //need to stack canvas elements inside div
            set_element_property(elementArg, 'position', 'absolute');
            //set to display dimensions if there
            if (this.parent) {
              this.width = this.parent.width;
              this.height = this.parent.height;
            }
            //set rendering context
            context = elementArg.getContext('2d');
          }
        },

        /**
         * Layer specific things to setup when removing a dom element.
         * Called in ElementNode.element
         * @name __removeDomElement
         * @param {HTMLElement} elementArg
         * @override
         * @private
         */
        '__removeDomElement': {
          enumerable: false,
          writable: false,
          value: function (elementArg) { context = null; }
        }
        
      };
    }()));//end defineProperties

    switch (arguments.length) {
    case 0:
      break;
    case 1:
      //passed function or id string
      if (typeof arguments[0] === 'function') {
        arguments[0].call(layer);
        id = undefined;
      }
      break;
    case 2:
      /*DEBUG*/
      type_check(element,'canvas', {label:'Layer', id:this.id, message:"Invalid initialization."});
      /*END_DEBUG*/
      layer.element = element;
      break;
    default:
      throw new SyntaxError("[object Layer](id, element): Invalid number of parameters.");
    }

    if (layer.element === null) {
      layer.element = document.createElement('canvas');
    }
    
    layer_count += 1;

    return layer;
  };

  
  layer_static_properties = {
    /**
     * Returns the string representation of the specified object.
     * @name toString
     * @return {string}
     * @override
     */
    'toString': {
      enumerable: true,
      writable: false,
      configurable: false,
      value: function () { return "[object Layer]"; }
    },

    /**
     * This is always the same size, so we'll save some computation.
     * @name __getBounds
     * @return {Rectangle}
     * @override
     * @private
     */
    '__getBounds': {
      enumerable: true,
      configurable: true,
      value: (function () {
        var rect = doodle.geom.createRectangle(0, 0, 0, 0); //recycle
        return function () {
          return rect.compose(0, 0, this.width, this.height);
        };
      }())
    }
  };//end layer_static_properties
  
}());//end class closure

/*
 * CLASS METHODS
 */

/**
 * Test if an object is a Layer.
 * @name isLayer
 * @param {Object} obj
 * @return {boolean}
 * @static
 */
doodle.Layer.isLayer = function (obj) {
  if (typeof obj === 'object') {
    while (obj) {
      if (obj.toString() === '[object Layer]') {
        return true;
      } else {
        obj = Object.getPrototypeOf(obj);
      }
    }
  }
  return false;
};
