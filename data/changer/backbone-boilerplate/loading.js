define([], function() {
  return function(off, el, name) {
    off = !!off;
    el = el || $('body');
    var loader = $('.loader'),
        visible = loader.hasClass('visible'),
        names = loader.data('names') || [];
    if(name) {
      if(off) {
        var index = names.indexOf(name);
        if(index > -1) {
          names.splice(index, 1);
        }
      }
      else {
        names.push(name);
      }
      loader.data('names', names);
    }
    if(off && names.length) {
      return;
    }
    // Only toggle when necessary
    if(off === visible) {
      if(!loader.parent().is(el)) {
        if(off) {
          return;
        }
        loader.appendTo(el);
      }
      if(loader.data('timer')) {
        clearTimeout(loader.data('timer'));
        loader.removeData('timer');
      }
      loader.show();
      loader.toggleClass('visible', !off);
      if(off) {
        loader.data('timer', setTimeout(function() {
          loader.hide().appendTo('body');
        }, 800));
      }
    }
  };
});
