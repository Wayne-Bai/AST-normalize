module.exports = {
  $singleton: true,
  $deps: [
    {
      'URI': 'URIjs'
    }, {
      'sluggo': 'sluggo'
    }, {
      '_': 'lodash'
    }, {
      '_s': 'underscore.string'
    }
  ],
  $setup: function(sx) {
    return sx.config('bootstrap').then((function(_this) {
      return function(config) {
        return _this.config = config.env();
      };
    })(this));
  },
  title: function(name, separator) {
    if (separator == null) {
      separator = '-';
    }
    name = this.$.sluggo(name);
    if (separator !== '-') {
      name.replace(/-/g, separator);
    }
    return name;
  },
  base: function(protocol, index, request) {
    var baseUrl, domain, port;
    if (protocol == null) {
      protocol = null;
    }
    if (index == null) {
      index = false;
    }
    baseUrl = this.config.get('baseUrl');
    port = this.config.get('port');
    if (protocol === true) {
      protocol = this.config.get('protocol');
    }
    if ((request != null ? request.secure : void 0) != null) {
      if (!request.secure) {
        protocol = request.protocol.toLowerCase()[0];
      } else {
        protocol = 'https';
      }
    }
    if (!protocol) {
      protocol = this.$.URI(baseUrl).protocol() || '';
    }
    if (index === true && this.config.get('indexFile')) {
      baseUrl += "" + (this.config.get('indexFile')) + "/";
    }
    if (!this.$._.isEmpty(protocol)) {
      if (port = this.$.URI(baseUrl).port()) {
        port = ":" + port;
      }
      if (domain = this.$.URI(baseUrl).host()) {
        baseUrl = this.$.URI(baseUrl).path();
      } else {
        domain = (request != null ? request.host : void 0) || this.config.get('domain');
      }
      baseUrl = "" + protocol + "://" + domain + port + baseUrl;
    }
    return baseUrl;
  },
  site: function(uri, protocol, index, request) {
    var path;
    if (uri == null) {
      uri = '';
    }
    if (protocol == null) {
      protocol = null;
    }
    if (index == null) {
      index = true;
    }
    path = this.$._s.trim(uri, '/').replace(/^[-a-z0-9+.]+?:\/\/[^\/]+?\/?/g, '');
    if (!/^[ -~\t\n\r]+$/.test(path)) {
      path = path.replace(/([^\/]+)/g, function() {
        return encodeURIComponent(match);
      });
    }
    return this.base(protocol, index, request) + path;
  }
};
