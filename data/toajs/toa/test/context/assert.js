'use strict';
// **Github:** https://github.com/toajs/toa
//
// modified from https://github.com/koajs/koa/tree/master/test
//
// **License:** MIT
/*global describe, it, before, after, beforeEach, afterEach*/

/*jshint -W124 */

var assert = require('assert');
var context = require('../context');

describe('ctx.assert(value, status)', function() {
  it('should throw an error', function() {
    var ctx = context();

    try {
      ctx.assert(false, 404);
      throw new Error('asdf');
    } catch (err) {
      assert(err.status === 404);
      assert(err.expose);
    }
  });
});
