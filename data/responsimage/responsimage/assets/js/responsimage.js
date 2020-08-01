/* responsimage.com v0.2.4 */
(function () {

	'use strict';

	$(function() {

		var rPrefs = $('meta[name="responsimage"]'),
			rServer = rPrefs.data('server'),
			rStatic = rPrefs.data('static') || 'http://f.cl.ly/items/0M3H0q3n1Z1S1y362d09/spacer.gif',
			rLoading = rPrefs.data('loading') || 'http://f.cl.ly/items/2w2G3N2p0B400Z380J1u/loading.gif',
      rLimit = rPrefs.data('limit') || 100,
			rTags = $('[data-responsimage]');

		function responsimage(rInit) {
			rTags.each(function() {
				var rIsImg = this.nodeName == 'IMG',
          rThis = $(this),
					filename = rThis.data('responsimage'),
					rWidth = rIsImg ? rThis.width() : rThis.parent().width(),
					rHeight = rIsImg ? rThis.height() : rThis.parent().height(),
					rAnchor = rThis.data('responsimage-anchor') || 5,
          rBackgroundPosition = rThis.data('responsimage-background-position') || 'center',
					rImage;

				if(rInit) {
          if(rIsImg){
            // using img
            rThis.attr('src', rStatic);
          }
				}

        // display loading graphic
        rThis.css({
          'background': '#fff url(' + rLoading + ') no-repeat center',
          '-webkit-background-size': 'auto',
          '-moz-background-size': 'auto',
          'background-size': 'auto'
        });

				if(rThis.css('font-family') === 'pixel-ratio-2') {
					rWidth *= 2;
					rHeight *= 2;
				}

				rImage = rServer.replace('width', rWidth).replace('height', rHeight).replace('anchor', rAnchor).replace('filename', filename);

        if (filename !== 'disabled'){
          if(rIsImg){
            // img
            rThis.attr('src', rImage);
          } else {
            // css background image
            // show loading spinner all the way up until image is actually loaded into the dom
            var targetImage = document.createElement('image');
            targetImage.onload = function(){
              // css background-image
              rThis.css({
                'background-image': 'url(' + rImage + ')',
                '-webkit-background-size': 'cover',
                '-moz-background-size': 'cover',
                'background-size': 'cover',
                'background-position': rBackgroundPosition
              });
              targetImage.src = '';
            };
            targetImage.src = rImage;
          }
        }

			});
		}

    // From underscore.js - useful to help keep remote requests down to minimal as possible while resizing
    // Referenced to avoid 3rd party dependencies (and because it's so small)
    var throttle = function(func, wait){
      var context, args, timeout, result;
      var previous = 0;
      var later = function(){
        previous = new Date;
        timeout = null;
        result = func.apply(context, args);
      };
      return function(){
        var now = new Date;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0){
          clearTimeout(timeout);
          timeout = null;
          previous = now;
          result = func.apply(context, args);
        } else if (!timeout){
          timeout = setTimeout(later, remaining);
        }
        return result;
      };
    };

		responsimage(1);

    // helps keep remote requests down to minimum while resizing
    var throttledResponsimage = throttle(responsimage, rLimit);

		$(window).resize(function () {
			throttledResponsimage();
		});

		window.onorientationchange = function() {
			setTimeout(responsimage, 0);
		};
	});
}());