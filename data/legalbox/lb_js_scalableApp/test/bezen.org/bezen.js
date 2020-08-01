// START OF amd/define.js FOR COMPATIBILITY WITH NON-REQUIREJS PROJECTS

/*
 * Namespace: amd/define
 * Null implementation of CommonJS Asynchronous Module Definition (AMD).
 *
 * This null implementation triggers the callback functions registered with
 * define() immediately or throws an error. It does not load missing modules,
 * and does not wait for the definition of all dependencies to trigger the
 * factory callback at a later time.
 *
 * This null implementation is intended to replace requireJS when optimized
 * scripts are combined into a single file by the optimization tool. It expects
 * that all dependencies will be defined before they are required.
 *
 * When a define() function is already available, which supports CommonJS AMD,
 * this module registers itself. This allows to load this module dynamically
 * for unit tests using requireJS. The existing define() method is preserved.
 *
 * Reference:
 * http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition
 *
 * Author: Eric Bréchemier <contact@legalbox.com>
 *
 * Copyright:
 * Legalbox SAS (c) 2010-2011, All Rights Reserved
 *
 * License:
 * BSD License
 * http://creativecommons.org/licenses/BSD/
 *
 * Version:
 * 2011-07-12
 */

/*global define */
(function(){
  // Builder of
  // Closure for amd/define

  var undef,       // undefined value, do not trust global undefined
      cache = {};  // hash of module id => exports

  function define(){
    // Function: define([id,] [dependencies,] factory)
    // Define a module.
    //
    // Parameters:
    //   id - string, optional identifier of the module.
    //        This must be an absolute id (not starting with '.' or '..').
    //   dependencies - array of strings, optional, defaults to
    //                  ["require", "exports", "module"]. The dependencies ids
    //                  may be relative to the module id if it is specified.
    //   factory - function, callback which will be called at most once, when
    //             all dependencies are available. If truthy, the return value
    //             of the function will be cached and associated with given id,
    //             unless the id is omitted. For each dependency, the cached
    //             value associated with the dependency id is provided as
    //             argument to the factory callback, in the same order.
    //
    // Note:
    // The dependencies "require", "exports" and "module" have a special
    // meaning, and special values are provided for corresponding arguments:
    //   require - function, require(id) returns the cached value associated
    //             with the id, or throws an error if the module is not loaded.
    //             In this null implementation, any module defined without an
    //             id will be considered as missing.
    //   exports - object, an alternate way to define the return value of the
    //             factory function. In this implementation, the exports is
    //             cached instead of the return value of the factory when
    //             the return value is falsy. It is ignored otherwise.
    //   module - object, with a property 'id' set to the value provided in
    //            the call to define. In this null implementation, in case the
    //            id is omitted, the module.id is undefined. The module object
    //            has no 'uri' property.

    var id = undef,
        dependencies = ["require", "exports", "module"],
        factory,
        i,
        length,
        dependencyId,
        args = [],
        exports = {},
        result;

    function fail(message){
      // (private) Function: fail(message)
      // Throw an Error including given message in the description.
      //
      // Parameter:
      //   message - string, message to include in the error description

      throw Error("Failed to load module id '"+id+"': "+message);
    }

    function getAbsoluteId(relativeId){
      // (private) Function: getAbsoluteId(relativeId)
      // Resolve an identifier relative to the module id.
      //
      // Parameter:
      //   relativeId - string, relative or absolute id
      //
      // Returns:
      //   string, the corresponding absolute id

      if (typeof relativeId !== 'string'){
        fail("string id expected for dependency: '"+relativeId+"'");
      }

      if ( relativeId.charAt(0) !== '.' ) { // starts with '.' or '..'
        return relativeId; // already an absolute id
      }

      var absoluteParts, // array, parts of path of the absolute id
          relativeParts, // array, parts of path of the relative id
          i,
          length,
          pathPart;

      // start with parent module id
      if (typeof id !== 'string'){
        absoluteParts = [];
      } else {
        absoluteParts = id.split('/');
        absoluteParts.pop(); // remove the parent module name at the end
      }

      // relative id of the dependency module
      relativeParts = relativeId.split('/');

      for (i=0, length=relativeParts.length; i<length; i++){
        pathPart = relativeParts[i];
        switch(pathPart){
          case ".":
            // skip
            break;
          case "..":
            // pop one level
            absoluteParts.pop();
            break;
          default:
            absoluteParts.push(pathPart);
        }
      }

      return absoluteParts.join('/');
    }

    function require(relativeId){
      // (private) Function: require(relativeId)
      // Get the cached module matching given id, relative to current module id.
      // An error is thrown in case no module has been cached with given id.
      //
      // Parameter:
      //   relativeId - string, identifier of a dependency, relative to the
      //                identifier of the module who received this require
      //                method as argument.
      //
      // Returns:
      //   any, the exports of the module defined with given id

      var absoluteId = getAbsoluteId(relativeId);

      var exports = cache[absoluteId];
      if (exports === undef){
        fail("Module not loaded yet: '"+absoluteId+"'");
      }
      return exports;
    }

    switch(arguments.length){
      case 0:   // define()
        return; // nothing to define
      case 1:   // define(factory)
        factory = arguments[0];
        break;
      case 2:
        if (typeof arguments[0]==='string'){  // define(id,factory)
          id = arguments[0];
        } else {                              // define(dependencies,factory)
          dependencies = arguments[0];
        }
        factory = arguments[1];
        break;
      default: // define(id,dependencies,factory)
        id = arguments[0];
        dependencies = arguments[1];
        factory = arguments[2];
    }

    for (i=0, length=dependencies.length; i<length; i++){
      dependencyId = dependencies[i];
      switch (dependencyId){
        case "require":
          args.push(require);
          break;
        case "exports":
          args.push(exports);
          break;
        case "module":
          args.push({id: id});
          break;
        default:
          args.push( require(dependencyId) );
      }
    }

    try {
      result = factory.apply(null,args);
    } catch(e) {
      fail(e);
    }

    if (id !== undef) {
      cache[id] = result? result : exports;
    }
  }

  if (this.define === undef){     // preserve existing define
    this.define = define;         // set this implementation to global define
    define.amd = {};              // claim support for CommonJS AMD
  } else if (typeof this.define.amd === 'object') {
    this.define(
      "amd/define",
      function(){ // register this implementation for tests
        return define;
      }
    );
  }

}());

