/* global afterEach, beforeEach, describe, expect, it, L, sinon */

describe('L.npmap.control', function() {
  var element, server;

  afterEach(function() {
    element = null;
    server.restore();
  });
  beforeEach(function() {
    element = document.createElement('div');
    server = sinon.fakeServer.create();
  });
  describe('fullscreenControl', function() {
    it('creates a fullscreenControl when option "fullscreenControl: true"', function() {
      var map = L.npmap.map({
        div: element,
        fullscreenControl: true
      });

      expect(map.fullscreenControl).to.be.ok();
    });
    it('does not create a fullscreenControl when option "fullscreenControl: false" or "fullscreenControl: undefined"', function() {
      var map = L.npmap.map({
        div: element
      });

      expect(map.fullscreenControl).to.be(undefined);
    });
  });
  describe('geocoderControl', function() {
    it('creates a geocoderControl when option "geocoderControl: true"', function() {
      var map = L.npmap.map({
        div: element,
        geocoderControl: true
      });

      expect(map.geocoderControl).to.be.ok();
    });
    it('does not create a geocoderControl when option "geocoderControl: false" or "geocoderControl: undefined"', function() {
      var map = L.npmap.map({
        div: element
      });

      expect(map.geocoderControl).to.be(undefined);
    });
  });
  describe('homeControl', function() {
    it('creates a homeControl by default', function() {
      var map = L.npmap.map({
        div: element
      });

      expect(map.homeControl).to.be.ok();
    });
    it('does not create a homeControl when option "homeControl: false"', function() {
      var map = L.npmap.map({
        div: element,
        homeControl: false
      });

      expect(map.homeControl).to.be(undefined);
    });
  });
  describe('overviewControl', function() {
    it('creates an overviewControl when a valid "overviewControl" object is provided', function() {
      var map = L.npmap.map({
        div: element,
        overviewControl: {
          layer: 'mapbox-light'
        }
      });

      expect(map.overviewControl).to.be.ok();
    });
    it('does not create an overviewControl when option "overviewControl: false" or "overviewControl: undefined"', function() {
      var map = L.npmap.map({
        div: element
      });

      expect(map.overviewControl).to.be(undefined);
    });
  });
  describe('scaleControl', function() {
    it('creates a scaleControl when option "scaleControl: true"', function() {
      var map = L.npmap.map({
        div: element,
        scaleControl: true
      });

      expect(map.scaleControl).to.be.ok();
    });
    it('does not create a scaleControl when option "scaleControl: false" or "scaleControl: undefined"', function() {
      var map = L.npmap.map({
        div: element
      });

      expect(map.scaleControl).to.be(undefined);
    });
  });
  describe('smallzoomControl', function() {
    it('creates a smallzoomControl by default', function() {
      var map = L.npmap.map({
        div: element
      });

      expect(map.smallzoomControl).to.be.ok();
    });
    it('does not create a smallzoomControl when option "smallzoomControl: false"', function() {
      var map = L.npmap.map({
        div: element,
        smallzoomControl: false
      });

      expect(map.smallzoomControl).to.be(undefined);
    });
  });
  describe('switcherControl', function() {
    it('creates a switcherControl when more than one baseLayer is present', function() {
      var map = L.npmap.map({
        baseLayers: [
          'esri-imagery',
          'mapbox-terrain'
        ],
        div: element
      });

      expect(map.switcherControl).to.be.ok();
    });
    it('does not create a switcherControl when less than two baseLayers are present', function() {
      var map = L.npmap.map({
        baseLayers: false,
        div: element
      });

      expect(map.switcherControl).to.be(undefined);
    });
  });
});
