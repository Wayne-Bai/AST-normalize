var Stream = require('stream');
var JobClient = require('crp-job-client');
var StreamClient = require('crp-stream-client');
var inherits = require('util').inherits;


var Duplex = Stream.Duplex ||
  require('readable-stream').Duplex;

var PassThrough = Stream.PassThrough ||
  require('readable-stream').PassThrough;

module.exports = CrowdProcess;

function CrowdProcess(username, password) {
  var opts = {};
  if (arguments.length === 1 &&
      typeof arguments[0] === 'string') {
    opts.token = arguments[0];
  }

  if (arguments.length === 1 &&
      typeof arguments[0] === 'object') {
    opts = arguments[0];
  }

  if (arguments.length === 2 &&
      typeof arguments[0] === 'string' &&
      typeof arguments[1] === 'string') {
    opts.email = arguments[0];
    opts.password = arguments[1];
  }

  var jobs = JobClient(opts);
  var streams = StreamClient(opts);

  function DuplexThrough(data, program, onResults) {
    if (!(this instanceof DuplexThrough)) {
      return new DuplexThrough(data, program, onResults);
    }

    var self = this;

    var opts = {};

    if (data instanceof Object &&
        Object.getPrototypeOf(data) === Object.prototype) {
      opts = data;
    }

    if (data instanceof Stream || data instanceof Array) {
      opts.data = data;
    }

    if (data instanceof Function) {
      opts.program = data.toString();
    }

    if (typeof data === 'string') {
      opts.program = data;
    }

    if (Buffer.isBuffer(data)) {
      opts.program = data.toString();
    }

    if (!opts.program &&
        (program instanceof Function ||
         typeof program === 'string' ||
         Buffer.isBuffer(program))) {
      opts.program = program;
    }

    if (!opts.mock &&
        opts.program instanceof Function) {
      opts.program = opts.program.toString();
    }

    if (Buffer.isBuffer(opts.program)) {
      opts.program = opts.program.toString();
    }

    if (opts.program &&
        !opts.data &&
        program instanceof Function) {
      opts.onResults = program;
    }

    if (onResults instanceof Function) {
      opts.onResults = onResults;
    }

    opts.objectMode = true; // force objectMode

    Duplex.call(this, opts);

    this.opts = opts;

    this.inRStream = new PassThrough(opts); // tasks
    this.outWStream = new PassThrough(opts); // results

    this.numTasks = 0;
    this.numResults = 0;
    this.bufferedResults = [];

    this.on('pipe', function (src) {
      src.on('end', function () {
        self.inRStream.end();
      });
    });

    this.on('end', function () {
      self.inRStream.end();
    });

    if (opts.id) {
      process.nextTick(function () {
        onJobCreation(null, {
          id: opts.id
        });
      });
    } else if (opts.mock) {
      process.nextTick(onJobCreation);
    } else {
      jobs.create({
        program: opts.program,
        group: opts.group,
        bid: opts.bid
      }, onJobCreation);
    }

    function onJobCreation (err, res) {
      if (err) {
        self.emit('error', err);
        return;
      }

      if (!self.opts.mock) {
        var id = res.id;
        if (!self.opts.id) {
          self.emit('created', id);
        }
        self.resultStream = streams(id).Results({ stream: true });
        self.errorStream = streams(id).Errors({ stream: true });
        self.taskStream = streams(id).Tasks();

        self.inRStream.pipe(self.taskStream);
        self.resultStream.pipe(self.outWStream);

        self.errorStream.on('data', function (err) {
          self.numResults++;
          self.emit('error', err);
          self._maybeClose();
        });
      }

      if (self.opts.data instanceof Stream) {
        self.opts.data.pipe(self);
        self.opts.data.on('end', function () {
          self.inRStream.end();
          self.end();
        });
      }

      if (self.opts.data instanceof Array) {
        var data = self.opts.data;
        var n = data.length;
        for (var i = 0; i < n; i++) {
          self.numTasks++;
          if (data[i] === null) { // just so it doesn't close the stream!
            self.inRStream.write(0);
          } else {
            self.inRStream.write(data[i]);
          }
        }
        self.inRStream.end();
        self.end();
      }

      if (self.opts.onResults) {
        self.on('data', function (chunk) {
          self.bufferedResults.push(chunk);
        });
      }

      self.outWStream.on('readable', function () {
        self._read(0);
      });

      self.outWStream.on('end', function () {
        self.push(null);
      });

      if (self.opts.mock) {
        var program = self.opts.program;

        if (typeof program === 'string') {
          throw new Error('In mock mode, your program has to be a function.');
        }

        self.inRStream.on('data', function (d) {
          var result;
          if (program.length === 2) {
            program(d, onResult);
          } else {
            result = program(d);
            onResult(result);
          }

          function onResult (result) {
            process.nextTick(function () {
              self.outWStream.write(result);
            });
          }
        });
      }
    }
  }

  inherits(DuplexThrough, Duplex);

  DuplexThrough.prototype._write = _write;
  function _write (chunk, enc, cb) {
    var self = this;
    self.numTasks++;
    if (self.inRStream.write(chunk)) {
      cb();
      self._maybeClose();
    } else {
      self.inRStream.once('drain', cb);
    }
  }

  DuplexThrough.prototype._read = _read;
  function _read (n) {
    var self = this;
    while (null !== (chunk = self.outWStream.read())) {
      self.numResults++;
      if (!self.push(chunk)) {
        break;
      }

      self._maybeClose();
    }
  }

  DuplexThrough.prototype._maybeClose = _maybeClose;
  function _maybeClose () {
    var self = this;
    if (self.ended) {
      return;
    }

    if (self._writableState.ended && self.numResults == self.numTasks) {
      self.ended = true;
      if (!self.opts.mock) {
        self.resultStream.end();
        self.errorStream.end();
      }
      self.inRStream.end();
      self.push(null);
      if (self.opts.onResults) {
        self.opts.onResults(self.bufferedResults);
      }
    }
  }

  // legacy
  DuplexThrough.map = DuplexThrough;

  return DuplexThrough;
}
