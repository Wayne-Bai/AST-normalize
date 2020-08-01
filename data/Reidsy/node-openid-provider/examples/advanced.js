var HOSTNAME = 'localhost';
var PORT = 3000;
function OPENID_ENDPOINT() {
  return "http://"+HOSTNAME+":"+PORT+"/login";
}
function OPENID_USER_ENDPOINT(username) {
  return "http://"+HOSTNAME+":"+PORT+"/users/"+username.toLowerCase();
}

var express = require('express');
var OpenIDProvider = require('../index.js');

//create new openidprovider
var oidp = new OpenIDProvider(OPENID_ENDPOINT(), {
  association_expires: 60,
  checkid_params: 'oidp'
});
//create new express app
var app = express();
app.use(express.cookieParser());
app.use(express.urlencoded());
app.use('/login', oidp.middleware());

//home page handler
app.get('/', function(req, res, next) {
  res.header('Content-Type', 'text/html');
  res.end('<!DOCTYPE html>\n'
        + '<html>\n'
        + ' <head>\n'
        + '   <title>OpenID Provider</title>\n'
        + '   <link rel="openid2.provider" href="' + OPENID_ENDPOINT() + '">\n' //this line is important. It tells the openid consumer where to find the provider.
        + ' </head>\n'
        + ' <body>\n'
        + '   <h1>Homepage for the openid provider</h1>\n'
        + '   <p>By specifying the link "openid2.provider" in the head section, an openid consumer can find the provider from the root of a website</p>\n'
        + ' </body>\n'
        + '</html>\n');
});

//openid login handler
app.all('/login', function(req, res, next) {
  //the user is trying to log in
  if(req.body.username && req.cookies.oidpSession) {
    res.clearCookie('oidpSession');
    var username = req.body.username || req.query.username
    var oidpSession = JSON.parse(req.cookies.oidpSession); //use the stored info to create a url which the user will use to return to the openid consumer
    res.redirect(303, oidp.checkid_setup_complete(oidpSession, OPENID_USER_ENDPOINT(username)));
    res.end();
    return;
  }
  //an openid request was made
  if(req.oidp) {
    //The user is not logged in so we need to store the openid information until a user has logged in.
    //this info could instead be stored in a session.
    res.cookie('oidpSession', JSON.stringify(req.oidp), {
      expires: new Date(Date.now() + 2*60*1000),
      path: '/'
    });
  }
  //and show the standard user login page
  res.header('Content-Type', 'text/html');
  res.end('<!DOCTYPE html>\n'
        + '<html>\n'
        + ' <head>\n'
        + '   <title>OpenID Provider | Login</title>\n'
        + '   <link rel="openid2.provider" href="' + OPENID_ENDPOINT() + '">\n' //this line is important. It tells the openid consumer where to find the provider.
        + ' </head>\n'
        + ' <body>\n'
        + '   <h1>Login to node-openid-provider</h1>\n'
        + '   <form method="post">\n'
        + '     <input type="text" name="username" value="Chris">\n'
        + '     <button type="submit">Login</button>\n'
        + '   </form>\n'
        + ' </body>\n'
        + '</html>\n');
});

//user page handler
app.get('/users/:username', function(req, res, next) {
  res.header('Content-Type', 'text/html');
  res.end('<!DOCTYPE html>\n'
        + '<html>\n'
        + ' <head>\n'
        + '   <title>OpenID Provider | User Page</title>\n'
        + '   <link rel="openid2.provider" href="' + OPENID_ENDPOINT() + '">\n' //this line is important. It tells the openid consumer where to find the provider.
        + '   <link rel="openid2.local_id" href="' + OPENID_USER_ENDPOINT(req.params.username) + '">\n' //this line is used in the openid authentication confirmation process.
        + ' </head>\n'
        + ' <body>\n'
        + '   <h1>User page for the openid provider</h1>\n'
        + '   <p>By specifying the link "openid2.local_id" in the head section, an openid consumer can find the provider and automatically determine which user wants to authenticate</p>\n'
        + ' </body>\n'
        + '</html>\n');
});

app.listen(PORT);
console.log("Listening on port " + PORT);
