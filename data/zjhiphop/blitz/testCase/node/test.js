var http = require('http');
var sys = require('sys');
var path = require('path');
var url = require('url');
var fs = require('fs');
function pathCheck(p, notExistCallback, res) {
	var contentType=~p.indexOf('.js')?'text/javascript':~p.indexOf('.css')?'text/stylesheet':'text/plain';
    path.exists(p, function(exists) {
        if(exists) {
            fs.readFile(p, 'binary', function(err, file) {
                if(err) {
                    res.writeHead(505, {
                        'Content-Type' : contentType
                    });
                    res.end(err + '\n');
                    return;
                }
                res.writeHead(200);
                console.log(p+' success');
                res.end(file, 'binary');
                return;
            });
        }
        else {
            if(notExistCallback && typeof notExistCallback === 'function') {
                notExistCallback();
            }
        }
    });
}

http.createServer(function(req, res) {
    var uri = url.parse(req.url).pathname;
    var filename = path.join(process.cwd(), uri);
    var index = path.join(process.cwd(), 'index.html');
    pathCheck(filename, function() {
        pathCheck(index, function() {
            res.writeHead(404, {
                'Content-Type' : 'text/plain'
            });
        },res);
    }, res);
}).listen(9999, "10.128.42.132");
console.log('Server running at http://10.128.42.132:9999/');
