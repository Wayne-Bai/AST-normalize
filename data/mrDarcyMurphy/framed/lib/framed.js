
/*!
 * Framed
 * Copyright (c) 2012 Darcy Murphy <darcy.murphy@me.com>
 */

/**
 * Module dependencies.
 */

var stylus = require('stylus')
  , nodes = stylus.nodes
  , utils = stylus.utils

exports = module.exports = plugin;

/**
 * Library version.
 */

exports.version = '0.1.0';

/**
 * Stylus path.
 */

exports.path = __dirname;

/**
 * Return the plugin callback for stylus.
 *
 * @return {Function}
 * @api public
 */

function plugin() {
  return function(style){
    style.include(__dirname);
  }
}
