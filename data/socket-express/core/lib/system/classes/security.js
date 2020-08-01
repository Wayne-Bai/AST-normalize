module.exports = {
  $singleton: true,
  $deps: [
    {
      'lusca': 'lusca'
    }, {
      'cors': 'cors'
    }
  ],
  $setup: function(sx) {
    return sx.config('security').then((function(_this) {
      return function(config) {
        var csp;
        config.env();
        if (config.get('csrf') === true) {
          sx.app.use(_this.$.cors());
        }
        if ((csp = config.get('csp')) && (csp.enabled === true)) {
          return sx.app.use(_this.$.lusca.csp(config.get('csp')));
        }
      };
    })(this));
  }
};
