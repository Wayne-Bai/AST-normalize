function modplug(namespace, options) {
    'use strict';

    // Some references to enhance minification.
    var slice = [].slice;
    var $ = jQuery;
    var extend = $.extend;
    var isFn = $.isFunction;

    // Save the initial settings.
    var settings = extend({}, options);

    // Helper function to apply default methods.
    function applyMethod(obj, args, methodName, methods) {

        // If `methodName` is a function apply it to get the actual
        // method name.
        methodName = isFn(methodName) ? methodName.apply(obj, args) : methodName;

        // If method exists then apply it and return the result ...
        if (isFn(methods[methodName])) {
            return methods[methodName].apply(obj, args);
        }

        // ... otherwise raise an error.
        $.error('Method "' + methodName + '" does not exist on jQuery.' + namespace);
    }

    // This function gets exposed as `$.<namespace>`.
    var statics = function statics() {

        // Try to apply a default method.
        return applyMethod(this, slice.call(arguments), settings.defaultStatic, statics);
    };

    // This function gets exposed as `$(selector).<namespace>`.
    var methods = function methods(method) {

        // If `method` exists then apply it ...
        if (isFn(methods[method])) {
            return methods[method].apply(this, slice.call(arguments, 1));
        }

        // ... otherwise try to apply a default method.
        return applyMethod(this, slice.call(arguments), settings.defaultMethod, methods);
    };

    // Adds/overwrites plugin methods. This function gets exposed as
    // `$.<namespace>.modplug` to make the plugin extendable.
    function plug(options) {

        if (options) {
            extend(statics, options.statics);
            extend(methods, options.methods);
        }

        // Make sure that `$.<namespace>.modplug` points to this function
        // after adding new methods.
        statics.modplug = plug;
    }

    // Save objects or methods previously registered to the desired namespace.
    // They are available via `$.<namespace>.modplug.prev`.
    plug.prev = {
        statics: $[namespace],
        methods: $.fn[namespace]
    };

    // Init the plugin by adding the specified statics and methods.
    plug(options);

    // Register the plugin.
    $[namespace] = statics;
    $.fn[namespace] = methods;
}
