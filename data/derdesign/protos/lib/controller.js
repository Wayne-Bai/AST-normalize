
/* lib/controller.js */

var app = protos.app;

var _ = require('underscore'),
    _s = require('underscore.string'),
    fs = require('fs'),
    util = require('util'),
    mime = require('mime'),
    slice = Array.prototype.slice,
    EventEmitter = require('events').EventEmitter;

var aliases = {};
var aliasRegex = {re1: /Controller$/, re2: /^-/};


/**
  Controller class
  
  @private
  @constructor
  @class Controller
 */

function Controller() {

}

Controller.prototype.authRequired = false;

Controller.prototype.filters = {};

Controller.prototype.httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'TRACE'];

Controller.prototype.routeMethods = [];

var httpMethods = Controller.prototype.httpMethods;

/**
  Routing functions, accept the following parameters:
  
  @param {string} route, route to add
  @param {object} arg2, route validation (optional)
  @param {object} arg3, route validation messages (optional, requires arg2)
  @param {function} arg4, callback to run if route is resolved
 */

function getRouteArgs(m, args) {
  var regex, methods = [m], funcs = [];
  
  // Note: args is the `arguments` object passed from previous function
  args = slice.call(args, 0);
  
  // Get any additional methods defined for route
  while (typeof args.slice(-1).pop() == 'string') {
    // Array.pop() alters the arguments array
    methods.push(args.pop());
  }
  
  // Remove underscore from reserved method worlds (such as delete)
  methods = methods.map(function(val) {
    return val.replace(/^_/, '');
  });

  // Generate regular expression for the route method(s)
  regex = new RegExp('^('+ methods.join('|').toUpperCase() +')$');
  
  // Get route functions
  var f, allowed = [Array, Function];
  while ((f=args.slice(-1).pop())) {
    // Array.pop() alters the arguments array
    if (allowed.indexOf(f.constructor) >= 0) funcs.unshift(args.pop());
    else break;
  }
  
  // Flatten funcs
  funcs = _.flatten(funcs);
  
  // Append route functions array
  args.push(funcs);
  
  return {args: args, regex: regex};

}

for (var i=0; i < httpMethods.length; i++) {

  (function(m) {

    // The 'delete' word is reserved in JavaScript, so a function can't exist
    // with such name. Therefore, an underscore is added before its name, so
    // DELETE routes are called with _delete(...)
    if (m == 'delete') m = '_delete';
    
    routeFunction(m,  function(route, arg2, arg3) {
      // Normal routes use the controller`s authRequired value

      // Define route metadata array
      var o = getRouteArgs(m, arguments);
      var routeArr = [this, o.regex, this.authRequired, route];
      
      // Override first argument with route metadata array
      o.args[0] = routeArr;
      
      // Run registerRoute function with modified arguments
      registerRoute.apply(null, o.args);
    });
    
    routeFunction('public_' + m,  function(route, arg2, arg3) {
      // Note: public routes force authRequired=false
      
      // Define route metadata array
      var o = getRouteArgs(m, arguments);
      var routeArr = [this, o.regex, false, route];
      
      // Override first argument with route metadata array
      o.args[0] = routeArr;
      
      // Run registerRoute function with modified arguments
      registerRoute.apply(null, o.args);
    });
  
    routeFunction('private_' + m,  function(route, arg2, arg3) {
      // private routes force authRequired=true
      
      // Define route metadata array
      var o = getRouteArgs(m, arguments);
      var routeArr = [this, o.regex, true, route];
      
      // Override first argument with route metadata array
      o.args[0] = routeArr;
      
      // Run registerRoute function with modified arguments
      registerRoute.apply(null, o.args);
    });
    
  }).call(this, httpMethods[i].toLowerCase());
  
}

/**
  Returns a controller handler function
  
  @public
  @param {string} handler Handler path to load
  @param {multiple} *args Arguments to pass to the handler function generator
  @return {function} Handler function
 */
 
