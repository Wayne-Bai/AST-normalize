/*
Ockley 1.0
Copyright 2011,  Matthew Page
licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
*/
var fs = require('fs');
var express = require('./node_modules/express');
var mustachio = require('./node_modules/mustachio');
var utils = require('./utils.js')();
var SFDC_API_VERSION = '21.0';

var sfdcOptions = {
    //Note: ockleydev.* are files that contain private and public keys from remote access setup in Salesforce Org
    //Instructions on setting up remote access: http://wiki.developerforce.com/index.php/Getting_Started_with_the_Force.com_REST_API

    //production
    oAuthPublicKey : process.env.OAuthPublicKey || fs.readFileSync('../ockleydev.public').toString(),
    oAuthPrivateKey : process.env.OAuthPrivateKey || fs.readFileSync('../ockleydev.private').toString(),

    //sandbox
    oAuthPublicSbKey : process.env.OAuthPublicSbKey || fs.readFileSync('../ockleydevsb.public').toString(),
    oAuthPrivateSbKey : process.env.OAuthPrivateSbKey || fs.readFileSync('../ockleydevsb.private').toString(),

    
    oAuthCallbackURI: process.env.OAuthCallbackUri || 'https://localhost:3000/token'
};

var sfdc = require('./sfdc.js')(sfdcOptions);

var app = null;

if ( process.env.PORT == null ) {

    //probably not running on Heroku

    console.log('using local https server...');

	var serverOptions = {
	    //Use cert generation info here: http://www.silassewell.com/blog/2010/06/03/node-js-https-ssl-server-example/
  		key: fs.readFileSync('../privatekey.pem').toString(),
  		cert: fs.readFileSync('../certificate.pem').toString()
	};
    app = module.exports = express.createServer(serverOptions);

}
else{

    app = module.exports = express.createServer();
}

app.configure(function() {
    app.register('.mustache', mustachio);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'mustache');
    app.use(express.bodyParser());
    app.use(express.cookieParser());

    var secretKey = process.env.SESSIONKEY || "SuperSecretSecretSquirrel";
    app.use(express.session({ secret: secretKey}));
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});

function isAuthenticated(req){
    return (req.session && req.session.sfdc && req.session.sfdc.access_token);
}

//merge the passed in object onto the session state
function updateSession(session, state){

    if (!session.hasOwnProperty('sfdc')){
        session.sfdc = {};
    }

    if (state.hasOwnProperty('urls')){
        var urls = state.urls;

        for(var key in urls){
            urls[key] = urls[key].replace('{version}', SFDC_API_VERSION);
        }

        if (urls.hasOwnProperty('metadata')){
            urls.apex = urls.metadata.replace('Soap/m', 'Soap/s');
        }
    }

    utils.extend(session.sfdc, state);
}

function getLastModified(req, res, sObjectTypeName, options){

     sfdc.getSObjectLastModifiedDate(req.session.sfdc.urls.query, req.session.sfdc.access_token,  req.params.id, sObjectTypeName, {
        onSuccess: function(results){
            results = JSON.parse(results);
            if (results && results.records){
                results = results.records;
                if (results.length > 0){
                    results = results[0];
                    if (results.LastModifiedDate){
                        //results = sfdc.sfDateToJsDate(results.LastModifiedDate);
                        results = JSON.stringify(results);
                    }
                }
            }
            //res.send(results, 200);
            if (options.onSuccess){
              options.onSuccess(results);
            }
        },
        onError: options.onError
     });
}

///////////////////////////////////////////////////
//BEGIN ROUTES

app.get('/', function(req, res) {

    res.render("index", {
        title: "Ockley",
        loggedIn: isAuthenticated(req)
    });
});

app.get('/login', function(req, res) {

    res.render("login", {
        title: "Login"
    });
});

app.post('/login', function(req, res) {

    if (req.body == null || req.body.server == null){
        res.send('Missing login server selection', 400);
        return;
    }

    var selectedServer = req.body.server.url;
    var isSandbox = selectedServer === 'test.salesforce.com';
    var url = isSandbox ? sfdc.getOAuthSandboxUrl() : sfdc.getOAuthUrl();

    console.log('Redirecting to login url: ' + url);
    res.redirect(url);
});

