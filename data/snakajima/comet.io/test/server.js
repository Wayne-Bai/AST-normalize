var app = require('http').createServer(handler);
var file = new(require('node-static').Server)(__dirname + '/web', {});
var comet = require('../lib/comet.io.js').createServer();

app.listen(8000);
function handler(request, response) {
  request.on('end', function() {
    if (!comet.serve(request, response)) {
      file.serve(request, response, function(err, res) {
        //if (err) { console.log(err); }
      });
    } 
  });
}


comet.on('connection', function (socket) {
  console.log('connected...patient');
  var total_time = 0;
  var start_time = new Date();
  socket.emit('test.message', { count:0 });
  socket.on('test.response', function(data) {
    total_time += new Date() - start_time;
    if (data.count++ < 100) {
      setTimeout(function() {
        start_time = new Date();
        socket.emit('test.message', { count:data.count });
      }, 10);
    } else {
      console.log('success', total_time);
    }
  });
});

console.log('Access http://localhost:8000 with your browser to run test.');