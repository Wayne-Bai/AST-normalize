(function( $ ) {

  var Core = window.Core || Core || {};

  Core.dashboard = {

    init: function (){
      Core.auth.requireSession();
      Core.dashboard.bindEvents();
      Core.ui.showView();
    },

    bindEvents: function() {
      $('#logout').bind('click',function(){
        Core.auth.logout();
        return false;
      });
    }

  };

  $( Core.dashboard.init );

  window.Core = Core;

})(jQuery);
