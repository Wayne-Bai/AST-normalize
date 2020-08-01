define([
  "jquery"
], function($) {

  "use strict";

  var buildObject, PATTERNS, pushCounters;

  PATTERNS = {
    key: /[a-zA-Z0-9_-]+|(?=\[\])/g,
    push: /^$/,
    fixed: /^\d+$/,
    named: /^[a-zA-Z0-9_-]+$/
  };

  pushCounters = {};

  function SerializeForm(form) {
    pushCounters = {};
    if (form.jquery === void 0) {
      form = $(form);
    }
    return buildObject(form, {});
  }

  SerializeForm.build = function(base, key, value) {
    base[key] = value;
    return base;
  };

  SerializeForm.pushCounter = function(key, i) {
    if (pushCounters[key] === void 0) {
      pushCounters[key] = 0;
    }
    if (i === void 0) {
      return pushCounters[key]++;
    } else {
      if (i !== void 0 && i > pushCounters[key]) {
        return pushCounters[key] = ++i;
      }
    }
  };

  buildObject = function(form, formParams) {
    $.each(form.serializeArray(), function() {
      var k, keys, merge, reverseKey;
      k = void 0;
      keys = this.name.match(PATTERNS.key);
      merge = (this.value == "on" ? true : this.value);
      reverseKey = this.name;
      while ((k = keys.pop()) !== void 0) {
        reverseKey = reverseKey.replace(new RegExp("\\[" + k + "\\]$"), "");
        if (k.match(PATTERNS.push)) {
          merge = SerializeForm.build([], SerializeForm.pushCounter(reverseKey), merge);
        } else if (k.match(PATTERNS.fixed)) {
          SerializeForm.pushCounter(reverseKey, k);
          merge = SerializeForm.build([], k, merge);
        } else {
          if (k.match(PATTERNS.named)) {
            merge = SerializeForm.build({}, k, merge);
          }
        }
      }
      return formParams = $.extend(true, formParams, merge);
    });
    return formParams;
  };

  return SerializeForm;

});
