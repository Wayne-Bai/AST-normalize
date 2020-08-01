
module.exports = function(server) {

  var io = require('socket.io').listen(server);
  io.attach(server);
  require('./socket').init(io);

};