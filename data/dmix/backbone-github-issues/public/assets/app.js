
  this.App = {
    Views: {},
    Controllers: {},
    Collections: {},
    Models: {},
    Functions: {},
    init: function() {
      Backbone.history.start();
      if (window.location.hash.length === 0) App.Controllers.Issues.issues();
      if (App.Functions.paramsContain("auth_token")) App.Controllers.OAuth.oauth();
      return App.Functions.logIn();
    }
  };

  $(function() {
    jQuery.support.cors = true;
    App.init();
    $('.nav a').click(function() {
      $('.nav li').removeClass('active');
      return $(this).parent('li').addClass('active');
    });
    return $('#logout').click(App.Functions.logOut);
  });
