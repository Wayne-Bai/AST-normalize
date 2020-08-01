(function() {
  var InputManager, exports;
  exports = this;
  InputManager = function() {
    var self;
    this.keyState = [];
    this.keyCurrent = [];
    this.keyLast = [];
    self = this;
    window.addEventListener("keydown", function(ev) {
      self.keyCurrent[ev.which] = true;
      self.keyState[ev.which] = true;
    });
    return window.addEventListener("keyup", function(ev) {
      self.keyState[ev.which] = false;
    });
  };
  InputManager.prototype.update = function() {
    this.keyLast = this.keyCurrent;
    this.keyCurrent = this.keyState.slice(0);
  };
  InputManager.prototype.isKeyDown = function(key) {
    return !!this.keyCurrent[key];
  };
  InputManager.prototype.isKeyTriggered = function(key) {
    return !!this.keyCurrent[key] && !this.keyLast[key];
  };
  InputManager.prototype.isKeyReleased = function(key) {
    return !this.keyCurrent[key] && !!this.keyLast[key];
  };
  exports.InputManager = InputManager;
}).call(this);
