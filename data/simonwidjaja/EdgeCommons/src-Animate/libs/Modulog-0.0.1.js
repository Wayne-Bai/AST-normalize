/**
 * Logger
 * by Simon Widjaja
 **
    Example:

    // Set minimum Log Level
    Log.level = Log.LEVEL_INFO;
    // Setup additional LogTarget (optional)
    Log.addLogTarget(function(msg){
        alert( msg );
    });
    // Do some Logging
    Log.debug("Logger is ready: ", "UserController", $scope);
    Log.info("Logger is ready: ", "UserController", $scope);
    Log.warn("Logger is ready", "UserController");
    Log.error("Ein Error ist aufgetreten");

    Feature Requests:
    - Timestamp
    - Log.performance()
 */

window.ModulogLog = window.ModulogLog || {
    // Version
    $verion: "0.0.1",

    // Constants
    LEVEL_NONE: 0,
    LEVEL_ERROR: 1,
    LEVEL_WARN: 2,
    LEVEL_INFO: 3,
    LEVEL_DEBUG: 4,

    // Configuration
    level: 4, // Default Log level

    // Log Target
    __additionalLogTarget: null,
    addLogTarget:function (loggerCallback) {
        if (typeof loggerCallback === "function") {
            this.__additionalLogTarget = loggerCallback;
        }
    },

    // Methods
    debug: function(msg, group, object) {
        if (this.level >= this.LEVEL_DEBUG && console && console.log) {
            var out = "[ DEBUG " + ((group)?"| "+group+" ":"") +"] " + msg;
            (object) ? console.debug(out, object) : console.debug(out);
            this.__delegate( out, object );
        }
    },
    info: function(msg, group, object) {
        if (this.level >= this.LEVEL_INFO && console && console.log) {
            var out = "[ INFO " + ((group)?"| "+group+" ":"") +"] " + msg;
            (object) ? console.info(out, object) : console.info(out);
            this.__delegate( out, object );
        }
    },
    warn: function(msg, group, object) {
        if (this.level >= this.LEVEL_WARN && console && console.log) {
            var out = "[ WARN " + ((group)?"| "+group+" ":"") +"] " + msg;
            (object) ? console.warn(out, object) : console.warn(out);
            this.__delegate( out, object );
        }
    },
    error: function(msg, group, object) {
        if (this.level >= this.LEVEL_ERROR && console && console.log) {
            var out = "[ ERROR " + ((group)?"| "+group+" ":"") +"] " + msg;
            (object) ? console.error(out, object) : console.error(out);
            this.__delegate( out, object );
        }
    },
    __delegate: function( msg, object) {
        if (this.__additionalLogTarget) {
            (object) ? this.__additionalLogTarget( msg+" : "+object.toString() ) : this.__additionalLogTarget( msg );
        }
    }
};

// Shortcut
window.Log = window.ModulogLog;