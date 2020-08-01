// Combination of responsive images with srcset polyfill,
// and lazy loading images

var Srcery = (function () {
    var limits = {delay: 400, eagerness: 3, batchLength: 6},
        d=document, g=window, batchIndex=0, position=0, 
        i, hold, len, s, src, srcset, vHeight, vWidth, w, queued,  
        attr, getImages, onEvent, inViewport, loadImage, runImages;
          
    // get or set an html attribute
    attr = function() {
        // if three arguments
        return arguments.length-2 ? 
            // set attribute if different
            (attr(arguments[0],arguments[1]) != arguments[2]) && arguments[0].setAttribute(arguments[1],arguments[2]): 
            // if two arguments, get attribute
            arguments[0].getAttribute(arguments[1]);
    };

    // set array of images
    getImages = function() {
        imgs = d.querySelectorAll ?
               d.querySelectorAll('img[data-srcset]'):
               d.getElementsByTagName('img');
    }

    onEvent = function(event, action){
        g.addEventListener?
            this.addEventListener(event, action, false):
            (g.attachEvent)?
                this.attachEvent('on' + event, action):
                this['on' + event] = action;
    };

    inViewport = function(el) {
        if ( attr(el, 'data-original-src') ) {
            return true;
        }

        //console.log('- run getBoundingClientRect');
        var rect = el.getBoundingClientRect();

        return (
           rect.left   >= 0 - limits.eagerness * viewportHeight() &&
           rect.top <= limits.eagerness * viewportHeight()
        )
    };

    loadSrc = function(img, src){
        if ( attr(img, 'src')!= src ) {
            batchIndex += 1;
            attr(img, 'src', src);
            //console.log(['loading image', src, img, {batch:batchIndex}]);
        }
    }

    loadImage = function(img){
        // exit if no srcset attribute
        srcset = attr(img, 'data-srcset');
        if (!srcset) return;
        
        // save original src
        if ( !attr(img, 'data-original-src') ) {
            attr( img, 'data-original-src', attr(img, 'src') );
        }

        // split srcset into array by comma
        srcset = srcset.split(/, ?/);
                
        // iterate array image widths in srcset
        for ( s=0; s<srcset.length; s++ ) {
        
            if ( !srcset[s].match(/\dw$/) ) {
                // regular lazy load
                src = srcset[s];
                loadSrc(img, src);

            } else {
                // capture desired width for image in srcset
                w = +srcset[s].match(/\d+(?=w$)/) ;
                if (w <= vWidth ) {
                    src = srcset[s].split(/ /)[0];
                    loadSrc(img, src);
                    break;  
                } 
            } 
        }
    };

    runImages = function() {

        // exit if currently on hold
        if (!hold) {
            //console.log('-- runImages called AND running');
            hold = true;
            
            // cache viewportWidth before looping over every image
            vWidth = viewportWidth();
            queued = false;

            len=imgs.length;
            //console.log(['getting imgs: ', len, imgs]);
            position == position ? 0 : position;


            for ( i=position; i<len; i++ ) {

                if (batchIndex < limits.batchLength) {
                    if ( inViewport(imgs[i]) ) {
                        loadImage(imgs[i]);
                    }
                } else {
                    if (!queued) {
                        queued = true;
                        setTimeout(function(){
                            batchIndex = queued = 0;
                            position = i;
                            runImages();
                        }, limits.delay / 10);
                        return;
                    }
                }

            }
        } else {
            if (!queued) {
                queued = true;
                setTimeout(function(){
                    if (hold) {
                        hold = queued = false;
                        runImages();
                    }
                }, limits.delay);
            }
        }
    }

    // get page height
    // and cache result in vHeight
    viewportHeight = function() {
        return vHeight = vHeight || 
            (g.innerHeight || d.documentElement.clientHeight);
    }

    // get page width
    // and multiply width by retina display level
    viewportWidth = function() {
        return (g.innerWidth || d.body.parentNode.clientWidth ) * (g.devicePixelRatio || 1);
    }

    queued = hold = false;

    getImages();

    onEvent( 'load', runImages );
    onEvent( 'orientationchange', function() {
        // reset cached vHeight so it will load the new viewportHeight
        vHeight = 0;
        hold = false;
        runImages();
    });
    onEvent( 'scroll', runImages );
    onEvent( 'orientationchange', runImages );

    // reload imgs array again if not set        
    !imgs.length && 
        setTimeout(getImages, limits.delay);
        

    // optional public methods
    return({

        // Allow updating eagerness number.
        // Eagerness is how many pixels to look ahead when loading images
        
        // example: 
        // Srcery.set.({ eagerness: 1 });  // no eagerness, completely lazy loading
        // Srcery.set.({ eagerness: 5 });  // double the eagerness

        set: function(options) {
            for (var property in options) {
                if (options.hasOwnProperty(property)) {
                    limits[property] = options[property]
                }
            }
        }
        
        // Allowing adding new images after page loads.
        // To update images loaded with ajax
        
        // example: 
        // var newImage = document.createElement('img');
        // newImage.src = 'cat.gif';
        // Srcery.push(newImage);
        ,push: function(img) {
            return imgs.push(img);
        }
        
        // Load all images right away, cancelling laziness
        
        // example:
        // Srcery.now();
        ,now: function() {
            for ( i=0, len=imgs.length; i<len; i++ ) {
                loadImage(imgs[i]);
            }
        }

        //,imgs: function() {
        //    return imgs;
        //}

    });

})();

