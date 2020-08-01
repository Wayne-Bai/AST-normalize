var mountie = require('../../');
var seaport = require('seaport');

var ports = seaport.createServer({ secret : 'beep boop' });
ports.listen(7000);

var server = mountie(ports);
server.listen(8000);
