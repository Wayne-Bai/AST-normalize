var express = require('express');
var app = express();

app.get('/', function(req, res) {
	res.sendfile("dist/docs/index.html");
});

app.use("/dist", express.static(__dirname + '/dist'));
app.use("/images", express.static(__dirname + '/dist/images'));

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});