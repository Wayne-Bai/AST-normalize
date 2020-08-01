var fs = require('fs');

exports.merge = function merge(a, b){
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};

exports.dirname = function (path){
  var dir = /^([\s\S]+\/(?!$)|\/)?((?:[\s\S]+?)?(\.[^.]*)?)$/.exec(path)[1] || '';
  if (!dir || dir.length === 1) return '';
  else return dir;
}

exports.normalize = function(path) {
  var isAbsolute = path.charAt(0) === '/',
      trailingSlash = path.slice(-1) === '/';

  function normalizeArray(parts, allowAboveRoot) {
    // if the path tries to go above the root, `up` ends up > 0
    var up = 0;
    for (var i = parts.length-1; i >= 0; i--) {
      var last = parts[i];
      if (last == '.') {
        parts.splice(i, 1);
      } else if (last === '..') {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }
    // if the path is allowed to go above the root, restore leading ..s
    if (allowAboveRoot) {
      for (; up--; up) {
        parts.unshift('..');
      }
    }
    return parts;
  }

  // Normalize the path
  path = normalizeArray(path.split('/').filter(function(p) { 
    return !!p;
  })).join('/');

  if (!path && !isAbsolute) path = '.';
  if (path && trailingSlash) path += '/';
  
  return (isAbsolute ? '/' : '') + path;
};

exports.toRegExp = function toRegExp(str, begin, end){
   return ((begin) ? '^' : '') +
    str.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1') +
    ((end) ? '$' : '');
};
