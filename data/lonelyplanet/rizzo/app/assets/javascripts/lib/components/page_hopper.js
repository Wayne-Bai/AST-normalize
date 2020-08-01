// ------------------------------------------------------------------------------
//
// Page Hopper
//
// ------------------------------------------------------------------------------

define([
  "jquery",
  "autocomplete",
  "lib/components/lightbox"
], function($, AutoComplete, LightBox) {

  "use strict";

  var config = {
        autocompleteInputClass: "js-autocomplete-page-hopper",
        listener: "body"
      },
      lightbox, _this;

  function PageHopper(args) {
    $.extend(config, args);

    this.$listener = $(config.listener);
    this.init();
  }

  PageHopper.prototype.init = function() {
    _this = this;

    lightbox = new LightBox({
      customClass: "lightbox--page-hopper",
      $el: "body",
    });

    this.listen();
  };

  // -------------------------------------------------------------------------
  // Subscribe to Events
  // -------------------------------------------------------------------------

  PageHopper.prototype.listen = function() {

    _this.$listener.on("keydown", function(e) {
      if ($("." + config.lightboxClass).is(":visible")) { return; }

      // 75 = k
      if ( e.keyCode == 75 && (e.metaKey || e.ctrlKey) ) {
        _this.$listener.trigger(":lightbox/open", {
          listener: this.$el,
          opener: e.currentTarget,
          target: this.$lightboxWrapper
        });
        e.preventDefault();
      }
    });

    _this.$listener.on(":lightbox/open", function(event, data) {
      if (data.customClass == config.lightboxClass) {
        _this.$listener.trigger(
          ":lightbox/renderContent",
            "<input class='input page-hopper__input card--page__header copy--feature " +
            config.autocompleteInputClass + "' type='text'>"
        );
      }
      _this.$listener.addClass("page-hopper--open");
    });

    _this.$listener.on(":lightbox/is-closed", function() {
      _this.$listener.removeClass("page-hopper--open");
    });

    _this.$listener.on(":lightbox/contentReady", _this._setupAutocomplete);

  };

  // -------------------------------------------------------------------------
  // Private Functions
  // -------------------------------------------------------------------------

  PageHopper.prototype._filterSections = function(searchTerm, callback) {
    var regex = new RegExp(searchTerm, "gim"),
        results = window.lp.pageHopper.sections.filter(function(current) {
          return regex.test(current.title);
        });

    callback(results);
  };

  PageHopper.prototype._setupAutocomplete = function() {
    new AutoComplete({
      el: "." + config.autocompleteInputClass,
      fetch: _this._filterSections,
      onItem: function(el) {
        location.href = $(el).data("value");
      },
      threshold: 2,
      limit: 4,
      templates: {
        item: "<div class='copy--feature'>{{title}}</div>",
        value: "{{slug}}",
        empty: "<div class='copy--feature'>No matches found</div>"
      },
      extraClasses: {
        wrapper: "page-hopper"
      }
    });

    $("." + config.autocompleteInputClass).focus();
  };

  return PageHopper;
});
