( function(exports) {
    var stream = [];
    function push(range, replace) {
        stream.push({range: range, replace: replace});
    }
    
    function show(line, variable, value) {
        stream.push(line, variable + ' = ' + JSON.stringify(value));
    }
    
    function getStream() {
        return stream;
    }
    
    
    // Put our API into export
    exports.push = push;
    exports.getStream = getStream;
    
} (typeof exports === "undefined"? (System = {}) : exports));
