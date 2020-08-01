var restify = require('../../lib');

var srv = restify.createServer();
srv.use(restify.queryParser());
srv.use(restify.jsonp());
srv.get('/', function (req, res, next) {
    res.send({hello: 'world'});
    next();
});

srv.listen(8080, function () {
    console.log('ready on %s', srv.url);
});