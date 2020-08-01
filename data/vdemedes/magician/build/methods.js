"use strict";

/**
 * Common methods for Image and Preset classes
 */

var Methods = {};

Methods.set = function (key, value) {
  return this.args[key] = value;
};

Methods.get = function (key) {
  return this.args[key];
};

Methods.unset = function (key) {
  delete this.args[key];
};

Methods.format = function (format) {
  this.config.format = format;

  return this;
};

Methods.force = function () {
  this.config.force = true;

  var resize = this.get("-resize");

  if (resize) {
    this.set("-resize", resize + "!");
  }

  return this;
};

Methods.width = function (width) {
  var height = this.config.height || "";

  this.set("-resize", width + "x" + height);
  this.config.width = width;

  if (this.config.force) {
    this.force();
  }

  return this;
};

Methods.height = function (height) {
  var width = this.config.width || "";

  this.set("-resize", width + "x" + height);
  this.config.height = height;

  if (this.config.force) {
    this.force();
  }

  return this;
};

Methods.resize = function (width, height) {
  this.width(width);
  this.height(height);

  return this;
};

Methods.crop = function (x, y, width, height) {
  this.set("-crop", width + "x" + height + "+" + x + "+" + y);
  this.config.crop = [x, y, width, height];

  return this;
};

Methods.background = function (color) {
  this.set("-background", color);

  return this;
};

Methods.gravity = function (gravity) {
  this.set("-gravity", gravity);

  return this;
};

Methods.fit = function (strategy) {
  if (!strategy) {
    strategy = "clip";
  }

  switch (strategy) {
    case "clip":
      this.set("-gravity", this.get("gravity") || "center");
      this.set("-background", this.get("-background") || "white");
      this.set("-extent", this.get("-resize"));
      break;

    case "crop":
      this.set("-gravity", this.get("gravity") || "center");
      this.set("-extent", this.get("-resize"));
      this.unset("-resize");
      break;

    case "scale":
      this.force();
      break;
  }

  return this;
};


/**
 * Expose methods
 */

module.exports = Methods;