Controller.prototype.handler = function() {
  var args = slice.call(arguments, 0);
  var handler = args.shift().split(':');
  var name, alias;
  if (handler.length == 2) {
    alias = handler[0];
    handler = handler[1];
  } else {
    name = (this instanceof Function) ? this.name : this.constructor.name;
    alias = Controller.prototype.getAlias(name);
    handler = handler[0];
  }
  if (handler.indexOf('.js') === -1) handler += '.js';
  var handlers = app.handlers;
  if (alias in handlers && handler in handlers[alias]) {
    // Handler function is executed with args and returns route callback
    return handlers[alias][handler].apply(null, args);
  } else {
    throw new Error(util.format("Handler not found: %s/%s", alias, handler));
  }
}

/**
  Adds a custom authentication filter to the  controller.
  
  This method is intended to be used within controllers. It can also be run
  multiple times, to register multiple filters for the same controller.
  
  Note: The context of this method is the constructor itself, not the instance.
  This methods is passed to the constructor prior to instantiation, which is
  why this method works on the constructor`s context.
  
  @static
  @param {function} cb
 */
 
Controller.prototype.filter = function(cb) {
  var ctor = this.name,
      filters = Controller.prototype.filters;

  if (!filters[ctor]) filters[ctor] = [];
  
  filters[ctor].push(cb);
}

/**
  Runs authentication filters for controller
  
  @private
  @param {object} req
  @param {object} res
  @param {object} params
  @param {function} callback
 */

Controller.prototype.runFilters = function(req, res, params, callback) {

  var self = this,
      filters = (req.__skipFilters) ? [] : this.filters,
      fCount = filters.length;
      
  var state = {}; // Request state
  
  // Work with a copy of callback array
  var chain = callback.slice(0);
  
  if (chain.length > 1) {
    req.next = function() {
      var cb = chain.shift();
      if (cb instanceof Function) cb.call(self, req, res, params, state);
    }
  }

  if (fCount === 0) {
    
    // No filters to run, execute callback directly
    chain.shift().call(this, req, res, params, state);
    
  } else {
    
    var retVal, filter, 
        i=-1, 
        promise = new EventEmitter();
    
    // Success event, emitted by filters when authentication is successful
    promise.on('success', function() {
      if (++i == fCount) {
        // No more filters to run, execute callback directly
        chain.shift().call(self, req, res, params, state);
      } else {
        // Run filter
        filter = filters[i];
        filter.call(self, req, res, promise);
      }
    });
    
    // Initially emit the `success` event to run first filter
    promise.emit('success');
  }
}

/**
  Returns a controller by its alias
  
  @param {string} name
  @return {object} Controller instance 
 */

Controller.prototype.getControllerByAlias = function(name) {
  name = name.replace(app.regex.startOrEndSlash, '');
  var spos = name.indexOf('/');
  if (spos > 0) name = name.slice(0, spos);
  return app.controllers[name];
}

/**
  Gets a controller alias
  
  @param {string} Controller Class (optional)
  @return {string}
 */

Controller.prototype.getAlias = function(controllerClass) {
  if (!controllerClass) controllerClass = this.constructor.name;
  if (controllerClass in aliases) {
    return aliases[controllerClass];
  } else {
    var alias = aliases[controllerClass] = _s.dasherize(controllerClass.replace(aliasRegex.re1, '')).replace(aliasRegex.re2, '');
    return alias;
  }
}

/**
  Determines which controller to use for a request URL
  
  @private
  @param {object} urlData
  @param {object} req
  @param {object} res
 */
  
Controller.prototype.exec = function(urlData, req, res) {
  var controller,
      url = urlData.pathname,
      matches = url.match(app.regex.controllerAlias);
  
  if (matches) controller = app.controller.getControllerByAlias(matches[1]);
  controller = (controller || app.controller);
  controller.processRoute.call(controller, urlData, req, res);
}

