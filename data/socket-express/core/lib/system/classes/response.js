module.exports = {
  $deps: [
    {
      'x': 'express'
    }
  ],
  $static: {
    $setup: function() {
      return this.$implement(this.$.x.response);
    },
    factory: function(obj) {
      if (obj == null) {
        obj = {};
      }
      obj.__proto__ = this;
      return obj;
    }
  }
};
