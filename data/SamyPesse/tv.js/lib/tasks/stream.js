// Requires
//var request = require('request');
var http = require('http');
var encode = require('../encode');


function errorHandler(data) {
    console.log('converter stderr: ' + data);
}


function streamGet(req, res) {
    var format = encode.formats.ogv;
    var url = req.player.streamUrl();

    var dead = false;
    var ffmpeg = encode.encoderStream(format, function(code) {
        dead = true;
        console.log('Finished converting with code =', code);
        res.end();
    });

    var vreq = http.request(url, function(vres) {
        // Write header
        res.writeHead(200, {'Content-Type': format.mime});

        // Debugging
        ffmpeg.stderr.pipe(process.stderr);

        // Pipe ffmpeg's results to http response
        ffmpeg.stdout.pipe(res);

        // Pipe video to ffmpeg
        vres.pipe(ffmpeg.stdin);
    });

    vreq.on('error', function(err) {
        return res.send(err.toString());
    });

    res.on('end', function() {
        if(dead) return;
        ffmpeg.kill();
    });

    vreq.end();
}


// Just return length and other info
// No need to convert here
// since there is no content obviously
function streamHead(req, res) {
    var url = req.player.streamUrl();
    request.head(url).pipe(res);
}


// Exports
exports.streamGet = streamGet;
exports.streamHead = streamHead;
