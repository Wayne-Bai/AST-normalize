var quotemeta = require('quotemeta');
var concat = require('concat-stream');
var hyperquest = require('hyperquest');
var qs = require('querystring');
var EventEmitter = require('events').EventEmitter;
var cookie = require('cookie-cutter');
var inherits = require('inherits');

module.exports = function (opts) { return new Persona(opts) };
inherits(Persona, EventEmitter);

function Persona (opts) {
    if (!opts) opts = {};
    if (typeof opts === 'string') opts = { audience: opts };
    this.audience = opts.audience;
    this.prefix = opts.prefix || '/_persona';
    this.verifier = opts.verify || 'https://verifier.login.persona.org/verify';
    
    this._prefixRegex = RegExp(
        '^' + quotemeta(this.prefix) + '/(login|logout)\\b'
    );
    this.sessionName = opts.sessionName || '_persona_session_id';
}

Persona.prototype.test = function (req) {
    return req.method === 'POST' && this._prefixRegex.test(req.url);
};

Persona.prototype.getId = function (req) {
    return cookie(req.headers.cookie).get(this.sessionName);
};

Persona.prototype.destroyCookie = function(res) {
  res.setHeader('Set-Cookie', this.sessionName
      + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  );
};

Persona.prototype.handle = function (req, res) {
    var self = this;
    res.setHeader('content-type', 'application/json');
    
    var m = this._prefixRegex.exec(req.url);
    if (!m) { res.statusCode = 404; res.end('not found') }
    else if (m[1] === 'login') {
        req.pipe(concat(function (body) {
            try { var msg = JSON.parse(body) }
            catch (err) { res.statusCode = 400; res.end(err + '\n'); return }
            
            self.verify(msg.assertion, function (err, id) {
                if (err) {
                    res.statusCode = id && id.code || 500;
                    res.end(err + '\n');
                    return;
                }
                else if (!id) {
                    res.statusCode = 400;
                    res.end('bad request\n');
                }
                else {
                    var sid = createId();
                    self.emit('create', sid, id);
                    var cookie = {};
                    cookie[self.sessionName] = sid;
                    
                    res.end(JSON.stringify({
                        id: id.email,
                        cookie: cookie
                    }));
                }
            });
        }));
    }
    else if (m[1] === 'logout') {
        self.emit('destroy', self.getId(req));
        this.destroyCookie(res)
        res.end('ok');
    }
};

Persona.prototype.verify = function (assertion, cb) {
    var self = this;
    var hq = hyperquest.post(self.verifier);
    var payload = JSON.stringify({
        assertion: assertion,
        audience: this.audience
    });
    
    hq.setHeader('content-type', 'application/json');
    hq.setHeader('content-length', payload.length + '');
    
    hq.pipe(concat(function (body) {
        try { var msg = JSON.parse(body) }
        catch (err) {
            return cb('parse error: ' + err + ' while parsing: ' + body);
        }
        
        if (!msg || typeof msg !== 'object') {
            return cb('unexpected response type ' + typeof msg);
        }
        if (msg.status !== 'okay') {
            return cb('response not ok: ' + msg.reason);
        }
        
        if (msg.status !== 'okay' || typeof msg.email !== 'string') {
            cb(null, null);
        }
        else cb(null, msg);
    }));
    
    hq.end(payload);
};

function createId () {
    var s = '';
    for (var i = 0; i < 4; i++) {
        s += Math.floor(Math.pow(16,8) * Math.random()).toString(16);
    }
    return s;
}
