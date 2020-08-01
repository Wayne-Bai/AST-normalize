// Filename: router.js
define([
  'jquery',
  'underscore',
  'parse',
  'scripts/views/login',
  'scripts/views/sign-up',
  'scripts/views/404',
  'scripts/views/contacts'
], function($, _, Parse, LoginView, SignUpView, ErrorView, ContactsView) {
  var AppRouter = Parse.Router.extend({
    routes: {
      // Define some URL routes
      'login': 'showLogin',
      'signUp': 'showSignUp',
      'contacts': 'showContacts',
      '*actions': 'errorPage'
    },

    showLogin: function() {
      // Call render on the module we loaded in via the dependency array
      // 'views/projects/list'
      var loginView = new LoginView();
      loginView.render();
    },

    showSignUp: function() {
      var signUpView = new SignUpView();
      signUpView.render();
    },

    showContacts: function() {
      var contactsView = new ContactsView();
      contactsView.build();
    },

    errorPage: function() {
      var errorView = new ErrorView();
      errorView.render();
    }


  });

  var initialize = function(){
    var app_router = new AppRouter();
    Parse.history.start({pushState: true});
    Parse.history.navigate('login', true);
  };

  return {
    initialize: initialize
  };
});
