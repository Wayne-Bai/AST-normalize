//Contacts Model
define([
  // These are path alias that we configured in our bootstrap
  'jquery',
  'underscore',
  'parse'
], function($, _, Parse){
  var ContactModel = Parse.Object.extend({
    className: 'Contact'
  });
  return ContactModel
  // What we return here will be used by other modules
});
