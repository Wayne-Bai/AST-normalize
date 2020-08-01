var Server = require('http-route-proxy');

Server.proxy([
{
    from: 'localhost:3001',
    to: 'github.io',
    route: ['!/']
}
]);