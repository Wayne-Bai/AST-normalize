"use strict";

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var DispatchCoordinator = require("../dispatchCoordinator");

var ActionCreators = (function (_DispatchCoordinator) {
  function ActionCreators(options) {
    _classCallCheck(this, ActionCreators);

    _get(Object.getPrototypeOf(ActionCreators.prototype), "constructor", this).call(this, "ActionCreators", options);
  }

  _inherits(ActionCreators, _DispatchCoordinator);

  return ActionCreators;
})(DispatchCoordinator);

module.exports = ActionCreators;