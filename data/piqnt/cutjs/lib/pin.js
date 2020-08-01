/*
 * CutJS
 * Copyright (c) 2015 Ali Shakiba, Piqnt LLC
 * Available under the MIT license
 * @license
 */

var Cut = require('./core');
var Matrix = require('./util/matrix');

Cut.prototype.init = (function(superfn) {
  return function() {
    this._pin = new Pin(this);
    return superfn;
  };
})();

Cut.prototype.matrix = function() {
  return this._pin
      .absoluteMatrix(this, this._parent ? this._parent._pin : null);
};

Cut.prototype.pin = function(a, b) {
  if (typeof a === 'object') {
    this._pin.set(a);
    return this;

  } else if (typeof a === 'string') {
    if (typeof b === 'undefined') {
      return this._pin.get(a);
    } else {
      this._pin.set(a, b);
      return this;
    }
  } else if (typeof a === 'undefined') {
    return this._pin;
  }
};

function Pin(owner) {

  this._owner = owner;
  this._parent = null;

  // relative to parent
  this._relativeMatrix = new Matrix();

  // relative to root
  this._absoluteMatrix = new Matrix();

  this.reset();
};

Pin.prototype.reset = function() {

  this._textureAlpha = 1;
  this._alpha = 1;

  this._width = 0;
  this._height = 0;

  this._scaleX = 1;
  this._scaleY = 1;
  this._skewX = 0;
  this._skewY = 0;
  this._rotation = 0;

  // scale/skew/rotate center
  this._pivoted = false;
  this._pivotX = null;
  this._pivotY = null;

  // self pin point
  this._handled = false;
  this._handleX = 0;
  this._handleY = 0;

  // parent pin point
  this._aligned = false;
  this._alignX = 0;
  this._alignY = 0;

  // as seen by parent px
  this._offsetX = 0;
  this._offsetY = 0;

  this._boxX = 0;
  this._boxY = 0;
  this._boxWidth = this._width;
  this._boxHeight = this._height;

  // TODO: also set for owner
  this._ts_translate = Cut._TS++;
  this._ts_transform = Cut._TS++;
  this._ts_matrix = Cut._TS++;
};

Pin.prototype.tick = function() {
  this._parent = this._owner._parent && this._owner._parent._pin;

  if (this._handled && this._mo_handle != this._ts_transform) {
    this._mo_handle = this._ts_transform;
    this._ts_translate = Cut._TS++;
  }

  if (this._aligned && this._parent
      && this._mo_align != this._parent._ts_transform) {
    this._mo_align = this._parent._ts_transform;
    this._ts_translate = Cut._TS++;
  }

  return this;
};

Pin.prototype.toString = function() {
  return this._owner.id() + ' ('
      + (this._parent ? this._parent._owner.id() : null) + ')';
};

Pin.prototype.absoluteMatrix = function() {
  var ts = Math.max(this._ts_transform, this._ts_translate,
      this._parent ? this._parent._ts_matrix : 0);
  if (this._mo_abs == ts) {
    return this._absoluteMatrix;
  }
  this._mo_abs = ts;

  var abs = this._absoluteMatrix;
  abs.copyFrom(this.relativeMatrix());

  this._parent && abs.concat(this._parent._absoluteMatrix);

  this._ts_matrix = Cut._TS++;

  return abs;
};

Pin.prototype.relativeMatrix = function() {
  var ts = Math.max(this._ts_transform, this._ts_translate,
      this._parent ? this._parent._ts_transform : 0);
  if (this._mo_rel == ts) {
    return this._relativeMatrix;
  }
  this._mo_rel = ts;

  var rel = this._relativeMatrix;

  rel.identity();
  if (this._pivoted) {
    rel.translate(-this._pivotX * this._width, -this._pivotY * this._height);
  }
  rel.scale(this._scaleX, this._scaleY);
  rel.skew(this._skewX, this._skewY);
  rel.rotate(this._rotation);
  if (this._pivoted) {
    rel.translate(this._pivotX * this._width, this._pivotY * this._height);
  }

  if (this._pivoted) {
    // set handle on origin
    this._boxX = 0;
    this._boxY = 0;
    this._boxWidth = this._width;
    this._boxHeight = this._height;

  } else {
    // set handle on aabb
    var p, q, m = rel;
    if (m.a > 0 && m.c > 0 || m.a < 0 && m.c < 0) {
      p = 0, q = m.a * this._width + m.c * this._height;
    } else {
      p = m.a * this._width, q = m.c * this._height;
    }
    if (p > q) {
      this._boxX = q;
      this._boxWidth = p - q;
    } else {
      this._boxX = p;
      this._boxWidth = q - p;
    }
    if (m.b > 0 && m.d > 0 || m.b < 0 && m.d < 0) {
      p = 0, q = m.b * this._width + m.d * this._height;
    } else {
      p = m.b * this._width, q = m.d * this._height;
    }
    if (p > q) {
      this._boxY = q;
      this._boxHeight = p - q;
    } else {
      this._boxY = p;
      this._boxHeight = q - p;
    }
  }

  this._x = this._offsetX;
  this._y = this._offsetY;

  this._x -= this._boxX + this._handleX * this._boxWidth;
  this._y -= this._boxY + this._handleY * this._boxHeight;

  if (this._aligned && this._parent) {
    this._parent.relativeMatrix();
    this._x += this._alignX * this._parent._width;
    this._y += this._alignY * this._parent._height;
  }

  rel.translate(this._x, this._y);

  return this._relativeMatrix;
};

