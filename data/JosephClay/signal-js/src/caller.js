// functionally abstracting the calls
// to the function. this will net us
// better gains when looping through
// multiple namespaces and simplifies
// logic for calling the event.
// 
// this is slower than event-emitter,
// but ee doesn't have to worry about
// namespaces, so they can do it a
// little differently

var apply = function(args) {
    return function(fn) {
        return fn.apply(null, args);
    };
};

var noArgs = function(fn) {
    return fn.call();
};

var callers = {
    1: function(args) {
        var one = args[0];
        return function(fn) {
            return fn.call(null, one);
        };
    },
    2: function(args) {
        var one = args[0],
            two = args[1];
        return function(fn) {
            return fn.call(null, one, two);
        };
    },
    3: function(args) {
        var one = args[0],
            two = args[1],
            three = args[2];
        return function(fn) {
            return fn.call(null, one, two, three);
        };
    }
};

module.exports = {
    create: function(args) {
        var length = args.length,
            caller = callers[length] || apply;
        return caller(args);
    },
    
    noArgs: noArgs,

    run: function(events, call) {
        var idx = 0, length = events.length,
            evt;
        for (; idx < length; idx += 1) {
            evt = events[idx];
            if (!evt) { continue; }
            if (call(evt) === false) { return; }
        }
    }
};