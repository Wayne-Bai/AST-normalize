// `up` and `down` Panel transitions.
//
(function($){
  
  var EASING = 'cubic-bezier(.25, .1, .25, 1)',
      DURATION = 500;
  
  App.Helpers.Transitions.upDown = {
    
    effects: {
      
      up: function (callback) {
        var that = this,
            $el = $(that.el),
            prevZ = $el.css('z-index'),
            l = that.transitionBindings.length,
            animate = function (container, index) {
              container.transform({
                translate3d: '0,' + document.height + 'px,0'
              }).show().animate({
                translate3d: '0,0,0'
              }, DURATION, EASING, function () {
                // Only call the calback function when all the animations are done.
                if (index === l-1) {
                  $el.css('z-index', prevZ);
                  callback();
                }
              });
            };
        
        _.each(that.transitionBindings, function(elm, index) {
          var container = that.$(elm);
          if (container.length === 0)
            throw new Error('The container element to animate is not \
            availabe in this view.');
          
          $el.css('z-index', 100);
          animate(container, index);
        });
      },
      
      down: function (callback) {
        var that = this;
        
        _.each(that.transitionBindings, function(elm) {
          var container = that.$(elm);
          if (container.length === 0)
            throw new Error('The container element to animate is not \
            availabe in this view.');
          
          container.show();
        });
      }
    },
    
    reverseEffects: {
      
      up: function (callback) {
        var that = this;
            
        _.each(that.transitionBindings, function(elm) {
          var container = that.$(elm);
          if (container.length === 0)
            throw new Error('The container element to animate is not \
            availabe in this view.');
            
          setTimeout(function () {
            container.hide();
            callback();
          }, DURATION);
        });
      },
      
      down: function (callback) {
        var that = this,
            $el = $(that.el),
            prevZ = $el.css('z-index'),
            l = that.transitionBindings.length,
            animate = function (container, index) {
              container.show().animate({
                translate3d: '0,' + document.height + 'px,0'
              }, DURATION, EASING, function () {
                container.hide().transform({translate3d: '0,0,0'});
                // Only call the calback function when all the animations are done.
                if (index === l-1) {
                  $el.css('z-index', prevZ);
                  callback();
                }
              });
            };
        
        _.each(that.transitionBindings, function(elm, index) {
          var container = that.$(elm);
          if (container.length === 0)
            throw new Error('The container element to animate is not \
            availabe in this view.');
          
          $el.css('z-index', 100);
          animate(container, index);
        });
      }
      
    }
  };
}).call(this, this.Zepto);