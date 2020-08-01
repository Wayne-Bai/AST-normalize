(function(root, Library) {
    // The square bracket notation is used to avoid property munging by the
    // Closure Compiler.
    if( typeof define == "function" && typeof define["amd"] == "object" && define["amd"]) {
        // Export for asynchronous module loaders (e.g., RequireJS, `curl.js`).
        define(["exports"], Library);
    }
    else {
        // Export for CommonJS environments, web browsers, and JavaScript
        // engines.
        Library = Library( typeof exports == "object" && exports || (root["Library"] = {
            "noConflict" : (function(original) {
                function noConflict() {
                    root["Library"] = original;
                    // `noConflict` can't be invoked more than once.
                    delete Library.noConflict;
                    return Library;
                }

                return noConflict;
            })(root["Library"])
        }));
    }
})(this, function(exports) {
    // module code here
    return exports;
});
