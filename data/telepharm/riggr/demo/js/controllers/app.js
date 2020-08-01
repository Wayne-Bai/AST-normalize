define([
  'knockout'
], function (ko) {

  var app = {

    // Test observable
    timestamp: ko.observable(+new Date()),

    // Declare libs to utilize
    libs: {
      util: 'util'
    },

    // Route table
    // Format: {route}: {path/to/controller}
    routes: {
      '/': 'pages/one',
      '/two': 'pages/two',
      '/two/:param': 'pages/two',
      //
      '/404': '404'
    },

    // Run when app is loaded
    load: function () {
      console.log('APP LOADED');
      // Example of utilizing a util lib method
      console.log('Exec app-level lib method');
      this.libs.util.utilMethodOne();
    },

    // Before any routes are loaded/processed
    beforeRoute: function (fn) {
      // Notify time on route
      var timeOnPage = + new Date() - this.timeStartRoute;
      // On nav to new route, show time on (prev) route
      if (this.curRoute) {
        console.log('Time on Page:', this.curRoute, document.title, timeOnPage);
      }
      fn(true);
    },

    // On route loaded/changed
    onRoute: function () {
      // Set timestamp observable
      this.timestamp(+new Date());
    }
  };

  return app;

});