// END OF amd/define.js FOR COMPATIBILITY WITH NON-REQUIREJS PROJECTS


/*
 * bezen.js - Root of bezen.org Javascript library
 *
 * author:    Eric Bréchemier <bezen@eric.brechemier.name>
 * license:   Creative Commons Attribution 3.0 Unported
 *            http://creativecommons.org/licenses/by/3.0/
 * version:   based on 2010-01-14
 */

// Modifications Copyright 2010-2011 Legalbox SAS, All Rights Reserved
// Licensed under the BSD License - http://creativecommons.org/licenses/BSD/
// * updated module pattern for use with requireJS

/*jslint nomen:false, white:false, onevar:false, plusplus:false */
/*global define, window, bezen, document */
define(
  "bezen.org/bezen",
  function() {

    var nix = function(){  
      // an empty function that does nothing
      // declared here to be reused as a constant where needed, instead
      // of creating a new similar-looking function in many places
    };
     
    var $ = function(id) {
      // The classic shortcut for getElementById(), in its simplest form.
      // Note: nothing fancy here, this is just an alias for getElementById.
      //
      // param:
      //   id - (string) a DOM element identifier
      //
      // return: (DOM node) (null)
      //   same result as document.getElementById
       
      return document.getElementById(id);
    };

    var bezen = {
      // public API
      $: $,
      nix: nix,
      _: { // private section, for unit tests
      }
    }

    // initialize global variable bezen in browser environment,
    // for backward-compatibility
    if (window){
      // preserve the library, if already loaded
      window.bezen = window.bezen || bezen;
    }

    return bezen;
  }
);
