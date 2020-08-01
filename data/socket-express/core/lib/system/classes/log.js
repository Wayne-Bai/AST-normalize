module.exports = {
  $deps: [
    {
      'winston': 'winston'
    }
  ],
  $static: {
    $setup: function(sx) {
      this.$inherit(this.$.winston);
      return sx.config('log').then((function(_this) {
        return function(config) {
          return _this._config = config.env();
        };
      })(this));
    }
  }
};
