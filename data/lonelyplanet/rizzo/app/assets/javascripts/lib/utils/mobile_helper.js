define([ "jquery" ], function($) {

  "use strict";

  var defaults = {
    mobileBreakpoint: 500
  };

  function MobileHelper(args) {
    this._init(args);
  }

  MobileHelper.prototype._init = function(args) {
    this.config = $.extend({}, defaults, args);
  };

  MobileHelper.prototype.isMobile = function() {
    return $(window).width() < this.config.mobileBreakpoint;
  };

  return MobileHelper;
});
