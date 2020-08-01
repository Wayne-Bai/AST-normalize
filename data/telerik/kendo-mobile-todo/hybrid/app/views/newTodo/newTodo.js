define([
  'views/view',
  'text!views/newTodo/newTodo.html'
], function (View, html) {
  
  var view, modalView;

  var model = kendo.observable({
    text: null,
    add: function (e) {
      $.publish('/newTodo/add', [ this.get('text') ]);
      modalView.close();
    },
    close: function (e) {
      modalView.close();
    }
  });

  var events = {
    init: function (e) {
      modalView = e.sender;
    }
  };

  view = new View('newTodo', html, model, events);

});