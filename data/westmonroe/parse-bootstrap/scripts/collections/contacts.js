//Filename: contacts.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',
  'underscore',
  'parse',
  'scripts/models/contact'
], function($, _, Parse, ContactModel){
  var ContactsCollection = Parse.Collection.extend({
    model: ContactModel
  });
  return ContactsCollection;
  // What we return here will be used by other modules
});