Pin.prototype.get = function(a) {
  return Pin._get(this, a);
};

// TODO: Use get/set or defineProperty instead?
Pin.prototype.set = function(a, b) {
  if (typeof a === 'string') {
    Pin._set(this, a, b);
  } else if (typeof a === 'object') {
    for (b in a)
      Pin._set(this, b, a[b], a);
  }
  if (this._owner) {
    this._owner._ts_pin = Cut._TS++;
    this._owner.touch();
  }
  return this;
};

Pin._get = function(pin, key) {
  if (typeof (key = Pin._getters[key]) !== 'undefined') {
    return key.call(Pin._getters, pin);
  }
};

Pin._set = function(pin, key, value, all) {
  if (typeof (key = Pin._setters[key]) !== 'undefined'
      && typeof value !== 'undefined') {
    key.call(Pin._setters, pin, value, all);
  }
};

Pin._getters = {
  alpha : function(pin) {
    return pin._alpha;
  },

  textureAlpha : function(pin) {
    return pin._textureAlpha;
  },

  width : function(pin) {
    return pin._width;
  },

  height : function(pin) {
    return pin._height;
  },

  boxWidth : function(pin) {
    return pin._boxWidth;
  },

  boxHeight : function(pin) {
    return pin._boxHeight;
  },

  // scale : function(pin) {
  // },

  scaleX : function(pin) {
    return pin._scaleX;
  },

  scaleY : function(pin) {
    return pin._scaleY;
  },

  // skew : function(pin) {
  // },

  skewX : function(pin) {
    return pin._skewX;
  },

  skewY : function(pin) {
    return pin._skewY;
  },

  rotation : function(pin) {
    return pin._rotation;
  },

  // pivot : function(pin) {
  // },

  pivotX : function(pin) {
    return pin._pivotX;
  },

  pivotY : function(pin) {
    return pin._pivotY;
  },

  // offset : function(pin) {
  // },

  offsetX : function(pin) {
    return pin._offsetX;
  },

  offsetY : function(pin) {
    return pin._offsetY;
  },

  // align : function(pin) {
  // },

  alignX : function(pin) {
    return pin._alignX;
  },

  alignY : function(pin) {
    return pin._alignY;
  },

  // handle : function(pin) {
  // },

  handleX : function(pin) {
    return pin._handleX;
  },

  handleY : function(pin) {
    return pin._handleY;
  }
};

