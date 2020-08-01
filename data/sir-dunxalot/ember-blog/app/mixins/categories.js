'use strict';

App.Categories = Em.Mixin.create({
  categories: function() {
    var store = this.get('store');
    var categories = store.find('category');

    return categories;
  }.property(),
});