app.get('/token/:sandbox?', function(req, res){

    var callbacks = {
        onSuccess: function(response){

            console.log(response);
            updateSession(req.session, response);

            sfdc.getIdentityInfo(response.id, response.access_token, {
                onSuccess: function(identityInfo){

                    updateSession(req.session, identityInfo);

                    //console.log(req.session.sfdc.urls);
                    
                    res.redirect('/editor');
                },
                onError: function(identityErr){

                    console.log('error requesting identity - ' + identityErr);
                    res.send(identityErr, 500);
                }
            });

        },
        onError: function(e){
            console.log('login error - ' + e);
            res.send(e, 500);
        }
    };

    var isSandbox = false;
    if (req.params && req.params.sandbox){
        isSandbox = true;
    }
    console.log('is sandbox == ' + isSandbox);
    sfdc.getOAuthRequestToken( req.url, isSandbox, callbacks );
});


app.del('/logout', function(req, res) {

    console.log('logging out ');
    if (req.session) {
        req.session.sfdc = null;
        req.session.destroy(function() {});
    }
    res.redirect('/');
});

app.get('/editor', function(req, res) {

    if (!isAuthenticated(req)){
        res.redirect("/login");
        return;
    }

    res.render("editor", {
        title: "Editor",
        loggedIn: isAuthenticated(req)
    });
});

//get a specific apex class
app.get('/apex/:id.:format?', function(req, res){

    if (!isAuthenticated(req)){
        res.redirect("/login");
        return;
    }

    if (req.params.format != 'json'){
      res.send('Format not available', 400);
      return;
    }

    sfdc.query(req.session.sfdc.urls.query, req.session.sfdc.access_token, "select Id, Name, Body, LastModifiedDate from ApexClass where id ='" + req.params.id + "' limit 1", {
            
            onSuccess: function(results){
                console.log(results);
                res.send(results, 200);
            },
            onError: function(error){
                console.log('query error: ' + error);
                res.send(error, 500);
            }
    });
});

//get apex classes
app.get('/apex.:format?', function(req, res) {

    if (!isAuthenticated(req)){
        res.redirect("/login");
        return;
    }

    if (req.params.format != 'json'){
        res.send('Format not available', 400);
        return;
    }

    sfdc.query(req.session.sfdc.urls.query, req.session.sfdc.access_token, "select id, name from ApexClass limit 1000", {

            onSuccess: function(results){
                res.send(results, 200);
            },
            onError: function(error){
                console.log('query error: ' + error);
                res.send(error, 500);
            }
    });
});

//save a specific apex page
//warning: this overwrites without checking if something newer exists! You may want to call lastmodified first
app.put('/apex/:id.:format?', function(req, res){

    if (!isAuthenticated(req)){
        res.redirect("/login");
        return;
    }

    if (req.params.format != 'json'){
        res.send('Format not available', 400);
        return;
    }

    if (req.body == null || req.body.content == null){
        res.send('Missing content param', 400);
        return;
    }

    var content = utils.escape(req.body.content);
    
    var callback = {

            onSuccess: function(results){
                res.send(results, 200);
                return;
            },
            onError: function(error){
                console.log('compile error - ' + error);
                res.send(error, 400);
                return;
            }
    };

    var lastModified = null;

    if (req.lastModified != null){

        lastModified = req.lastModified;

        getLastModified(req, res, 'ApexClass', {
            onSuccess: function(results){
                   /* 
                    var now sfdc.dateToJsDate(lastModified);
                    var then = sfdc.dateToJsDate(results.LastModifiedDate);
                    if (now < then){
                        res.send(results, 409);
                        return;
                    }
                    */
                    sfdc.compile(req.session.sfdc.urls.apex, req.session.sfdc.access_token, content, callback );
            },
            onError: callback.onError
        });
    }
    else {
        sfdc.compile(req.session.sfdc.urls.apex, req.session.sfdc.access_token, content, callback );
    }
});

