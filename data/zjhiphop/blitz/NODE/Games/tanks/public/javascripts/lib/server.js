require.paths.unshift(__dirname + '/../../../../');

var express = require('express'),
    util = require('util'),
    io = require('socket.io'),
    app = express.createServer(),
    io = io.listen(app);

app.listen(8888);

io.sockets.on('connection', function(socket) {
    socket.emit('news', { hello: 'world' });
});