Pin._setters = {
  alpha : function(pin, value) {
    pin._alpha = value;
  },

  textureAlpha : function(pin, value) {
    pin._textureAlpha = value;
  },

  width : function(pin, value) {
    pin._width_ = value;
    pin._width = value;
    pin._ts_transform = Cut._TS++;
  },

  height : function(pin, value) {
    pin._height_ = value;
    pin._height = value;
    pin._ts_transform = Cut._TS++;
  },

  scale : function(pin, value) {
    pin._scaleX = value;
    pin._scaleY = value;
    pin._ts_transform = Cut._TS++;
  },

  scaleX : function(pin, value) {
    pin._scaleX = value;
    pin._ts_transform = Cut._TS++;
  },

  scaleY : function(pin, value) {
    pin._scaleY = value;
    pin._ts_transform = Cut._TS++;
  },

  skew : function(pin, value) {
    pin._skewX = value;
    pin._skewY = value;
    pin._ts_transform = Cut._TS++;
  },

  skewX : function(pin, value) {
    pin._skewX = value;
    pin._ts_transform = Cut._TS++;
  },

  skewY : function(pin, value) {
    pin._skewY = value;
    pin._ts_transform = Cut._TS++;
  },

  rotation : function(pin, value) {
    pin._rotation = value;
    pin._ts_transform = Cut._TS++;
  },

  pivot : function(pin, value) {
    pin._pivotX = value;
    pin._pivotY = value;
    pin._pivoted = true;
    pin._ts_transform = Cut._TS++;
  },

  pivotX : function(pin, value) {
    pin._pivotX = value;
    pin._pivoted = true;
    pin._ts_transform = Cut._TS++;
  },

  pivotY : function(pin, value) {
    pin._pivotY = value;
    pin._pivoted = true;
    pin._ts_transform = Cut._TS++;
  },

  offset : function(pin, value) {
    pin._offsetX = value;
    pin._offsetY = value;
    pin._ts_translate = Cut._TS++;
  },

  offsetX : function(pin, value) {
    pin._offsetX = value;
    pin._ts_translate = Cut._TS++;
  },

  offsetY : function(pin, value) {
    pin._offsetY = value;
    pin._ts_translate = Cut._TS++;
  },

  align : function(pin, value) {
    this.alignX(pin, value);
    this.alignY(pin, value);
  },

  alignX : function(pin, value) {
    pin._alignX = value;
    pin._aligned = true;
    pin._ts_translate = Cut._TS++;

    this.handleX(pin, value);
  },

  alignY : function(pin, value) {
    pin._alignY = value;
    pin._aligned = true;
    pin._ts_translate = Cut._TS++;

    this.handleY(pin, value);
  },

  handle : function(pin, value) {
    this.handleX(pin, value);
    this.handleY(pin, value);
  },

  handleX : function(pin, value) {
    pin._handleX = value;
    pin._handled = true;
    pin._ts_translate = Cut._TS++;
  },

  handleY : function(pin, value) {
    pin._handleY = value;
    pin._handled = true;
    pin._ts_translate = Cut._TS++;
  },

  resizeMode : function(pin, value, all) {
    if (all) {
      if (value == 'in') {
        value = 'in-pad';
      } else if (value == 'out') {
        value = 'out-crop';
      }
      pin._scaleTo(all.resizeWidth, all.resizeHeight, value);
    }
  },

  resizeWidth : function(pin, value, all) {
    if (!all || !all.resizeMode) {
      pin._scaleTo(value, null);
    }
  },

  resizeHeight : function(pin, value, all) {
    if (!all || !all.resizeMode) {
      pin._scaleTo(null, value);
    }
  },

  scaleMode : function(pin, value, all) {
    if (all) {
      pin._scaleTo(all.scaleWidth, all.scaleHeight, value);
    }
  },

  scaleWidth : function(pin, value, all) {
    if (!all || !all.scaleMode) {
      pin._scaleTo(value, null);
    }
  },

  scaleHeight : function(pin, value, all) {
    if (!all || !all.scaleMode) {
      pin._scaleTo(null, value);
    }
  },

  matrix : function(pin, value) {
    this.scaleX(pin, value.a);
    this.skewX(pin, value.c / value.d);
    this.skewY(pin, value.b / value.a);
    this.scaleY(pin, value.d);
    this.offsetX(pin, value.e);
    this.offsetY(pin, value.f);
    this.rotation(pin, 0);
  }
};

Pin.prototype._scaleTo = function(width, height, mode) {
  var w = typeof width === 'number';
  var h = typeof height === 'number';
  var m = typeof mode === 'string';
  var pin = this;
  pin._ts_transform = Cut._TS++;
  if (w) {
    pin._scaleX = width / pin._width_;
    pin._width = pin._width_;
  }
  if (h) {
    pin._scaleY = height / pin._height_;
    pin._height = pin._height_;
  }
  if (w && h && m) {
    if (mode == 'out' || mode == 'out-crop') {
      pin._scaleX = pin._scaleY = Math.max(pin._scaleX, pin._scaleY);
    } else if (mode == 'in' || mode == 'in-pad') {
      pin._scaleX = pin._scaleY = Math.min(pin._scaleX, pin._scaleY);
    }
    if (mode == 'out-crop' || mode == 'in-pad') {
      pin._width = width / pin._scaleX;
      pin._height = height / pin._scaleY;
    }
  }
};

module.exports = Pin;