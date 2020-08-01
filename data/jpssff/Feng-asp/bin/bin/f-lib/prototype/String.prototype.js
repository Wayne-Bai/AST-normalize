(function(){

if (!String.prototype.trim) {
  String.prototype.trim = (function () {

    var trimLeft  = /^\s+/,
        trimRight = /\s+$/;

    return function () {
      return this.replace(trimLeft, "").replace(trimRight, "");
    }
  })()
};

String.prototype.nl2br = function(){
    return this.replace(/\n/g, '<br/>');
};

// vim:ft=javascript
})();
