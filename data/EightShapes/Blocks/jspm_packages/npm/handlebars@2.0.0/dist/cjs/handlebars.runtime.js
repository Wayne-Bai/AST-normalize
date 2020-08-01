/* */ 
"use strict";
var base = require("./handlebars/base");
var SafeString = require("./handlebars/safe-string")["default"];
var Exception = require("./handlebars/exception")["default"];
var Utils = require("./handlebars/utils");
var runtime = require("./handlebars/runtime");
var create = function() {
  var hb = new base.HandlebarsEnvironment();
  Utils.extend(hb, base);
  hb.SafeString = SafeString;
  hb.Exception = Exception;
  hb.Utils = Utils;
  hb.escapeExpression = Utils.escapeExpression;
  hb.VM = runtime;
  hb.template = function(spec) {
    return runtime.template(spec, hb);
  };
  return hb;
};
var Handlebars = create();
Handlebars.create = create;
Handlebars['default'] = Handlebars;
exports["default"] = Handlebars;
