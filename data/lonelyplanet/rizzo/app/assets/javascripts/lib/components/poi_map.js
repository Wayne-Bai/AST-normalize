define([
  "jquery",
  "lib/mixins/events",
  "lib/components/map_styles",
  "lib/components/toggle_active",
  "polyfills/function_bind"
], function($, asEventEmitter, mapStyles, ToggleActive) {

  "use strict";

  var
    defaults = {
      el: ".js-poi-map",
      container: ".js-poi-map-container",
      placeholder: ".js-poi-map-placeholder",
      showTooltip: false,
      tooltipSelector: ".js-poi-map-tooltip"
    },
    API_KEY = "AIzaSyBQxopw4OR08VaLVtHaY4XEXWk3dvLSj5k";

  function POIMap(args) {
    this.config = $.extend({}, defaults, args);

    this.$el = $(this.config.el);
    this.$container = this.$el.find(this.config.container);
    this.$placeholder = this.$el.find(this.config.placeholder);

    if (this.$el.length) {
      this._init();
    }
  }

  asEventEmitter.call(POIMap.prototype);

  POIMap.prototype.setupTooltip = function() {
    var _this = this;

    if (this.config.showTooltip) {
      require([ "infobox" ], function(InfoBox) {
        var tooltip = new InfoBox({
          content: $(_this.config.tooltipSelector).html(),
          closeBoxURL: ""
        });
        tooltip.open(_this.map, _this.marker);
        window.google.maps.event.addListener(tooltip, "domready", function() {
          new ToggleActive({
            context: _this.config.container
          });
        });
      });
    }
  };

  // Private

  POIMap.prototype._init = function() {
    if (window.innerWidth < 980)  return;

    this.$placeholder.on({
      "click.poi": this._mouseClickHandler.bind(this),
      "mousemove.preload": this._mouseMoveHandler.bind(this),
      "mouseleave.preload": this._mouseLeaveHandler.bind(this)
    });

    this.$container.on("click.poi mouseenter.poi", this._containerAction.bind(this));
  };

  POIMap.prototype._containerAction = function() {
    if (!this.isOpen && !this.$el.hasClass("is-loading")) {
      this.isOpen = true;
      this.toggle();
    }
  };

  POIMap.prototype._load = function(callback) {
    this.$el.addClass("is-loading");

    this.$placeholder.off(".preload");

    window.mapsCallback = function mapsCallback() {
      this._build();
      window.mapsCallback = undefined;
      callback && callback.call(this);
    }.bind(this);

    this._loadGoogleMaps();
  };

  POIMap.prototype._loadGoogleMaps = function() {
    var script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=" + API_KEY + "&sensor=false&callback=mapsCallback";
    document.body.appendChild(script);
  };

  POIMap.prototype._googleMapsOptions = function() {
    var options = this.$container.data();

    return {
      center: new window.google.maps.LatLng(options.latitude, options.longitude),
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: mapStyles.mapStyles,
      streetViewControl: false,
      mapTypeControl: false,
      zoom: options.zoom,
      panControl: false
    };
  };

  POIMap.prototype._googleMapsMarker = function() {
    var maps = window.google.maps,
        markerStyle = mapStyles.markerStyles("mark", "small");

    return {
      url: mapStyles.markerBackgroundImage,
      size: new maps.Size(markerStyle.size.width, markerStyle.size.height),
      origin: new maps.Point( -markerStyle.position.x, -markerStyle.position.y )
    };
  };

  POIMap.prototype._build = function() {
    var maps = window.google.maps,
        options = this._googleMapsOptions();

    this.map = new maps.Map(this.$container.get(0), options);

    this.marker = new maps.Marker({
      icon: this._googleMapsMarker(),
      position: options.center,
      map: this.map
    });

    this.$el.removeClass("is-loading");
  };

  POIMap.prototype._mouseLeaveHandler = function() {
    clearTimeout(this._hoverIntent);
  };

  POIMap.prototype._mouseMoveHandler = function() {
    clearTimeout(this._hoverIntent);
    this._hoverIntent = setTimeout(this.toggle.bind(this), 500);
  };

  POIMap.prototype._mouseClickHandler = function(e) {
    clearTimeout(this._hoverIntent);
    e.preventDefault();

    this.toggle();
  };

  POIMap.prototype.toggle = function() {
    if (window.google && window.google.maps) {
      this[this.$el.hasClass("is-open") ? "close" : "open"]();
    } else if (!this.$el.hasClass("is-loading")) {
      this._load(this.open);
    }
  };

  POIMap.prototype.open = function() {
    this.$el.removeClass("is-closed").addClass("is-open");
    this.trigger(":map/open");
    this.isOpen = true;
  };

  POIMap.prototype.close = function() {
    this.$el.removeClass("is-open").addClass("is-closed");
    this.trigger(":map/close");
    this.isOpen = false;
  };

  POIMap.prototype.refocus = function() {
    if (!this.map) return;

    window.google.maps.event.trigger(this.map, "resize");
    this.map.panTo(this.marker.getPosition());
  };

  POIMap.prototype.teardown = function() {
    this.$el.removeClass("is-open is-closed is-loading");
    this.$placeholder.off(".poi .preload");

    this.isLoaded = undefined;
  };

  return POIMap;

});