/**
  Determines which route to use and which callback to call, based on
  the request`s method & pathname.
  
  @private
  @param {object} urlData
  @param {object} res
  @param {object} req
 */

Controller.prototype.processRoute = function(urlData, req, res) {

  var routes = app.routes;
  var main = 'MainController';
  var url = urlData.pathname;
  
  // Set controller on request and response
  req.__controller = res.__controller = this;
  
  // First dispatch the routes in main
  dispatchRoute.call(this, req, res, url, routes[main]);
  
  // Exit function if request handled
  if (req.__handled) return;

  // Iterate every controller
  for (var controller in routes) {
    
    // If controller not main
    if (controller != main) {

      // Dispatch route
      dispatchRoute.call(this, req, res, url, routes[controller]);
      
      // If route already handled, return
      if (req.__handled) return;

    }

  }

  // If it's a GET request
  if (req.method == 'GET') {

    // Sanitize URL before proceeding
    url = url.trim().replace(app.regex.endingSlash, '');

    if (url in app.views.staticAssoc) { // If it's a static view

      // Render static view if found for such url
      renderStaticView.call(this, url, req, res);

    } else if (app.supports.static_server) { // If static server middleware is enabled

      // Serve any static files matching URL (sends  404 response if not found)
      app._serveStaticFile(app.path + "/" + app.paths.public + url, req, res);

    } else {

      // Nothing found
      app.notFound(res);

    }
    
  } else { // Not a GET request
    
    // HTTP/1.1 405 Method Not Allowed
    res.httpMessage(405);
    
  }
    
}

function renderStaticView(url, req, res, loadedSession) {
  
  // NOTE: This is a recursive function
  // NOTE: This function assumes the URL is already a verified static view
  
  var self = this;
  
  if (!loadedSession) {
    
    if (app.supports.session && req.hasCookie(app.session.config.sessCookie)) {
      
      // If sessions supported, load then call again with true
      app.session.loadSession(req, res, function() {
        renderStaticView.call(self, url, req, res, true); // Recursive
      });
      
    } else {
      
      // Sessions not supported, call again with true
      renderStaticView.call(self, url, req, res, true); // Recursive

    }

  } else {
    
    // This clause will run if and only if loadedSession=true
    
    var template = app.views.staticAssoc[url];
    
    var raw = app.views.staticRaw[url];
    var mimeType = app.views.staticMime[url];
    var extOverride = app.views.staticExtOverride[url];
    
    var staticConfig = app.config.staticViews;
    var setEncoding = staticConfig && staticConfig.setEncoding;
    var defaultExtension = staticConfig && staticConfig.defaultExtension;
    
    template = '/' + template;
    
    res.isStaticView = true;
    
    app.emit('static_view', req, res, url);
    
    if (req.__stopRoute === true) return;
    
    if (mimeType) {
      
      var contentType = app.applyFilters('static_view_content_type', mimeType); // Allow apps to change content type
    
      if (contentType === mimeType) { // Content type NOT changed by filter
      
        if (mimeType !== 'application/octet-stream') { // It's not an octet stream, proceed
        
          if (extOverride) { // If it's an extension override
            
            if (setEncoding && setEncoding.test(extOverride)) {
            
              // Override encoding for explicit extensions set in filename, if config.staticViews.setEncoding matches
              contentType += util.format(';charset=%s', app.config.encoding);
              res.setHeader('Content-Type', contentType);
            
            } else  {
            
              // Set encoding as-is, no override
              res.setHeader('Content-Type', contentType);
            
            }
            
          } else { // Not an extension override
            
            if (setEncoding && setEncoding.test(defaultExtension)) {
              
              // Override encoding because default extension matches app.config.staticViews.setEncoding
              contentType += util.format(';charset=%s', app.config.encoding);
              res.setHeader('Content-Type', contentType);
              
            } else {
              
              // Set encoding as-is, no override
              res.setHeader('Content-Type', contentType);
              
            }
            
          }
        
        } else { // It's an octet-stream, set as-is
        
          res.setHeader('Content-Type', mimeType);
        
        }
      
      } else { // Content Type changed by filter, set as-is
      
        res.setHeader('Content-Type', contentType);

      }
      
    }
    
    res.render(template, raw);

  }
}

