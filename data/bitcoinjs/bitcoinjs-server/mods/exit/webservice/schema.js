var util = require('util');
var assert = require('assert');

var Schema = exports.Schema = function (schemaDef) {
  this.schemaDef = schemaDef;
};

Schema.prototype.apply = function (obj) {
  for (var i in this.schemaDef) {
    var fieldDef = this.schemaDef[i];

    if (fieldDef.required) {
      //  ("undefined" == typeof obj[i] ||
      // obj[i] == null)
      assert.notEqual(typeof obj[i], undefined, "Schema: Required field '"+i+"' is undefined");
      assert.notEqual(obj[i], null, "Schema: Required field '"+i+"' is null");
    }

    if (fieldDef.type) {
      if (fieldDef.type.name == "String") {
        obj[i] = "" + obj[i];
        continue;
      } else {
        assert.ok(obj[i] instanceof fieldDef.type,
              "Schema: Field '"+i+"' is of incorrect type");
      }
    }
  }

  return obj;
};
