define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'app'
], function($, _, Backbone, Marionette, App){

  var UserWidgetView = Backbone.Marionette.ItemView.extend({

    template:'#usersWidget',

  });

  return UserWidgetView;

});