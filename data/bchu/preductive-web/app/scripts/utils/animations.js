'use strict';

angular.module('todoWebApp')
  .animation('slideDown', function() {
    return {
      setup: function(el) {
        el.css('opacity',1);
      },
      start: function(el, done) {
        console.log('down start');
        el.animate(500,
          {opacity:1.0}, {queue:false});
        el.slideDown({
          queue:false,
          duration:500,
          done: function() {
            done();
            console.log('down done');
          }
        });
      },
    };
  })

  .animation('slideUp', function() {
    return {
      start: function(el, done) {
        console.log('up start');
        el.animate(500,
          {opacity:0}, {queue:false});
        el.slideUp({
          queue:false,
          duration:500,
          done: function() {
            done();
            console.log('up done');
          }
        });
      },
    };
  });
  // .animation('slideLeft', function() {
  //   return {
  //     start: function(el,done) {
  //       el.animate(500, {opacity:0}, )
  //     }
  //   };
  // });