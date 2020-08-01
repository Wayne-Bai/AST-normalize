var smtp = require('../');
var test = require('tap').test;
var through = require('through');

var seq = require('seq');
var fs = require('fs');

test('bad sequence', function (t) {
    t.plan(8);
    
    var port = Math.floor(Math.random() * 5e4 + 1e4);
    var server = smtp.createServer('localhost', function (req) {
        req.on('to', function (to, ack) {
            var domain = to.split('@')[1];
            if (domain === 'localhost') ack.accept()
            else ack.reject(553, [
                'Recipients must be on these domains:',
                'localhost',
            ])
        });
        
        req.on('message', function (stream, ack) {
            t.equal(req.from, 'beep@localhost');
            t.deepEqual(req.to, [ 'boop@localhost' ]);
            
            var data = '';
            stream.on('data', function (buf) { data += buf });
            stream.on('end', function () {
                t.equal(data, 'Beep boop.\r\n...I am a computer.\r\n');
            });
            ack.accept();
        });
        
        req.on('quit', function () {
            t.ok(true);
        });
    });
    server.listen(port, function () {
        var script = '';
        var c = smtp.connect(port, sendData.bind(null, t));
        
        var _write = c.write;
        c.write = function (buf) {
            script += buf;
            _write.apply(c, arguments);
        };
        
        c.on('data', function (buf) { script += buf });
        
        c.on('end', function () {
            t.equal(script, [
                '220 localhost',
                'HELO localhost',
                '250 localhost',
                'MAIL FROM: <beep@localhost>',
                '250 OK',
                'DATA',
                '503 Bad sequence: RCPT expected',
                'RCPT TO: <boop@localhost>',
                '250 OK',
                'DATA',
                '354 OK',
                'Beep boop.',
                '....I am a computer.',
                '.',
                '250 OK',
                'QUIT',
                '221 Bye!',
                ''
            ].join('\r\n'));
            t.end();
            server.close();
        });
    });
});

function sendData (t, mail) {
    seq()
        .seq_(function (next) {
            mail.on('greeting', function (code, lines) {
                next();
            });
        })
        .seq(function (next) {
            mail.helo('localhost', this);
        })
        .seq(function () {
            mail.from('beep@localhost', this);
        })
        .seq_(function (next) {
            mail.data(function (err, code, lines) {
                t.ok(!err);
                t.equal(code, 503);
                t.equal(lines.join(''), 'Bad sequence: RCPT expected');
                next();
            })
        })
        .seq(function () {
            mail.to('boop@localhost', this.ok);
        })
        .seq(function () {
            mail.data(this)
        })
        .seq(function () {
            var m = mail.message(this);
            setTimeout(function () {
                m.write('Beep boop.\r\n');
            }, 10);
            setTimeout(function () {
                m.end('...I am a computer.');
            }, 20);
        })
        .seq(function () {
            mail.quit(this);
        })
    ;
}
