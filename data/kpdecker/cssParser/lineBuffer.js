/* See license.txt */
var LineBuffer = function(source) {
    var lines, line, s;

    if (typeof source === 'string') {
        var splits = source.split(/(\r\n|\r|\n|\f)/),
            len = splits.length;
        lines = [];
        for (var i = 0; i < len; i += 2) {
          lines.push(splits[i] + (splits[i+1]||""));
        }
        //print(lines);
    } else {
        lines = source;
    }

    this.__defineGetter__("lineNum", function() { return line; });
    this.__defineSetter__("lineNum", function(val) { line = val; s = lines[line-1]; });
    this.__defineGetter__("line", function() { return s; });
    this.__defineGetter__("length", function() { return lines.length; });
    this.get = function(lineNum) {
        return lines[lineNum];
    };
    this.nextLine = function() {
        if (line >= lines.length) {
            return false;
        }
        s = lines[line];
        line++;
        return true;
    };
    this.reset = function() {
        line = 0;
        s = "";
    };
    
    this.reset();
};
