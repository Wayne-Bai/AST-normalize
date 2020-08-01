(function(global, continuum){
var utility = continuum.utility,
    create = utility.create,
    assign = utility.assign,
    define = utility.define,
    each = utility.each;


var resolve = function(a){
  function URL(){
    ['hash', 'host', 'hostname', 'href', 'pathname', 'port', 'protocol', 'search'].forEach(function(p){
      this[p] = a[p];
    }, this);
  }

  return function resolve(url){
    a.href = url;
    return new URL;
  };
}(document.createElement('a'));


function extension(path){
  var start = path.lastIndexOf('.');
  return ~start ? path.slice(start + 1) : '';
}

function serialize(o){
  var out = [];

  each(o, function(value, key){
    return encodeURIComponent(key) + '=' + encodeURIComponent(value);
  });

  return out.join('&');
}



function createHandler(obj, callback){
  function complete(evt){
    if (xhr.readyState === 4) {
      obj.state = 'complete';
      xhr.onload = xhr.onerror = null;

      var response = xhr.responseText;

      if (xhr.ext === 'json') {
        response = JSON.parse(response);
      }

      callback.call(obj, response, evt);
    }
  }

  var xhr = new XMLHttpRequest;
  xhr.onerror = xhr.onload = complete;
  return xhr;
}


function XHR(options){
  options = typeof options === 'string' ? { base: options } : assign({}, options);

  assign(this, {
    data: options.data || {},
    base: options.base || '',
    state: 'idle',
    headers: assign({}, options.headers)
  });

  if (options.path && options.callback) {
    this.request(options.path, options.callback);
  }
}

define(XHR.prototype, [
  function url(path, verb){
    var params = serialize(this.data);
    var base = this.base ? [this.base] : [];
    return base.concat(path).join('/') + (verb === 'GET' && params ? '?' + params : '');
  },
  function auth(user, pass){
    this.headers.Authorization = !pass && user.length === 40 ? 'token '+user : 'Basic '+btoa(user+':'+pass);
  },
  function request(path, verb, callback){
    var xhr = createHandler(this, arguments[arguments.length - 1]);
    verb = typeof verb === 'string' ? verb.toUpperCase() : 'GET';

    xhr.ext = extension(path);
    xhr.open(verb, this.url(path, verb));

    if (this.headers.Authenticate) {
      xhr.withCredentials = true;
    }

    each(this.headers, function(value, key){
      xhr.setRequestHeader(key, value);
    });

    xhr.send(this.data || null);

    this.state = 'loading';
    return this;
  }
]);



continuum.load = function load(file, callback){
  return new XHR({
    path: file,
    callback: callback
  });
}

})(this, continuum);
