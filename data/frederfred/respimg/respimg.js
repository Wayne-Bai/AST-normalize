(function (window, document) {

  'use strict';

  // get element by class
  function getElementsByClassName(type, className) {
    var arr = [];
    var els = document.getElementsByTagName(type);
    var pattern = new RegExp('(^|\\s)' + className + '(\\s|$)');

    for (var i=0; i < els.length; i++) {
      if ( pattern.test(els[i].className) ) {
        arr.push(els[i]);
      }
    }

    return arr;
  }

  // window width
  function windowWidth() {
    return window.innerWidth || document.documentElement.offsetWidth;
  }

  // update an image
  function updateImg(size, els, setAuto) {

    for (var i=0; i < els.length; i++) {

      var new_src = els[i].getAttribute('data-'+size);
      els[i].setAttribute('src', new_src);

      // will set width and height to auto (needed by IE7+8 if not set by CSS)
      if (setAuto) {
        els[i].style.width = 'auto';
        els[i].style.height = 'auto';
      }
    }
  }

  // get all attributes
  function getElAttributes(el) {

    // object to hold element attributes in key: value pair
    var obj = {};
    var attributes = el.attributes;

    // loop element attributes
    for (var i=0; i < attributes.length; i++) {
      var attr = attributes[i];
      obj[attr.nodeName] = attr.nodeValue;
    }

    return obj;
  }

  var respimg = function respimg(o) {
    this.opts = o;
  };

  respimg.prototype = {

    // init
    init: function() {

      var els = getElementsByClassName('noscript', this.opts.className);

      // store current size
      this.size = this.getImageSize();

      for (var i=0; i < els.length; i++) {
        var img = document.createElement('img');
        var src = els[i].getAttribute('data-'+this.size);
        var alt = els[i].getAttribute('data-alt');

        // Check that we got a source from the noscript el
        if (src) {
          img.setAttribute('src', src);
          img.setAttribute('alt', alt);
          img.className = this.opts.className;

          // get all attributes from noscript el
          var elAttributes = getElAttributes(els[i]);

          // set all attributes to image
          for (var key in elAttributes) {
            if (elAttributes.hasOwnProperty(key)) {
              img.setAttribute(key, elAttributes[key]);
            }
          }

          // insert image before noscript tag
          els[i].parentNode.insertBefore(img, els[i]);

          // remove noscript tag
          els[i].parentNode.removeChild(els[i]);
        }
      }

      this.els = getElementsByClassName('img', this.opts.className);

    },

    // update images with correct size
    update: function() {

      // get image size
      var size = this.getImageSize();

      // only update images if we get a new size
      if (this.size !== size) {
        // update image with new size
        updateImg(size, this.els, this.opts.setAuto);

        // update stored size variable
        this.size = size;
      }

    },

    // returns matching image size
    getImageSize: function() {

      var size;
      var sizes = this.opts.sizes;
      var wW = windowWidth();

      // loop each size
      for (var key in sizes) {
        if (sizes.hasOwnProperty(key)) {
          var obj = sizes[key];
          if (wW >= (obj.min || 0) && wW <= (obj.max || Infinity)) {
            size = key;
          }
        }
      }

      return size;
    }

  };

  // expose respimg to window
  window.Respimg = respimg;

})(window, document);