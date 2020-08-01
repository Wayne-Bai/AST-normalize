/*
 * Dependencies.
 */
var app = require('sayndo');



/*
 * Socket.io
 */
var io = require('socket.io').listen(app.node);

io.sockets.on('connection', function (socket) {
  console.log(socket);
});



/*
 * Routes
 */
app.guest.GET['/'] = function(req, res) {
  res.render('/index.html', {local: 'hello world'});
};

