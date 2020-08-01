(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("application", function(exports, require, module) {
/*
    Application
    - Main application class

    Responsible for initialization and bridging modules and views.
*/

var Application;

Application = (function() {
  function Application() {}

  Application.prototype.initialize = function() {
    Lungo.init({
      resources: ['templates/asides/side_drawer.html', 'templates/sections/page_two.html']
    });
    this.init_vent();
    this.init_user();
    this.init_views();
    return this.vent.internal.trigger('application_ready');
  };

  /* Initializers*/


  Application.prototype.init_vent = function() {
    var Vent;
    Vent = require('./modules/vent/vent');
    return this.vent = new Vent();
  };

  Application.prototype.init_user = function() {
    var User;
    User = require('./modules/user/user');
    return this.user = new User();
  };

  Application.prototype.init_views = function() {
    var MainView;
    MainView = require('./views/MainView');
    return this.mainview = new MainView();
  };

  return Application;

})();

module.exports = new Application();

});

;require.register("initialize", function(exports, require, module) {
var application;

application = require('application');

$(function() {
  return application.initialize();
});

});

;require.register("modules/user/user", function(exports, require, module) {
/*
	User
    - Maintains all data logic for the user
*/

var User, app;

app = require('../../application');

module.exports = User = (function() {
  function User() {
    this.email = '';
    this.password = '';
    this.first_name = '';
    this.last_name = '';
  }

  /* Functions*/


  User.prototype.fetch_init_data = function() {};

  return User;

})();

});

;require.register("modules/vent/vent", function(exports, require, module) {
/*
	Vent
    - Events wrapper class

	I also usually maintiain socket.io here too if I use it in my backend:

		constructor: () ->
			@external = io.connect('http://localhost:3000')

	This make for a nice, semantic way to handle events:

		app.vent.internal.on('event', 'function')
		app.vent.external.on('event', 'function')
*/

var Vent, app;

app = require('../../application');

module.exports = Vent = (function() {
  function Vent() {
    this.internal = LucidJS.emitter();
  }

  /* Functions*/


  return Vent;

})();

});

;require.register("views/MainView", function(exports, require, module) {
/*
	MainView
    - Handles all view logic for the main view (DOM manipulations, etc)
*/

var MainView, app;

app = require('../application');

module.exports = MainView = (function() {
  function MainView() {
    this.register_events();
  }

  /* Events*/


  MainView.prototype.register_events = function() {
    var _this = this;
    return app.vent.internal.on('application_ready', function() {
      return _this.log('application ready');
    });
  };

  /* Functions*/


  MainView.prototype.log = function(msg) {
    return console.log(msg);
  };

  return MainView;

})();

});

;
//@ sourceMappingURL=app.js.map