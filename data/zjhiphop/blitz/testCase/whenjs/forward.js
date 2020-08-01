// Examples of Promises/A forwarding.

// A few simple examples to show how the mechanics of Promises/A
// forwarding works.
// These examples are contrived, of course, and in real usage, promise
// chains will typically be spread across several function calls, or
// even several levels of your application architecture.

var d;
curl(cfg, ['when']).then(function(when) {

    d = when.defer();

    // Resolved promises chain and forward values to next promise
    // The first promise, d.promise, will resolve with the value passed
    // to d.resolve() below.
    // Each call to .then() returns a new promise that will resolve
    // with the return value of the previous handler.  This creates a
    // promise "pipeline".
    d.promise
        .then(function(x) {
        // x will be the value passed to d.resolve() below
        // and returns a *new promise* for x + 1
        return x + 1;
    })
        .then(function(x) {
        // x === 2
        // This handler receives the return value of the
        // previous handler.
        return x + 1;
    })
        .then(function(x) {
        // x === 3
        // This handler receives the return value of the
        // previous handler.
        return x + 1;
    })
        .then(function(x) {
        // x === 4
        // This handler receives the return value of the
        // previous handler.
        log('resolve ' + x);
    });

    d.resolve(1);

    // Rejected promises behave similarly, and also work similarly
    // to try/catch:
    // When you catch an exception, you must rethrow for it to propagate.
    // Similarly, when you handle a rejected promise, to propagate the
    // rejection, "rethrow" it by either returning a rejected promise,
    // or actually throwing (since when.js translates thrown exceptions
    // into rejections)
    d = when.defer();

    d.promise
        .then(function(x) {
        throw x + 1;
    })
        .then(null, function(x) {
        // Propagate the rejection
        throw x + 1;
    })
        .then(null, function(x) {
        // Can also propagate by returning another rejection
        return when.reject(x + 1);
    })
        .then(null, function(x) {
        log('reject ' + x); // 4
    });

    d.resolve(1);

    // Just like try/catch, you can choose to propagate or not.  Mixing
    // resolutions and rejections will still forward handler results
    // in a predictable way.
    d = when.defer();

    d.promise
        .then(function(x) {
        return x + 1;
    })
        .then(function(x) {
        throw x + 1;
    })
        .then(null, function(x) {
        // Handle the rejection, and don't propagate.  This is like
        // catch without a rethrow
        return x + 1;
    })
        .then(function(x) {
        log('mixed ' + x); // 4
    });

    d.resolve(1);

    function log(msg) {
        var p = document.createElement('p');
        p.innerHTML = msg;
        document.body.appendChild(p);
    }

    var srcs = [1, 2, 3, 56, 7];

    function load(src) {
        console.log(arguments);
        var defer = when.defer();
        setTimeout(function() {
            defer.resolve(src + 1);
        }, 1000);
        return defer.promise;
    }

    when.map(srcs, load).then(function(result) {
        console.log("map: " + result);
    });

    function reduce(prev, curr, index, source) {
        if (curr % 2 === 0) return prev + curr;

        var defer = when.defer();
        setTimeout(function() {
            defer.resolve(prev + 1);
        }, 1000);

        return defer.promise;
    }

    when.reduce(srcs, reduce).then(function(result) {
        console.log("reduce :", arguments);
    });


    var a = when.defer();
    var b = when.defer();

    var c = when.defer();
    var d = when.defer();

    when(a.promise, function(v) {
        b.resolve(v + 1);
        console.log("test chain");
    }).then(function() {
        console.log(arguments)
    });
    a.resolve(3);

    // when.chain(c.promise, d.promise, 6).then(function(){console.log(arguments)});
    c.resolve(5);

});