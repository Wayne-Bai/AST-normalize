var parser = require('./parser.js');
var writer = require('../write.js');
var through = require('through');
var os = require('os');
var EventEmitter = require('events').EventEmitter;
var undot = require('../dot.js').undot;

module.exports = function (opts, stream) {
    if (stream === undefined) {
        stream = opts;
        opts = {};
    }
    if (!opts) opts = {};
    
    var p = parser(stream);
    var write = writer(stream);
    write(220, opts.domain || os.hostname());
    
    function createAck (cb, okCode, raw) {
        return {
            accept : function (code, msg) {
                write(code, msg || "OK", okCode || 250);
                if (cb) cb();
                if (!raw) next();
            },
            reject : function (code, msg) {
                write(code, msg, 500);
                next();
            }
        };
    }
    
    function emit (name, x) {
        var fn = arguments[arguments.length - 1];
        var ack = arguments[arguments.length - 1] = createAck(fn);
        if (req.listeners(name).length === 0) {
            if (name === 'greeting' && x.greeting === 'ehlo') {
                ack.accept(250, [ x.hostname || remoteIp, 'STARTTLS' ]);
            }
            else if (name === 'greeting') {
                ack.accept(250, x.hostname);
            }
            else ack.accept();
        }
        req.emit.apply(req, arguments);
    }
    
    var req = new EventEmitter;
    req._swapStream = function (s) {
        write = writer(s);
        p = parser(s);
        stream = s;
        s.on('error', req.emit.bind(req, 'error'));
        next();
    };
    
    stream.on('error', req.emit.bind(req, 'error'));
    req.socket = stream;
    var remoteIp = stream.remoteAddress || 'unknown';
    
    var next = (function next () {
        p.getCommand(function (err, cmd) {
            if (err) {
                if (err.code) write(err.code, err.message || err.toString())
                else write(501, err.message || err.toString())
                return next();
            }
            var prevented = false;
            req.emit('command', cmd, {
                preventDefault: function () { prevented = true },
                write: write,
                next: next
            });
            if (prevented) return;
            
            if (cmd.name === 'quit') {
                write(221, 'Bye!');
                req.emit('quit');
                stream.end();
            }
            else if (cmd.name === 'rset') {
                write(250);
                req.to = undefined;
                req.from = undefined;
                req.emit('rset');
                next();
            }
            else if (!req.greeting) {
                if (cmd.name === 'greeting') {
                    emit('greeting', cmd, function () {
                        req.greeting = cmd.greeting;
                        req.hostname = cmd.hostname;
                    });
                }
                else {
                    write(503, 'Bad sequence: HELO, EHLO, or LHLO expected.');
                    next();
                }
            }
            else if (cmd.name === 'mail') {
                emit('from', cmd.from, function () {
                    req.fromExt = cmd.ext;
                    req.from = cmd.from;
                });
            }
            else if (cmd.name === 'rcpt') {
                emit('to', cmd.to, function () {
                    if (req.toExt == undefined) {
                        req.toExt = [];
                    }
                    req.toExt.push(cmd.ext);
                    if (req.to == undefined) {
                        req.to = [];
                    }
                    req.to.push(cmd.to);

                });
            }
            else if (cmd.name === 'data') {
                if (!req.from) {
                    write(503, 'Bad sequence: MAIL expected');
                    next();
                }
                else if (!req.to) {
                    write(503, 'Bad sequence: RCPT expected');
                    next();
                }
                else {
                    var target = makeTarget(write, next, emit);
                    var messageAck = createAck(function () {
                        p.getUntil('.', undot(target));
                    }, 354, true);
                    req.emit('message', target, messageAck);
                }
            }
            else if (cmd.name === 'starttls') {
                req.emit('_tlsNext', write, next);
                req.greeting = null;
            }
            else if (cmd.recognized === false) {
                write(500, 'Unrecognized command.');
                next();
            }
            else {
                write(502, 'Not implemented.');
                next();
            }
        });
        
        return next;
    })();
    
    return req;
};

function makeTarget (write, next, emit) {
    var target = through(write, end);
    target.aborted = false;
    
    target.abort = function (code, msg) {
        if (!msg && typeof code !== 'number') {
            msg = code;
            code = undefined;
        }
        if (code === undefined) code = 554
        
        target.readable = false;
        target.emit('abort', code, msg);
    };
    
    return target;
    
    function write (buf) {
        if (!this.aborted) this.queue(buf);
    }
    
    function end () {
        this.queue(null);
        
        if (this.aborted) {
            write(target.aborted.code, target.aborted.message);
            next();
        }
        else emit('received', function () {});
    }
}