//create a new apex class
app.post('/apex.:format?', function(req, res){

    if (!isAuthenticated(req)){
        res.redirect("/login");
        return;
    }

    if (req.params.format != 'json'){
        res.send('Format not available', 400);
        return;
    }

    if (req.body == null || req.body.name == null){
        res.send('Missing content param', 400);
        return;
    }

    var fileName = req.body.name + '.cls';
    var fileContent = "public with sharing class " + req.body.name + " {\r\n}";
    if (req.body.content != null && req.body.content.length > 0){
        fileContent = req.body.content;
    }
        
    var files = [{
        "name": fileName,
        "content": fileContent,
        "folder": "classes"
    },{
        "name": fileName + "-meta.xml",
        "content": '<?xml version="1.0" encoding="UTF-8"?><ApexClass xmlns="http://soap.sforce.com/2006/04/metadata"><apiVersion>' + SFDC_API_VERSION + '</apiVersion><status>Active</status></ApexClass>',
        "folder": "classes"
    },{
        "name": "package.xml",
        "content": '<?xml version="1.0" encoding="UTF-8"?><Package xmlns="http://soap.sforce.com/2006/04/metadata"><types><members>*</members><name>ApexClass</name></types><version>'+ SFDC_API_VERSION + '</version></Package>',
        "folder":''
    }];

    console.log('deploying apex classes: ');
    console.log(files);

    sfdc.deploy(req.session.sfdc.urls.metadata, req.session.sfdc.access_token, files, {

            onSuccess: function(results){
                console.log(results);
                res.send(results, 200);
            },
            onError: function(error){
                console.log('deploy error - ' + error);
                res.send(error, 500);
            }
    });
});


//get apex class lastmodified datetime stamp
app.get('/apex/lastmodified/:id.:format?', function(req, res){
    
    if (!isAuthenticated(req)){
        res.redirect("/login");
        return;
    }

    if (req.params.format != 'json'){
        res.send('Format not available', 400);
        return;
    }    
  
    getLastModified(req, res, 'ApexClass',  {
        onSuccess: function(results){
            res.send(results, 200);
        },
        onError: function(error){
            res.send(error, 500);
        }
    });
});

app.get('/deploystatus/:id.:format?', function(req, res){

    if (!isAuthenticated(req)){
        res.redirect("/login");
        return;
    }
       if (req.params.format != 'json'){
        res.send('Format not available', 400);
        return;
    }

    sfdc.getDeployStatus(req.session.sfdc.urls.metadata, req.session.sfdc.access_token,  req.params.id, false, {
        onSuccess: function(results){
            res.send(results, 200);
        },
        onError: function(error){
            console.log('deploy status error - ' + error);
            res.send(error, 500);
        }
    });

});

app.get('/deployresult/:id.:format?', function(req, res){

    if (!isAuthenticated(req)){
        res.redirect("/login");
        return;
    }
       if (req.params.format != 'json'){
        res.send('Format not available', 400);
        return;
    }

    sfdc.getDeployStatus(req.session.sfdc.urls.metadata, req.session.sfdc.access_token,  req.params.id, true, {
        onSuccess: function(results){
            res.send(results, 200);
        },
        onError: function(error){
            console.log('deploy result error - ' + error);
            res.send(error, 500);
        }
    });

});

//get a specific vf page
app.get('/vf/:id.:format?', function(req, res){

    if (!isAuthenticated(req)){
        res.redirect("/login");
        return;
    }

    if (req.params.format != 'json'){
      res.send('Format not available', 400);
      return;
    }

    sfdc.query(req.session.sfdc.urls.query, req.session.sfdc.access_token, "select Id, Name, Markup, LastModifiedDate from ApexPage where id ='" + req.params.id + "' limit 1", {

            onSuccess: function(results){
                res.send(results, 200);
            },
            onError: function(error){
                console.log('query error: ' + error);
                res.send(error, 500);
            }
    });
});

