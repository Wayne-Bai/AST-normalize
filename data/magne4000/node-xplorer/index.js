var express = require('express'),
    fs = require('fs'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    jade = require('jade'),
    jail = require('jail');

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', { layout: false });
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser("secret"));
    app.use(express.session({ secret: "I iz secret passphrase ! (change me!)" }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

function getPartial(path, args){
    if (path.indexOf('.jade', path.length - 5) === -1){
        path = path + '.jade';
    }
    var tFile = fs.readFileSync('views/' + path, 'utf8');
    var fn = jade.compile(tFile);
    return fn(args);
}

function login(username, password, socket){
    var oJail = new jail.jail(
        {
            username: username,
            password: password
        },
        {
            'cb': function(args) {
                if (!!args.action){
                    if (args.action == 'render'){
                        var sPartial = getPartial('includes/partial/' + args.partial, {files: args.data.files, rootfolder: args.data.filepath});
                        if (args.data.filepath != '/'){
                            socket.send(JSON.stringify({action: 'render', data: [
                                {target: '#arbo [data-filepath="'+args.data.filepath+'"]', html: sPartial, action: 'append'}
                            ]}));
                        }else{
                            socket.send(JSON.stringify({action: 'render', data: [
                                {target: '#arbo', html: sPartial, action: 'append'},
                                {target: '#content', html: '<div id="editor"></div>'}
                            ]}));
                        }
                    }else if(args.action == 'error'){
                        console.log(args);
                    }else{
                        socket.send(JSON.stringify({action: args.action, data: args.data}));
                    }
                }
            },
            'jailedsuccessloginargs': {
                action: 'file read',
                filepath: '/'
            },
            'onsuccesslogin': function(args){
                socket.send(JSON.stringify({action: 'title', data: {title: 'Logged'}}));
            },
            'onfailedlogin': function(){
                socket.send(JSON.stringify({action: 'title', data: {title: 'not logged'}}));
                socket.send(JSON.stringify({action: 'error', data: {message: 'Wrong credentials'}}));
            },
            'onbeforekill': function(){
                var sPartial = getPartial('includes/partial/login', {title: "Login"});
                socket.send(JSON.stringify({action: 'render', data: [
                    {target: '#content', html: sPartial},
                    {target: '#arbo > ul', html: ''}
                ]}));
            },
            'methodsfile': __dirname + '/methods.js'
        }
    );
    socket.set('jail', oJail);
}

function logout(socket){
    socket.get('jail', function (err, oJail){
        if (!!oJail){
            oJail.kill(socket);
        }
    });
}


function performJailedAction(data, socket){
    socket.get('jail', function (err, oJail){
        if (!!oJail){
            oJail.jailed(data);
        }
    });
}

io.set('log level', 1); //No more debug output
io.sockets.on('connection', function (socket) {

    socket.on('disconnect', function (data) {
        logout(socket);
    });

    socket.on('message', function (data) {
        data = JSON.parse(data);
        if(data.action == 'login'){
            login(data.username, data.password, socket);
        }else if (data.action == 'logout'){
            logout(socket);
        }else{
            performJailedAction(data, socket);
        }
    });
});

app.get('/', function(req, res){
    res.render('use', {title: "Login", content: "login"});
});

server.listen(1337);
console.log('Express server started on port %s', 1337);
