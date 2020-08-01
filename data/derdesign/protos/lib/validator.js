
/* lib/validator.js */

var app = protos.app;
var util = require('util');
var sanitizer = require('sanitizer');

/**
  Validator class
  
  @public
  @constructor
  @class Validator
 */

function Validator(config) {
  
  // Instance properties
  this.rules = {};
  this.rulesCount = 0;
  this.messages = {};
  this.optional = [];
  this.filters = {};
  this.postFilters = {};
  this.postValidations = [];
  
  // Options
  this.config = protos.extend({
    cleanup: true
  }, config || {});
  
  // Set context
  Object.defineProperty(this, '__context', {
    value: {},
    writable: true,
    enumerable: false,
    configurable: false
  });

  // App property
  Object.defineProperty(this, 'app', {
    value: protos.app,
    writable: true,
    enumerable: false,
    configurable: false
  });
  
}

Validator.prototype.fn = {
  
  typecast: protos.util.typecast,
  
  escape: sanitizer.escape,

  sanitize: sanitizer.sanitize,
  
  sanitizeEscape: function(val) {
    return sanitizer.escape(sanitizer.sanitize(val));
  },
  
  base64: function(val) {
    return new Buffer(val).toString('base64');
  },
  
  md5: app.md5,
  
  encodeURI: encodeURI,
  
  encodeURIComponent: encodeURIComponent,
  
  decodeURI: decodeURI,

  decodeURIComponent: decodeURIComponent,

  toInteger: function(val) {
    return parseInt(val, 10) || 0;
  },
  
  toFloat: function(val) {
    return parseFloat(val) || 0.0;
  },
  
  toLowerCase: function(val) {
    return val.toLowerCase();
  },
  
  toUpperCase: function(val) {
    return val.toUpperCase();
  }
  
}

Validator.prototype.i18n = {
  invalidField: "Invalid: %s",
  missingRequiredFields: "Missing Required Fields"
}

/**
  Sets or gets a validation context.

  Example:

    validator.context('foo', function(instance) {
      this.add({name: 'alpha'});
      this.filter({
        name: this.fn.toUpperCase
      });
    });

    validator.context('foo').validate(...);

  @param {string} context Validation context
  @param {function} func Validation function to pass when setting a context
 */

Validator.prototype.context = function(context, func) {
  if (func) {
    if (func instanceof Function) {
      var parts = context.split(/\s+/);
      var instance = new Validator();
      func.call(instance);
      if (parts.length) {
        parts.forEach(function(context) {
          this.__context[context] = instance;
        }, this);
      } else {
        throw new Error("Expecting context");
      }
      return this;
    } else {
      throw new Error("Expecting function");
    }
  } else if (context instanceof Function) {
    context.call(this);
  } else if (typeof context === 'object') {
    for (var key in context) {
      if (context.hasOwnProperty(key)) {
        if (context[key] instanceof Validator) {
          this.__context[key] = context[key];
        } else if (context[key] instanceof Function) {
          instance = new Validator();
          this.__context[key] = instance;
          context[key].call(instance, instance);
        }
      }
    }
    return this;
  } else {
    return this.__context[context];
  }
}

/**
  Gets the defined contexts in instance

 */

Validator.prototype.getContexts = function() {
  return this.__context;
}

/**
  Adds a validation rule to the validator instance
  
  Example:
  
    validator.add({first: 'alpha', last: 'alpha'}, "Invalid value: %s");
  
  @param {object|array} ob Object containing key/(regex|alias|function) -OR- array containing [ob, msg]
  @return {object} instance
 */

Validator.prototype.add = function(ob, msg) {
  if (ob instanceof Array) {
    return this.add.apply(this, ob); // recursive
  } else {
    return addRule.call(this, ob, msg);
  }
}

/**
  Adds an optional validation rule to the validator instance
  
  Example:
  
    validator.addOptional({first: 'alpha', last: 'alpha'}, "Invalid value: %s");
  
  @param {object|array} ob Object containing key/(regex|alias|function) -OR- array containing [ob, msg]
  @return {object} instance
 */

