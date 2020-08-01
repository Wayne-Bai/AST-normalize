/**
 * @fileoverview Avatar Crop Script
 * @author lifesinger@gmail.com
 */

define(function(require, exports) {

  var $ = require('jquery');
  require('imgareaselect')($);
  require('imgareaselect-css');

  var global = this;
  var bigimg = $('#bigimg');
  var preimg = $('<img/>').appendTo('#prediv');
  var imgpos = $('#imgpos');
  var imgw, imgh, ias;


  exports.init = function() {
    onImageReady(bigimg[0], initAreaSelect);

    $('#chooseFile').bind('change', function() {
      changeFile(this);
    });
  };

  function initAreaSelect() {
    imgw = bigimg.width();
    imgh = bigimg.height();

    var vals = imgpos.val().split('_');

    var pos = (vals[2] != '0') ? {
      x1: parseInt(vals[1]),
      y1: parseInt(vals[2]),
      x2: parseInt(vals[3]),
      y2: parseInt(vals[4])
    } : {
      x1: imgw > imgh ? (imgw - imgh) / 2 : 0,
      x2: imgw > imgh ? (imgw + imgh) / 2 : imgw,
      y1: imgw > imgh ? 0 : (imgh - imgw) / 2,
      y2: imgw > imgh ? imgh - 0 : (imgh + imgw) / 2
    };

    update(pos);

    if (ias) {
      ias.setSelection(pos.x1, pos.y1, pos.x2, pos.y2);
      ias.setOptions({ show: true });
      ias.update();
    }
    else {
      ias = bigimg.imgAreaSelect($.extend(pos, {
            aspectRatio : '1:1',
            minWidth: 30,
            minHeight: 30,
            onSelectChange : function() {
              update(arguments[1]);
            },
            instance: true
          }));
    }
  }

  function update(pos) {
    var scale = 30 / (pos.x2 - pos.x1);
    var style = {
      'width': Math.round(scale * imgw) + 'px',
      'height': Math.round(scale * imgh) + 'px',
      'marginLeft': '-' + Math.round(scale * pos.x1) + 'px',
      'marginTop': '-' + Math.round(scale * pos.y1) + 'px'
    };

    preimg.css(style);
    preimg[0].src = bigimg[0].src;
    updatePos(pos);
  }

  function changeFile(input) {
    var file = input['files'][0];
    var URL = global['webkitURL'] || global['URL'];

    if (file && URL && URL['createObjectURL']) {
      ias.setOptions({ hide: true });
      ias.update();
      updatePos({x1: 0, x2: 0, y1: 0, y2: 0});

      bigimg[0].src = URL['createObjectURL'](file);

      onImageReady(bigimg[0], function() {
        // setTimeout is for firefox to work properly
        setTimeout(function() {
          initAreaSelect();
          URL['revokeObjectURL'](bigimg[0].src);
        }, 0);
      });
    }
    else {
      ias.remove();
    }
  }

  function updatePos(pos) {
    imgpos.val(pos.x1 + '_' + pos.y1 + '_' + pos.x2 + '_' + pos.y2);
  }

  function onImageReady(img, fn) {
    if (img.complete) {
      fn();
    } else {
      img.onload = fn;
    }
  }

});
