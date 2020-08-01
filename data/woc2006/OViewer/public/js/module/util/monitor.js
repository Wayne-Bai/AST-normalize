/**
 * Performance moniter
 */
define(function(require,exports,module){
    var lastFpsUpdate = 0,
        lastFps = 0,
        memory = 0,
        lastMemory = '',
        fps = 0;
    return {
        update: function(){
            var now = Date.now();
            fps++;
            if(now - lastFpsUpdate >= 1000){
                lastFpsUpdate = now;
                lastFps = fps;
                fps = 0;
            }
        },

        FPS: function(){
            return lastFps;
        }
    };

});