Validator.prototype.addOptional = function(ob, msg) {
  if (ob instanceof Array) {
    return this.addOptional.apply(this, ob); // recursive
  } else {
    return addRule.call(this, ob, msg, true);
  }
}

/**
  Adds filter methods, which will process content after it has validated
  
  Each filter methods receives [val] as argument.
  
  Example:
  
    app.validator()
      .add({name: 'anything'})
      .filter({
        name: function(val) {
          return sanitizer.sanitize(val)
        }
      })
      
  @param {object} methods Object containing the methods that will be applied as filters
  @return {object} instance
 */

Validator.prototype.filter = function(methods) {
  for (var m in methods) {
    if (methods[m] instanceof Function) {
      this.filters[m] = methods[m];
    } else {
      throw new Error(util.format('Function expected for filter: %s', m));
    }
  }
  return this;
}

/**
  Adds post-filter methods, which will process content after filters have been applied to the data
  
  Each filter method receives [val, fields] as arguments.
  
  Example:
  
    app.validator()
      .add({name: 'anything'})
      .filter({
        name: function(val) {
          return sanitize.sanitize(val);
        }
      })
      .postFilter({
        name: function(val) {
          return val.toUpperCase()
        }
      });
      
  @param {object} methods Object containing the methods that will be applied as filters
  @return {object} instance
 */

Validator.prototype.postFilter = function(methods) {
  for (var m in methods) {
    if (methods[m] instanceof Function) {
      this.postFilters[m] = methods[m];
    } else {
      throw new Error(util.format('Function expected for filter: %s', m));
    }
  }
  return this;
}

/**
  Adds post validation methods, which will process content after validation is performed

  Example:

  app.validator().add(...).postValidate(function(fields) {
    if (fields.password !== fields.password_confirm) {
      return "Passwords don't match";
    }
  });

  */

Validator.prototype.postValidate = function(fun) {
  if (fun instanceof Function) {
    this.postValidations.push(fun);
  } else {
    throw new Error("Validator::postValidate() expects function");
  }
}

/**

  Validates the fields passed and returns an object containing
  the properties that pass the validation checks defined in the
  validator instance.

  @param {object} data Fields to validate
  @return {object} Object containing only the fields that pass the validation checks
 */
 
Validator.prototype.getValid = function(data) {
  return this.validate(data, true);
}

/**
  Validates the fields passed and returns an error on failure

  If successfull, null is returned and the passed object is
  sanitized, containing only the expected keys/values.
  
  Example:
  
    var err = validator.validate({
      first: "John",
      last: "Doe"
    });
    
  @param {object} ob Object containing the keys/values to validate
  @param {boolean} validOnly If set to true, will return an object containing the valid fields (with filters applied)
  @return {err} Validation Error, Otherwise null.
 */

