module.exports = {
  $deps: [
    {
      'jugglingdb': 'promised-jugglingdb'
    }
  ],
  $static: {
    schemas: {},
    $setup: function(sx) {
      return sx.config('database').then((function(_this) {
        return function(config) {
          _this.config = config.env();
          _this.Schema = _this.$.jugglingdb.Schema;
        };
      })(this));
    },
    get: function(name) {
      if (this.schemas[name] != null) {
        return this.schemas[name];
      }
      if (!this.config.get(name) && name !== 'memory') {
        throw new Error('No setting for that schema');
      }
      return this.schemas[name] = new this.Schema(name, this.config.get(name));
    }
  }
};
