// -------------------------------------------------------------------------- \\
// File: Loader.js                                                            \\
// Module: Loader                                                             \\
// Author: Neil Jenkins                                                       \\
// License: © 2010-2014 FastMail Pty Ltd. MIT Licensed.                       \\
// -------------------------------------------------------------------------- \\

/*global document, setTimeout, XMLHttpRequest, XDomainRequest, localStorage */

"use strict";

( function ( NS, XMLHttpRequest ) {

/*
    Object: O.Loader

    The Loader class handles loading in modules as and when they're
    needed.
*/
var UNREQUESTED = 0,
    LOADING = 1,
    LOADED = 2,
    WILL_EXECUTE = 4,
    EXECUTED = 8;

var ls = localStorage;
var LS_PREFIX = 'OResource-';
var LS_V_PREFIX = 'OResource-v-';

var moduleInfo = {};
var require;

var CORSRequest =
    ( 'withCredentials' in new XMLHttpRequest() ) ? XMLHttpRequest :
    ( typeof XDomainRequest !== 'undefined' ) ? XDomainRequest : null;

var getFile = function ( src, callback ) {
    var xhr = new CORSRequest(),
        send = function () {
            xhr.open( 'GET', src );
            xhr.send();
        },
        wait = 1000;
    xhr.onload = function () {
        xhr.onload = xhr.onerror = null;
        callback( this.responseText );
    };
    xhr.onerror = function () {
        setTimeout( send, wait = Math.min( wait * 2, 32000 ) );
    };
    // IE randomly aborts some requests if these handlers aren't set.
    xhr.onprogress = function () {};
    xhr.ontimeout = function () {};
    setTimeout( send, 0 );
};

// Will the browser execute the scripts in the order they are injected into the
// page?
var inOrderScripts = ( CORSRequest === XMLHttpRequest );

var afterModuleExecute = function ( name ) {
    var info = moduleInfo[ name ],
        callbacks = info.callbacks,
        loader = NS.loader,
        i, l, callback, fn, bind;

    if ( loader.fire ) {
        NS.loader.fire( 'loader:didLoadModule', { module: name } );
    } else if ( NS.meta ) {
        NS.extend( loader, NS.EventTarget );
        afterModuleExecute = afterModuleExecute.invokeInRunLoop();
    }
    info.status = EXECUTED;

    if ( callbacks ) {
        for ( i = 0, l = callbacks.length; i < l; i += 1 ) {
            callback = callbacks[i];
            if ( !( callback.refCount -= 1 ) ) {
                fn = callback.fn;
                bind = callback.bind;
                if ( bind ) {
                    fn.call( bind );
                } else {
                    fn();
                }
            }
        }
    }
    info.callbacks = null;
};

var executeModule = function ( name ) {
    // If inside an event handler from a different context (i.e. an
    // iframe), Opera will sometimes get into a weird internal state
    // if you execute the code immediately, so delay to the next
    // event loop.
    var info = moduleInfo[ name ],
        data = info.data;
    setTimeout( function () {
        NS.execute( data );
        afterModuleExecute( name, info );
    }, 0 );
    info.data = null;
};

var checkAndExecuteModule = function ( name ) {
    var info = moduleInfo[ name ];
    if ( info.status === LOADED ) {
        info.status = (LOADED|WILL_EXECUTE);
        if ( info.dependencies ) {
            require( info.dependencies, function () {
                executeModule( name );
            });
        } else {
             executeModule( name );
        }
    }
};

var moduleDidLoad = function ( name, data ) {
    var info = moduleInfo[ name ],
        currentStatus = info.status;

    info.data = data;
    info.status = LOADED;

    if ( currentStatus & WILL_EXECUTE ) {
        checkAndExecuteModule( name );
    }
};

// Loads text, but does not parse/execute unless executeOnLoad is set.
var load = function ( name, executeOnLoad, force ) {
    var info = moduleInfo[ name ],
        src = info.src,
        status = info.status,
        loader = NS.loader,
        useScriptTag = !CORSRequest || loader.debug,
        dependencies, data, doc, script;

    if ( useScriptTag ) {
        if ( !executeOnLoad ) {
            return;
        }
        if ( !inOrderScripts && !force &&
                ( dependencies = info.dependencies ) ) {
            require( dependencies, function () {
                load( name, executeOnLoad, true );
            });
            return;
        }
    }

    if ( status === UNREQUESTED ) {
        // Set new status
        info.status = executeOnLoad ? (LOADING|WILL_EXECUTE) : LOADING;
        if ( executeOnLoad && loader.fire ) {
            loader.fire( 'loader:willLoadModule', { module: name } );
        }

        // Check local storage for module data
        if ( loader.cacheModules ) {
            try {
                data = ls.getItem( LS_PREFIX + name );
                if ( data ) {
                    if ( ls.getItem( LS_V_PREFIX + name ) === src ) {
                        moduleDidLoad( name, data );
                        return;
                    } else {
                        ls.removeItem( LS_PREFIX + name );
                        ls.removeItem( LS_V_PREFIX + name );
                    }
                }
            } catch ( error ) {}
        }

        // If not found, request.
        if ( useScriptTag ) {
            doc = document;
            script = doc.createElement( 'script' );
            script.type = 'text/javascript';
            script.charset = 'utf-8';
            script.async = false;
            script.onload = script.onreadystatechange = function () {
                var readyState = script.readyState;
                if ( readyState &&
                        readyState !== 'loaded' && readyState !== 'complete' ) {
                    return;
                }
                script.onload = script.onreadystatechange = null;
                script.parentNode.removeChild( script );
                afterModuleExecute( name, info );
            };
            script.src = src;
            doc.documentElement.firstChild.appendChild( script );
        } else {
            getFile( src, function ( response ) {
                var data = response + '\n//# sourceURL=' + src;
                if ( loader.cacheModules ) {
                    try {
                        ls.setItem( LS_V_PREFIX + name, src );
                        ls.setItem( LS_PREFIX + name, data );
                    } catch ( error ) {}
                }
                moduleDidLoad( name, data );
            });
        }
    } else if ( executeOnLoad && !( status & (WILL_EXECUTE|EXECUTED) ) ) {
        if ( loader.fire ) {
            loader.fire( 'loader:willLoadModule', { module: name } );
        }
        if ( status & LOADING ) {
            info.status = (LOADING|WILL_EXECUTE);
        } else {
            checkAndExecuteModule( name );
        }
    }
};

require = function ( modules, fn, bind ) {
    if ( !( modules instanceof Array ) ) {
         modules = [ modules ];
    }

    var allLoaded = true,
        l = modules.length,
        module, info, dependencies, waitObj;

    while ( l-- ) {
        module = modules[l];
        info = moduleInfo[ module ];

        if ( info.status !== EXECUTED ) {
            allLoaded = false;

            // Push callback onto stack for module
            if ( fn ) {
                if ( !waitObj ) {
                    waitObj = {
                        fn: fn,
                        bind: bind,
                        refCount: 0
                    };
                }
                waitObj.refCount += 1;
                if ( !info.callbacks ) {
                    info.callbacks = [];
                }
                info.callbacks.push( waitObj );
            }

            // Load module dependencies
            if ( dependencies = info.dependencies ) {
                require( dependencies );
            }

            // Load this module
            load( module, true );
        }
    }

    // Everything already loaded, synchronously callback the fn.
    if ( allLoaded && fn ) {
        if ( bind ) {
            fn.call( bind );
        } else {
            fn();
        }
    }

    return allLoaded;
};

/*
    Event: loader:willLoadModule

    This event is fired immediately before a new module is requested from
    the server.
*/

/*
    Event: loader:didLoadModule

    This event is fired immediately after a new module finishes
    loading, before any waiting require() functions are called.
*/
NS.loader = {
    debug: false,
    cacheModules: false,
    modules: moduleInfo,
    baseHref: '',

    getFile: getFile,

    register: function ( name, info ) {
        if ( !info.status ) {
            info.status = info.src ? UNREQUESTED : LOADED;
        }
        info.src = this.baseHref + info.src;
        moduleInfo[ name ] = info;
        return this;
    },

    prefetch: function ( name ) {
        var info = moduleInfo[ name ],
            dependencies = info.dependencies,
            l = dependencies ? dependencies.length : 0;
        while ( l-- ) {
            load( dependencies[l] );
        }
        load( name );
        return this;
    },
    // Requires all modules listed.
    // Returns whether loaded.
    // Presuming all dependency chains resolved.
    require: require
};
NS.require = require;

}( this.O || ( this.O = {} ), XMLHttpRequest ) );

