var DEBUG = true;
var DAYS_TO_SECONDS = 24 * 60 * 60;

function Wrapper(that, callback) {
  this.that_ = that;
  this.callback_ = callback;
}
Wrapper.prototype = {
  wrap: function(f) {
    var that = this;
    return function() {
      try {
        f.apply(that.that_, arguments);
      } catch(e) {
        var message = e.message + "\n";
        message += stack().join("\n");
        that.callback_(false, message);
      }
    };
  }
}

function wrap(f) {
  return function() {
    try {
      f.apply(this, arguments);
    } catch(e) {
      var message = "wrap error: " + e;
      console.log(e);
      console.log(e.stack);
      arguments[arguments.length - 1](false, message);
    }
  };
}

function Timer() {
  if (!DEBUG) return;
  this.start_ = (new Date()).getTime();
  this.time_ = this.start_;
}
Timer.prototype = {
  mark: function(s) {
    if (!DEBUG) return;
    var now = (new Date()).getTime();
    this.log_(now - this.time_, "MARK: " + s);
    this.time_ = now;
  },
  done: function(s) {
    if (!DEBUG) return;
    var now = (new Date()).getTime();
    this.log_(now - this.start_, "DONE: " + s);
  },
  log_: function(ms, s) {
    d(s.substr(0, 1024) + " " + ms + "ms");
  }
};

function d(s) {
  if (DEBUG) {
    console.log(s.substr(0, 1024) + (s.length > 1024 ? "..." : ""));
  }
}

function bind(o, f) {
  return function() {
    if (typeof f == "string")
      f = o[f];
    f.apply(o, arguments);
  };
}

function stack() {
  var callstack = [];
  var currentFunction = arguments.callee.caller;
  while (currentFunction) {
    var fn = currentFunction.toString();
    var fname = fn.substring(fn.indexOf("function") + 8, fn.indexOf(' ')) || 'anonymous';
    callstack.push(fname);
    currentFunction = currentFunction.caller;
  }
  return callstack;
}

function parseISO8601(s) {
  var a = s.match(/(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)Z/);
  if (a && a.length == 7) {
    var d = new Date(a[1], a[2] - 1, a[3], a[4], a[5], a[6]);
    var offset = d.getTimezoneOffset() * 60 * 1000 * -1;
    d.setTime(d.getTime() + offset);
    return d;
  }
  alert("bad date " + s);
  return null;
}

function formatISO8601(d) {
  function pad(s) { return ("0" + s).substr(-2); }
  return d.getUTCFullYear() + "-" +
    pad(d.getUTCMonth() + 1) + "-" +
    pad(d.getUTCDate()) + "T" +
    pad(d.getUTCHours()) + ":" +
    pad(d.getUTCMinutes()) + ":" +
    pad(d.getUTCSeconds()) + "Z";
}

function fixEncoding(data) {
  function mask(data) {
    var a = [];
    var i  = 0;
    while (i + 10 < data.length) {
      a.push(String.fromCharCode(data.charCodeAt(i    ) & 0xff,
                                 data.charCodeAt(i + 1) & 0xff,
                                 data.charCodeAt(i + 2) & 0xff,
                                 data.charCodeAt(i + 3) & 0xff,
                                 data.charCodeAt(i + 4) & 0xff,
                                 data.charCodeAt(i + 5) & 0xff,
                                 data.charCodeAt(i + 6) & 0xff,
                                 data.charCodeAt(i + 7) & 0xff,
                                 data.charCodeAt(i + 8) & 0xff,
                                 data.charCodeAt(i + 9) & 0xff));
      i += 10;
    }
    for (; i < data.length; i++) {
      a.push(String.fromCharCode(data.charCodeAt(i) & 0xff));
    }
    return a.join("");
  }

  var timer = new Timer();
  var filtered = data.replace(/[\uf780-\uf7ff]{1,600}/g, mask);
  timer.mark("mask " + data.length + " bytes.");
  return filtered;
}