//get vf pages
app.get('/vf.:format?', function(req, res) {

    if (!isAuthenticated(req)){
        res.redirect("/login");
        return;
    }

    if (req.params.format != 'json'){
      res.send('Format not available', 400);
      return;
    }

    sfdc.query(req.session.sfdc.urls.query, req.session.sfdc.access_token, "select id, name from ApexPage limit 1000", {
            onSuccess: function(results){
                res.send(results, 200);
            },
            onError: function(error){
                console.log('query error: ' + error);
                res.send(error, 500);
            }
    });
});

//save a specific vf page
//warning: this overwrites without checking if something newer exists! You may want to call lastmodified first
app.put('/vf/:id.:format?', function(req, res){

    if (!isAuthenticated(req)){
        res.redirect("/login");
        return;
    }

    if (req.params.format != 'json'){
        res.send('Format not available', 400);
        return;
    }

    if (req.body == null || req.body.content == null){
        res.send('Missing content param', 400);
        return;
    }

    var markup = req.body.content;

    //TODO - check last modified


    sfdc.update(req.session.sfdc.urls.sobjects, req.session.sfdc.access_token, 'ApexPage',  req.params.id, { Markup:  markup }, {
        onSuccess: function(){
            res.send({}, 200);
            return;
        },
        onError: function(error){
            console.log('update error - ' + error);
            res.send(error, 500);
            return;
        }
    });
});

//create a new Visualforce Page
app.post('/vf.:format?', function(req, res){

    if (!isAuthenticated(req)){
        res.redirect("/login");
        return;
    }

    if (req.params.format != 'json'){
        res.send('Format not available', 400);
        return;
    }

    if (req.body == null || req.body.name == null){
        res.send('Missing content param', 400);
        return;
    }

    var fileName = req.body.name + '.page';
    var fileContent = "<apex:page >\r\n<h1>Congratulations</h1>\r\nThis is your new Page\r\n</apex:page>";
    if (req.body.content != null && req.body.content.length > 0){
        fileContent = req.body.content;
    }

    var files = [{
        "name": fileName,
        "content": fileContent,
        "folder": "pages"
    },{
        "name": fileName + "-meta.xml",
        "content": '<?xml version="1.0" encoding="UTF-8"?><ApexPage xmlns="http://soap.sforce.com/2006/04/metadata"><apiVersion>' + SFDC_API_VERSION + '</apiVersion><label>' +  req.body.name + '</label></ApexPage>',
        "folder": "pages"
    },{
        "name": "package.xml",
        "content": '<?xml version="1.0" encoding="UTF-8"?><Package xmlns="http://soap.sforce.com/2006/04/metadata"><types><members>*</members><name>ApexPage</name></types><version>' + SFDC_API_VERSION + '</version></Package>',
        "folder":''
    }];

    console.log('deploying vf pages: ');
    console.log(files);

    sfdc.deploy(req.session.sfdc.urls.metadata, req.session.sfdc.access_token, files, {

            onSuccess: function(results){
                console.log(results);
                res.send(results, 200);
            },
            onError: function(error){
                console.log('deploy error - ' + error);
                //note: don't return error code here.
                //ui will display returned error message
                res.send(error);
            }
    });

});


//get vf page lastmodified datetime stamp
app.get('/vf/lastmodified/:id.:format?', function(req, res){
 
    if (!isAuthenticated(req)){
        res.redirect("/login");
        return;
    }

    if (req.params.format != 'json'){
        res.send('Format not available', 400);
        return;
    }    
  
    getLastModified(req, res, 'ApexPage', {
        onSuccess: function(results){
            res.send(results, 200);
        },
        onError: function(error){
            res.send(error, 500);
        }
    });
});


app.get('*', function(req, res) {
    console.log('404:' + req.url);
    res.send("Nope", 404);
});


//END ROUTES
///////////////////////////////////////////////////



// Only listen on $ node app.js
if (!module.parent) {
    var port = process.env.PORT || 3000;
    app.listen(port);
    console.log("Express server listening on port %d", app.address().port);
}