function registerRoute(route, validation, callback) {
  
  /*
    Route registration happens in 2 iterations:

    1) The routes are added in the Application`s controller (routes are queued) 
    2) On instantiation, the routes are registered
  */
  
  var app = protos.app,
      getAlias = Controller.prototype.getAlias;
  
  var regex, prefix, controller = route[0],
    caller = controller.name,
    method = route[1],
    authRequired = route[2];
    
  route = route[3];
  
  // console.log([controller.name, route, method]);
  
  if (typeof callback == 'undefined') {
    callback = validation;
    validation = {};
  }
  
  // Add first slash
  if ( !app.regex.startsWithSlash.test(route) ) {
    route = "/" + route;
  }
  
  if (caller !== 'MainController') {
    prefix = getAlias(caller);
    route = "/" + prefix + route;
  }
  
  if (app.routes[caller] == null) app.routes[caller] = [];
  if (route !== '/') route = route.replace(app.regex.endingSlash, '');

  if (validation) {
    var rv = new RouteValidator(route, validation);
  }

  var paramKeys = ( validation ) ? Object.keys(validation) : [];
  
  // Exit if regular expression is invalid
  
  if (paramKeys.length > 0) {
    for (var r in validation) {
      var re = validation[r].toString();
      if (validation[r] instanceof RegExp && !protos.regex.validRegex.test(re)) {
        throw new Error(util.format("Bad regular expression in %s [%s], where :%s => %s\n\n\
%s\n", controller.name, route, r, re, protos.i18n.badRegularExpression));
      }
    }
  }
  
  app.routes[caller].push({
    raw: this.raw || false,
    path: route,
    method: method,
    validate: function(path) {
      return rv.validate(path);
    },
    validator: rv,
    validation: validation || {},
    paramKeys: paramKeys,
    authRequired: authRequired,
    callback: function(req, res, params) {
      this.runFilters(req, res, params, callback);
    },
    caller: caller
  });
  
}

function dispatchRoute(req, res, path, routes) {
  
  var self = this;
  var r, route, params;
  var method = req.method;
  
  // Process each route from controller
  for (r in routes) {
    
    route = routes[r];

    if ((params = route.validate(path)) && route.method.test(method)) {
      
      // Set route as handled
      req.__handled = true;

      // Set req.params
      req.params = params;
      
      // Emit controller request
      app.emit('controller_request', req, res, params);
      
      if (req.__stopRoute === true) return; // Stop route if requested by event handler
      
      // Manually handle route
      if (route.raw) {
        
        // Don't run filters
        req.__skipFilters = true;
        
        // Run callback;
        route.callback.call(self, req, res, req.params);
        
      } else if (method == 'POST' || method == 'PUT') {
        
        // Only parse body fields/files if body parser enabled
        if (app.supports.body_parser) {

          // If request exceeded max upload limit, return
          // NOTE: The response is sent by the method itself
          if (req.exceededUploadLimit()) {
            return;
          }
          
          // Parse body data
          req.parseBodyData(function(fields, files) {
            
            // Set requestData
            req.requestData = {
              fields: fields,
              files: files
            };
            
            // Load user session automatically
            if (app.supports.session && route.authRequired) {
              app.session.loadSession(req, res, function() {
                if (req.session.user != null) {
                  // If user logged in, run callback
                  route.callback.call(self, req, res, req.params);
                } else {
                  // User not logged in, remove uploaded files & send to login
                  req.requestData.files.removeAll();
                  app.login(res);
                }
              });
            } else {
              
              // No session to load, run callback
              route.callback.call(self, req, res, req.params);

            }

          });
          
        } else { // Body parser not enabled
          
          // Set requestData
          req.requestData = {
            fields: {},
            files: {}
          };
          
          // Load user session automatically
          if (app.supports.session && route.authRequired) {
            app.session.loadSession(req, res, function() {
              if (req.session.user != null) {
                // If user logged in, run callback
                route.callback.call(self, req, res, req.params);
              } else {
                // User not logged in, send to login
                app.login(res);
              }
            });
          } else {
            // No session to load, run callback
            route.callback.call(self, req, res, req.params);
          }

        }
        
      } else {
        
        // If session set and route required
        if (app.supports.session && route.authRequired) {
          app.session.loadSession(req, res, function() {
            if (req.session.user != null) {
              // Load session and run callback
              route.callback.call(self, req, res, req.params);
            } else {
              // Send user to login screen
              app.login(res);
            }
          });
        } else {
          // Serve route callback normally
          route.callback.call(self, req, res, req.params);
        }
        
      }
      
      // If route matches, break for loop
      break;
      
    }
  }
  
}

