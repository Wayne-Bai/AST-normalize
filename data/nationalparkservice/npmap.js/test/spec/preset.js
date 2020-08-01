/* global afterEach, beforeEach, describe, expect, it, L, sinon */

describe('L.npmap.preset', function() {
  var element,
    server;

  afterEach(function() {
    element = null;
    server.restore();
  });
  beforeEach(function() {
    element = document.createElement('div');
    server = sinon.fakeServer.create();
  });
});
