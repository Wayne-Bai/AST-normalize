module.exports = {
  $deps: [
    'Route', 'RequestExternal', 'RequestInternal', {
      'x': 'express'
    }
  ],
  $static: {
    $setup: function() {
      return this.$implement(this.$.x.request);
    },
    factory: function(obj) {
      var _ref;
      if (obj == null) {
        obj = {};
      }
      if (!obj['isExternal']) {
        obj['isExternal'] = false;
      }
      if (((_ref = obj.url) != null ? _ref.indexOf('://') : void 0) !== -1) {
        obj.isExternal = true;
      }
      obj.__proto__ = this;
      return obj;
    },
    process: function(routes) {
      var index, params, route;
      if (routes == null) {
        routes = null;
      }
      if (routes == null) {
        routes = this.$.Route.routes;
      }
      for (index in routes) {
        route = routes[index];
        if (params = route.matches(this)) {
          return {
            params: params,
            route: route
          };
        }
      }
      return null;
    },
    execute: function(routes) {
      var ext;
      if (routes == null) {
        routes = null;
      }
      if (ext = this.process(routes)) {
        this.route = ext.route;
        this.isExternal = ext.route.isExternal();
        if (ext.params['directory'] != null) {
          this.directory = ext.params['directory'];
          delete ext.params['directory'];
        }
        if (ext.params['controller'] != null) {
          this.controller = ext.params['controller'];
          delete ext.params['controller'];
        }
        if (ext.params['action'] != null) {
          this.action = ext.params['action'];
          delete ext.params['action'];
        } else {
          this.action = this.$.Route.defaultAction;
        }
        this.params = ext.params;
      }
      if (!ext || !(ext.route instanceof this.$.Route)) {
        throw new Error("Route not found: " + this.path);
      }
      if (this.isExternal) {
        return this.$.RequestExternal.execute(this);
      } else {
        return this.$.RequestInternal.execute(this);
      }
    }
  }
};