function RouteValidator(route, validation) {

  var endingSlash = /\/+$/;
  
  // Validator object, containing functions to validate
  // This validates based on the index of the route path
  // it's more optimal to use a function validation interface,
  // without having the need to check if it's a string or regex
  var validator = {};
  
  // Convert route into array
  route = route.replace(endingSlash, '').split('/').slice(1);
  
  // console.log(route);
  
  this.route = route;
  this.validator = validator;

  // Set match length. This is used to verify if the route checked
  // has the same number of path elements
  var matchLength = route.length;
  
  // Create each of the validator methods
  route.forEach(function(val, i) { 
    
    // Trim route values
    val = val.trim();
    
    // Validate with regex
    // Using val.slice(1) to avoid changing val, which will be used for string matching
    if (val[0] == ':' && ((val.slice(1)) in validation || val.slice(1) in app.regex) ) {

      // Update val
      val = val.slice(1);

      // Get validation regex
      var regex = validation[val];

      switch (typeof regex) {
        case 'string':
          regex = app.regex[regex]; // Use regex from validation object
          break;
        case 'undefined':
          regex = app.regex[val]; // Use value directly from app.regex
          break;
      }
      
      // It's a regex, create validator method
      if (regex instanceof RegExp) {
        validator[i] = (function(re, k) { // new closure, to maintain value
          var fn = function(v, o) {
            if (re.test(v)) {
              o[k] = v; // Set params to be returned when matching
              return true;
            } else {
              return false;
            }
          }
          fn.for = k;
          return fn;
        })(regex, val);
      } else {
        
        // Not a regex, throw error
        throw new Error(util.format("Not an application regex: %s", validation[val]));
      }
    } else {
      // Validate with string
      validator[i] = (function(v) { // new closure, to maintain value
        var fn = function(s) {
          return s == v;
        }
        fn.for = v;
        return fn;
      })(val);
    }
  });
  
  // Validation method
  // Validates a route based on its component. If a route doesn't have the 
  // same components of the path, it's not checked, which results in better performance.
  
  this.validate = function(path) {
    
    path = path.replace(endingSlash, '').split('/').slice(1);
    var len = path.length;
    
    if (len !== matchLength) {
      return null;
    } else {
      var out = {};
      for (var valid=0,i=0; i < len; i++) {
        // console.log([i, path[i], validator[i](path[i], out)]);
        if (validator[i](path[i], out)) valid++;
      }
      if (valid == matchLength) {
        return out;
      } else {
        return null;
      }
    }
  }
  
}

function routeFunction() {
  var args = slice.call(arguments, 0),
      func = args.pop();
  for (var alias,i=0; i < args.length; i++) {
    alias = args[i].replace(/[_]+/, '_');
    Controller.prototype.routeMethods.push(alias);
    Controller[alias] = func;
  }
}

module.exports = Controller;