Validator.prototype.validate = function(fields, validOnly) {
  
  var err, val,
      count = 0,
      rules = this.rules,
      filters = this.filters,
      postFilters = this.postFilters,
      postValidations = this.postValidations,
      optkeys = this.optional,
      messages = this.messages,
      rulesCount = this.rulesCount || (this.rulesCount = Object.keys(rules).length);
  
  // Convert validOnly to boolean
  validOnly = validOnly ? true : false;
  
  // Get return object if getting valid fields
  if (validOnly) {
    var out = {};
  }
  
  // Return missing fields if empty object
  if (Object.keys(fields).length === 0 && optkeys.length === 0 && !validOnly) {
    return this.i18n.missingRequiredFields;
  }
  
  for (var key in rules) {

    if (key in fields) {
      
      // If key available, validate
      val = fields[key];
      
      if (val) {
        
        // Sanitize val & update property
        if (typeof val == 'string') {
          val = fields[key] = val.trim();
        }
        
        // Validate value
        if (rules[key](val)) {
          
          // Value is valid
          count++;
          
          // Filter value (if filter present)
          // Filters are tested against null, since empty strings evaluate to false
          if (key in filters && fields[key] != null) {
            fields[key] = filters[key](val);
          }
          
          // Add to valid only object
          if (validOnly) out[key] = fields[key];
          
          continue;
          
        } else if (validOnly) {
          
          continue; // We're getting only valid fields. Proceed to next property
          
        } else {
          
          // Valid is not valid, send error
          // Note: If msg callback doesn't return, the default invalid field msg is used instead
          return messages[key](val, key) || util.format(this.i18n.invalidField, val);

        }
        
      } else if (optkeys.indexOf(key) >= 0) {
        
        // If key is optional, skip & add with null value
        fields[key] = null;
        count++;
        continue;
        
      } else if (validOnly) {
       
        continue; // We're getting only valid fields. Proceed to next property
        
      } else {
        
        // Value is empty, send required fields error
        return this.i18n.missingRequiredFields;
        
      }
      
    } else if (optkeys.indexOf(key) >= 0) {
      
      // If key is optional, skip & add with null value
      fields[key] = null;
      count++;
      continue;

    } else {
      
      continue;
      
    }

  }
  
  // If not all rules were validated, send required fields error
  if (count !== rulesCount && !validOnly) {
    return this.i18n.missingRequiredFields;
  }
  
  // Remove keys that are not expected
  if (this.config.cleanup) {
    for (key in fields) {
      if (!(key in rules)) delete fields[key];
    }
  }

  // Apply post filters
  // Filters are tested against null, since empty strings evaluate to false
  for (key in postFilters) {
    if (validOnly) {
      if (key in out && out[key] != null) {
        out[key] = postFilters[key].call(this, out[key], out);
      }
    } else if (key in rules && fields[key] != null) {
      fields[key] = postFilters[key].call(this, fields[key], fields);
    }
  }
  
  if ((len=postValidations.length)) {
    for (var len,i=0; i < len; i++) {
      // The postValidation function is passed [fields, validOnly]
      // which will allow the function to mutate the fields object
      // as it sees fit, based on its validation criteria.
      err = postValidations[i].call(this, validOnly ? out : fields, validOnly);
      if (err && !validOnly) return err;
    }
  }
  
  // Return success
  return (validOnly) ? out : null;

}

function addRule(ob, msg, optional) {
  
  // Runs in validator context
  
  var msgCallback, key, validator;
  
  // Set default msg if not set
  if (typeof msg == 'undefined') msg = this.i18n.invalidField;
  
  // Set validation callback
  if (msg instanceof Function) {
    msgCallback = msg;
  } else if (typeof msg == 'string' || msg instanceof String) {
    msgCallback = (function(message) {
      return function(val) {
        return message.replace('%s', val);
      }
    })(msg)
  } else {
    throw new Error(util.format("Validator: Invalid message: %s", msg));
  }
  
  // Set validation rules
  for (key in ob) {
    
    // Set optional key
    if (optional) this.optional.push(key);

    // Set validation message
    this.messages[key] = msgCallback;

    // Set validation rules
    validator = ob[key];
    
    if (validator instanceof RegExp) { // Regex validator
      
      this.rules[key] = (function(re) {
        return function(str) {
          return re.test(str);
        }
      })(validator);
      
    } else if (validator instanceof Function) { // Function validator
      
      this.rules[key] = validator;
      
    } else if (typeof validator == 'string') { // Regex Alias validator
      
      var regex = app.regex[validator];
      
      if (regex instanceof RegExp) {
        this.rules[key] = (function(re) {
          return function(str) {
            return re.test(str);
          }
        })(regex);
      } else {
        throw new Error(util.format("Validator: RegExp alias not found: app.regex['%s']", validator));
      }
      
    } else {
      
      throw new Error("Validator: invalid validation data provided");
      
    }
    
  }
  
  return this;

}

module.exports = Validator;
