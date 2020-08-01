var HomeController = Class({
  isa: App.Controller,

  methods: {
    index: function(request, response) {
      var data = {
        title: 'Katana - Easy to use, modular web framework for any Node.js samurai.'
      };

      response.render('index', data);
    }
  }
});

module.exports = new HomeController;
