var express = require('express');
var https = require('https');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var session = require("express-session");
var file = require('./models/file');
var label = require('./models/label');
var user = require('./models/user');
var blog = require('./blog/blog');
var mysql = require('mysql');
var app = express();

var options = {
  key: fs.readFileSync('ssl-dir/matrix.key'),
  cert: fs.readFileSync('ssl-dir/matrix.crt')
};

app.set('port', process.env.PORT || 3000);
app.use(express.bodyParser());
app.use(cookieParser());
app.use(session({secret: 'gunit', key: 'sid'}));
app.use('/admin', express.static(__dirname + '/app'));

var connection = mysql.createConnection({
  host: process.env.DBHOST || 'localhost',
  database: process.env.DB || 'matrix',
  user: process.env.DBUSER || 'root',
  password: process.env.DBPASS || 'root'
});

app.all("/admin/api/*", function(req, res, next) {
  if (!req.session.authenticated) {
      res.json(404, {msg: 'You need to be logged in'});
      return;
  }
  next();
});

app.get('/', function(req, res) {
  blog.index(req, res, connection);
});

app.get('/file/:id', function(req, res) {
  blog.getFile(req, res, connection);
});

app.post('/admin/signup', function(req, res) {
  user.signup(req, res, connection);
});

app.get('/admin/authen', function(req, res) {
  user.authenticate(req, res, connection);
});

app.post('/admin/login', function(req, res) {
  user.login(req, res, connection);
});

app.post('/admin/logout', function(req, res) {
  user.logout(req, res, connection);
});

app.post('/admin/api/files', function(req, res) {
  file.create(req, res, connection);
});

app.get('/admin/api/files', function(req, res) {
  file.findByLabel(req, res, connection);
});

app.get('/admin/api/files/all', function(req, res) {
  file.findAll(req, res, connection);
});

app.get('/admin/api/files/search', function(req, res) {
  file.findByTitle(req, res, connection);
});

app.get('/admin/api/files/:id', function(req, res) {
  file.findById(req, res, connection);
});

app.put('/admin/api/files/:id', function(req, res) {
  file.update(req, res, connection);
});

app.del('/admin/api/files/:id', function(req, res) {
  file.remove(req, res, connection);
});

app.post('/admin/api/labels', function(req, res) {
  label.create(req, res, connection);
});

app.get('/admin/api/labels', function(req, res) {
  label.find(req, res, connection);
});

console.log("Listening to port: " + app.get('port'));
https.createServer(options, app).listen(app.get('port'));
