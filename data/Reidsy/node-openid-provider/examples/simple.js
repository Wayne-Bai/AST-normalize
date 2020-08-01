var HOSTNAME = 'localhost';
var PORT = 3000;
function OPENID_ENDPOINT() {
  return "http://"+HOSTNAME+":"+PORT+"/";
}
function OPENID_USER_ENDPOINT(username) {
  return "http://"+HOSTNAME+":"+PORT+"/"+username.toLowerCase();
}

var express = require('express');
var OpenIDProvider = require('../index.js');

//create new openidprovider
var oidp = new OpenIDProvider(OPENID_ENDPOINT());

//create an express application
var app = express();

//the openid provider middleware requires bodyParser
app.use(express.urlencoded());
app.use(oidp.middleware());

//create an XRDS Document for the server
app.get('/', function(req, res, next) {
  res.header('Content-Type', "application/xrds+xml");
  res.send(oidp.XRDSDocument());
  res.end();
});

//handle authentication
app.post('/', function(req, res, next) {
  if(req.oidp) {
    //here you would perform the login procedure, such as display a login page
    //assuming the user 'Chris' is already logged in, complete the authentication
    var url = oidp.checkid_setup_complete(req.oidp, OPENID_USER_ENDPOINT('Chris'));
    res.redirect(303, url);
    res.end();
  }
  else {
    res.send(400, 'Not an OpenID Request');
    res.end();
  }
});

//create an XRDS Document for a user
app.get('/:username', function(req, res, next) {
  res.header('Content-Type', "application/xrds+xml");
  res.send(oidp.XRDSDocument(OPENID_USER_ENDPOINT(req.params.username)));
  res.end();
});

app.listen(PORT);
console.log("Listening on port "+PORT);
