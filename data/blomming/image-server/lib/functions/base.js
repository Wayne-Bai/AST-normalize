var util = require("util");
var crypto = require("crypto");
var debug = require("debug")("resizer");

var IMAGE_FORMATS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif"
};

function joinKeyValues(hash) {
  return Object.keys(hash).map(function(key){ return key + ':' + hash[key]; }).join(',');
}

function Base(width, height, remoteURL) {
  this.width = width && parseInt(width, 10) || null;
  this.height = height && parseInt(height, 10) || null;
  this.url = remoteURL.split("?")[0];
  this.url = this.url.replace(/http(s{0,1}):\/(?!\/)/, "http$1://");
}

var supportedMimePattern = new RegExp(/.*(gif|jpg|jpeg|png)$/i);

Base.prototype.__defineGetter__('mimeType', function(){
  var mimeMatches = this.url.match(supportedMimePattern);
  if (mimeMatches) {
    // valid mime types are: 'image/gif', 'image/jpeg' and 'image/png'
    return ('image/' + (mimeMatches[1] === 'jpg' ? 'jpeg' : mimeMatches[1])).toLowerCase();
  }

  // if not, we are converting to JPG
  return 'image/jpeg';
});

Base.prototype.destPath = function () {
  var shasum = crypto.createHash('sha1');
  shasum.update("resizes/" + this.url + this.resizerFunction.name + joinKeyValues(this.resizerOptions()));
  return "resizes/" + shasum.digest("hex");
};

Base.prototype.descendantOptions = function () {
  return {};
};

Base.prototype.resizerOptions = function () {
  var options = {
    convertTo: IMAGE_FORMATS[this.mimeType],
    debug: debug
  };
  return util._extend(options, this.descendantOptions());
};

Base.prototype.resizerFunction = function () {
  return (function () {});
};

Base.prototype.resizer = function () {
  return this.resizerFunction.call(this, this.resizerOptions());
};

Base.regexpGenerate = function (Klass, regexp, url) {
  var width, remoteUrl, height;
  width = remoteUrl = height = null;
  var helper = function (type, content) {
    if (type === "w" && width === null) {
      width = content;
    } else if (type === "h" && height === null) {
      height = content;
    } else if (type) {
      return false;
    }
    return true;
  };

  var match = url.match(regexp);

  if (match !== null) {
    match.shift(); // the first element is the string
    remoteUrl = match.pop(); // the last element is the remote URL

    if (helper(match[0], match[1]) && helper(match[2], match[3])) {
      return new Klass(width, height, remoteUrl);
    }
  }
  return undefined;
};

Base.buildFunction = function (regexp, resizerFunction, descendantOptions) {
  var newFunc = function (width, height, remoteURL) {
    Base.call(this, width, height, remoteURL);
  };

  util.inherits(newFunc, Base);

  newFunc.prototype.resizerFunction = resizerFunction;
  newFunc.prototype.descendantOptions = descendantOptions;

  newFunc.generate = function (url) {
    return Base.regexpGenerate(newFunc, regexp, url);
  };

  newFunc.regexp = regexp;

  return newFunc;
};

module.exports = Base;
