//     reflex.js 0.0.1

//     (c) 2014 Eray Arslan
//     reflex may be freely distributed under the MIT license.
//
//     fast || smooth , calculation <3 javascript || node.js

var reflex = function() {
    var params = [];
    for(var i = 0; i < arguments.length; i++) {
        params.push(arguments[i]);
    } var searchResult = reflex.prototype.search(this, params);
    if(searchResult != -1) {
        return reflex.prototype.brain[searchResult].r;
    } var result = this.apply(this, params);
    reflex.prototype.brain.push({
        f : this,
        p : params,
        r : result
    }); return result;
};

reflex.prototype = {
    brain : [],
    equalArray : function(t, d) {
        if(t.length === d.length) {
            for(var i = 0; i < t.length; i++) {
                if(t[i] !== d[i]) {
                    return false;
                }
            }
        } else {
            return false;
        } return true;
    },
    search : function(f, p) {
        for(var i = 0; i < reflex.prototype.brain.length; i++) {
            if(reflex.prototype.brain[i].f === f && reflex.prototype.equalArray(reflex.prototype.brain[i].p, p)) {
                return i;
            }
        } return -1;
    }
};

Function.constructor.prototype.reflex = reflex;