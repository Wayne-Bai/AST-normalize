/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
BrowserID.Modules.XHRDelay = (function() {
  "use strict";

  var bid = BrowserID,
      wait = bid.Wait,
      delayed,
      sc;

  function delayStart(event, request) {
    /*jshint validthis:true*/
    delayed = true;

    var networkInfo; 
    if (request) {
      networkInfo = request.network;
    }

    var info = {
      id: wait.slowXHR.id,
      message: wait.slowXHR.message,
      title: wait.slowXHR.title,
      network: networkInfo
    };
    
    this.renderDelay("load", info);
  }

  function delayStop() {
    /*jshint validthis:true*/
    if(delayed) {
      delayed = false;
      this.hideDelay();
    }
  }

  var Module = bid.Modules.PageModule.extend({
    start: function(options) {
      var self=this;

      self.subscribe("xhr_delay", delayStart);
      self.subscribe("xhr_complete", delayStop);

      sc.start.call(self, options);
    },

    stop: function() {
      this.hideDelay();
      sc.stop.call(this);
    }
  });

  sc = Module.sc;

  return Module;

}());

