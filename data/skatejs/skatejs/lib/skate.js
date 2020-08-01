(function (factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "module", "./constants", "./document-observer", "./lifecycle", "./registry", "./utils", "./version"], factory);
  } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
    factory(exports, module, require("./constants"), require("./document-observer"), require("./lifecycle"), require("./registry"), require("./utils"), require("./version"));
  }
})(function (exports, module, _constants, _documentObserver, _lifecycle, _registry, _utils, _version) {
  "use strict";

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

  var TYPE_ATTRIBUTE = _constants.TYPE_ATTRIBUTE;
  var TYPE_CLASSNAME = _constants.TYPE_CLASSNAME;
  var TYPE_ELEMENT = _constants.TYPE_ELEMENT;

  var documentObserver = _interopRequire(_documentObserver);

  var triggerCreated = _lifecycle.triggerCreated;
  var triggerAttached = _lifecycle.triggerAttached;
  var triggerDetached = _lifecycle.triggerDetached;
  var triggerAttributeChanged = _lifecycle.triggerAttributeChanged;
  var initElements = _lifecycle.initElements;

  var registry = _interopRequire(_registry);

  var debounce = _utils.debounce;
  var inherit = _utils.inherit;

  var version = _interopRequire(_version);

  var HTMLElement = window.HTMLElement;

  /**
   * Initialises all valid elements in the document. Ensures that it does not
   * happen more than once in the same execution, and that it happens after the DOM is ready.
   *
   * @returns {undefined}
   */
  var initDocument = debounce(function () {
    if (document.readyState === "complete" || document.readyState === "interactive") {
      initElements(document.documentElement.childNodes);
    } else {
      document.addEventListener("DOMContentLoaded", function initialiseSkateElementsOnDomLoad() {
        initElements(document.documentElement.childNodes);
      });
    }
  });

  /**
   * Creates a constructor for the specified definition.
   *
   * @param {Object} definition The definition information to use for generating the constructor.
   *
   * @returns {Function} The element constructor.
   */
  function makeElementConstructor(definition) {
    function CustomElement() {
      var element;
      var tagToExtend = definition["extends"];
      var definitionId = definition.id;

      if (tagToExtend) {
        element = document.createElement(tagToExtend);
        element.setAttribute("is", definitionId);
      } else {
        element = document.createElement(definitionId);
      }

      // Ensure the definition prototype is up to date with the element's
      // prototype. This ensures that overwriting the element prototype still
      // works.
      definition.prototype = CustomElement.prototype;

      // If they use the constructor we don't have to wait until it's attached.
      triggerCreated(element, definition);

      return element;
    }

    // This allows modifications to the element prototype propagate to the
    // definition prototype.
    CustomElement.prototype = definition.prototype;

    return CustomElement;
  }

  // Public API
  // ----------

  /**
   * Creates a listener for the specified definition.
   *
   * @param {String} id The ID of the definition.
   * @param {Object | Function} definition The definition definition.
   *
   * @returns {Function} Constructor that returns a custom element.
   */
  function skate(id, definition) {
    // Just in case the definition is shared, we duplicate it so that internal
    // modifications to the original aren't shared.
    definition = inherit({}, definition);
    definition = inherit(definition, skate.defaults);
    definition.id = id;

    registry.set(id, definition);

    if (registry.isNativeCustomElement(id)) {
      var elementPrototype = definition["extends"] ? document.createElement(definition["extends"]).constructor.prototype : HTMLElement.prototype;

      if (!elementPrototype.isPrototypeOf(definition.prototype)) {
        definition.prototype = inherit(Object.create(elementPrototype), definition.prototype, true);
      }

      var options = {
        prototype: inherit(definition.prototype, {
          createdCallback: function createdCallback() {
            triggerCreated(this, definition);
          },
          attachedCallback: function attachedCallback() {
            triggerAttached(this, definition);
          },
          detachedCallback: function detachedCallback() {
            triggerDetached(this, definition);
          },
          attributeChangedCallback: function attributeChangedCallback(name, oldValue, newValue) {
            triggerAttributeChanged(this, definition, {
              name: name,
              oldValue: oldValue,
              newValue: newValue
            });
          }
        })
      };

      if (definition["extends"]) {
        options["extends"] = definition["extends"];
      }

      return document.registerElement(id, options);
    }

    initDocument();
    documentObserver.register(!!definition.detached);

    if (registry.isType(id, TYPE_ELEMENT)) {
      return makeElementConstructor(definition);
    }
  }

  /**
   * Synchronously initialises the specified element or elements and descendants.
   *
   * @param {Mixed} nodes The node, or nodes to initialise. Can be anything:
   *                      jQuery, DOMNodeList, DOMNode, selector etc.
   *
   * @returns {skate}
   */
  skate.init = function (nodes) {
    var nodesToUse = nodes;

    if (!nodes) {
      return nodes;
    }

    if (typeof nodes === "string") {
      nodesToUse = nodes = document.querySelectorAll(nodes);
    } else if (nodes instanceof HTMLElement) {
      nodesToUse = [nodes];
    }

    initElements(nodesToUse);

    return nodes;
  };

  // Restriction type constants.
  skate.type = {
    ATTRIBUTE: TYPE_ATTRIBUTE,
    CLASSNAME: TYPE_CLASSNAME,
    ELEMENT: TYPE_ELEMENT
  };

  // Makes checking the version easy when debugging.
  skate.version = version;

  /**
   * The default options for a definition.
   *
   * @var {Object}
   */
  skate.defaults = {
    // Attribute lifecycle callback or callbacks.
    attributes: undefined,

    // The events to manage the binding and unbinding of during the definition's
    // lifecycle.
    events: undefined,

    // Restricts a particular definition to binding explicitly to an element with
    // a tag name that matches the specified value.
    "extends": undefined,

    // The ID of the definition. This is automatically set in the `skate()`
    // function.
    id: "",

    // Properties and methods to add to each element.
    prototype: {},

    // The attribute name to add after calling the created() callback.
    resolvedAttribute: "resolved",

    // The template to replace the content of the element with.
    template: undefined,

    // The type of bindings to allow.
    type: TYPE_ELEMENT,

    // The attribute name to remove after calling the created() callback.
    unresolvedAttribute: "unresolved"
  };

  // Exporting
  // ---------

  var previousSkate = window.skate;
  skate.noConflict = function () {
    window.skate = previousSkate;
    return skate;
  };

  // Global
  window.skate = skate;

  // ES6
  module.exports = skate;
});