var requirejs = require('requirejs');

requirejs.config({
    baseUrl: 'pulsr',
    nodeRequire: require,
    paths: {
        conf: '../conf/conf'
    }
});

requirejs(['conf', 'server'], function(conf, app) {
    var port = conf.get('app.port');

    app.server.listen(port, null);
    console.log('App started on port ' + port);
});
