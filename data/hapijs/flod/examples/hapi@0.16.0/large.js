var Flod = require('../../'); // require('flod') if not run from this repo
var Fs = require('fs');
var Hapi = require('hapi');

var server = new Hapi.Server(process.env.port || 3000);
var probe = new Flod.Probe(server, {server: 'hapi', version: '0.16.0'});

var ROUTE_TABLE_LENGTH = process.env.ROUTE_TABLE_LENGTH || 1000;

var createRoute = function (i) {

    return {
        method: 'GET',
        path: '/' + i,
        config: {
            validate: {
                query: true,
                payload: true
            },
            handler: function (request) {

                request.reply('Hello World.');
            }
        }
    };
};
server.addRoute(createRoute("")); // root handler

var c = 0;
while (c < ROUTE_TABLE_LENGTH) {
    server.addRoute(createRoute(c));
    ++c;
}


server.start(function(){
    console.log(server)
    console.log('server started on port ' + server.settings.port);
});