/**
    Function: O.execute

    Execute a string as JavaScript code in the global context (an always-global
    `eval`).

    Parameters:
        code - {String} The code to evaluate.

*/
/* jshint ignore:start */
O.execute = ( function ( global ) {
    var isGlobal = function ( original, Object ) {
        try {
            // Indirect eval is our preferred method for execution in the global
            // scope. But we need to check it works correctly in the current
            // engine:
            // 1. Does `Object` resolve to a local variable, or to the global,
            //    built-in `Object` reference?
            // 2. Is the this parameter bound correctly to the global object
            //    when the eval code is strict (Opera bug)?
            return ( ( 1, eval )( 'Object' ) === original ) &&
                ( ( 1, eval )( '"use strict";this' ) === global );
        }
        catch ( error ) {
            // If indirect eval errors out (as allowed per ES3), then just bail
            // out with `false`
            return false;
        }
    }( Object, 1 );

    // Due to a bug in FF3, we can't just make this the O.execute method, as
    // it will incorrectly bind `this` to the `O` object. But if we call it as a
    // function instead of a method, `this` is set to the global object.
    var evaluate = function ( code ) {
        ( 1, eval )( code );
    };

    return isGlobal ? function ( code ) {
        evaluate( code );
    } : window.execScript ? function ( code ) {
        window.execScript( code );
    } : function ( code ) {
        var doc = document,
            head = doc.documentElement.firstChild,
            script = doc.createElement( 'script' );
        script.type = 'text/javascript';
        script.charset = 'utf-8';
        script.text = code;
        head.appendChild( script );
        head.removeChild( script );
    };
}( this ) );
/* jshint ignore:end */
