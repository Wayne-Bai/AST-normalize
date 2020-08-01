var merge = App.utils.merge;

var Controller = module.exports = new Function;

Controller.prototype.data = {};

Controller.prototype.set = function(name, value) {
  this.data[name] = value;
}

Controller.prototype.render = function(template, data, callback) {
  if (typeof(data) === 'function') {
    callback = data;
    data = {};
  }

  // data = merge(this.data, data || {});
  data = data || {};

  for (var key in this.data) {
    if (typeof(data[key]) === 'undefined') {
      data[key] = this.data[key];
    }
  }

  App.render(template, data, callback || function(error, content) {
    if (error) {
      throw error;
    }
  });
}

module.exports = Controller;

if (typeof(Joose) !== 'undefined') {
  module.exports = Class({
    methods: {
      set: Controller.prototype.set,
      render: Controller.prototype.render
    }
  });
}
