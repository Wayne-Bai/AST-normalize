
var app =require('../fixtures/bootstrap'),
    vows = require('vows'),
    assert = require('assert'),
    util = require('util'),
    sanitizer = require('sanitizer');

vows.describe('lib/validator.js').addBatch({
  
  '': {
    
    topic: function() {
      
      // Tested:
      // --------------------------
      // Regex validation keys
      // Callback as message
      // Callback as validator
      // Message strings
      // Using %s in message strings
      // Default messages
      
      var validator = app.validator({cleanup: true})
      .add({first: /^John Doe$/, last: 'alpha_spaces'}, function(val, key) { return util.format('cb:error [%s] -> %s', key, val) })
      .add({email: 'email'}, "The email is invalid: %s") 
      .add([{msg: 'alpha'}])  // array arg test for [add]
      .addOptional({some: function(val) { return (/^[a-z]$/).test(val); }})
      .addOptional([{count: 'integer'}, "Not an integer value"]); // array arg test for [addOptional]
      
      return validator;
      
    },
    
    'Properly validates objects': function(validator) {
      
      // Prints missing required fields on empty object
      assert.equal(validator.validate({}), validator.i18n.missingRequiredFields);
  
      // Fails to validate only one key when more are required (even if it matches)
      assert.equal(validator.validate({first: "John Doe"}), validator.i18n.missingRequiredFields);
  
      // Returns error msg when value is not validated
      assert.equal(validator.validate({first: "Jane Doe"}), "cb:error [first] -> Jane Doe");
  
      // Returns error msg replacing placeholders (%s)
      assert.equal(validator.validate({email: 'invalid.email'}), "The email is invalid: invalid.email");
      
      // Optional validation rules errors & default error
      assert.equal(validator.validate({some: 99}), util.format(validator.i18n.invalidField, 99));
      
      // Regular error message
      assert.equal(validator.validate({count: 'abc123'}), "Not an integer value");
      
      // Validates required values only
      assert.isNull(validator.validate({
        first: "John Doe",
        last: "Jane Doe",
        email: '1@2.com',
        msg: "MyMessage"
      }));
      
      // Fails to validate if a required value is missing
      assert.equal(validator.validate({
        first: "John Doe",
        last: "Jane Doe",
        // email: '1@2.com',
        msg: "MyMessage"
      }), validator.i18n.missingRequiredFields);
      
      // Fails to validate an optional value
      assert.equal(validator.validate({
        first: "John Doe",
        last: "Jane Doe",
        email: '1@2.com',
        msg: "MyMessage",
        some: 99
      }), util.format(validator.i18n.invalidField, 99));
      
      ////////////////
      
      // NOTE: The validator automatically trims the values
      
      var fields = {
        first: "                       John Doe                  ",
        last: "Jane Doe",
        email: '1@2.com            ',
        msg: "            MyMessage",
        some: 'c',
        count: 101,
        extra1: 102,
        extra2: 103,
        extra3: 104
      };
      
      // Validates all values
      assert.isNull(validator.validate(fields));
      
      // Removes unwanted options from validation when {cleanup: true}
      // NOTE: the altered object should have trimmed values
      
      assert.deepEqual(fields, {
        first: "John Doe",
        last: "Jane Doe",
        email: '1@2.com',
        msg: "MyMessage",
        some: 'c',
        count: 101,
      });
      
      ////////////////
  
      validator = app.validator({cleanup: false}).add({number: 'integer'});
  
      fields = {
        number: true,
        hello: "world",
        other: null
      };
  
      // Prints validation error 
      assert.equal(validator.validate(fields), util.format(validator.i18n.invalidField, true));
      
      // Object is not altered on validation failure
      assert.deepEqual(fields, {
        number: true,
        hello: "world",
        other: null
      });
      
      ////////////////
      
      fields.number = 99;
      
      // Object is altered on validation success
      assert.isNull(validator.validate(fields));
      assert.deepEqual(fields, {
        number: 99,
        hello: "world",
        other: null
      });
      
      ////////////////
  
      validator = app.validator()
        .addOptional({tag: 'alpha'});
  
      // Doesn't return errors on optional values
      assert.isNull(validator.validate({}));
  
      ////////////////
  
      validator = app.validator()
        .add({name: 'alpha'})
        .addOptional({tag: 'alpha'});
  
      // Returns errors if required values missing
      assert.equal(validator.validate({}), "Missing Required Fields");
      
      fields = {
        name: 'ernie',
        tag: ''
      }
      
      // Accepts empty optional values
      assert.isNull(validator.validate(fields));
      
      assert.deepEqual(fields, {
        name: 'ernie',
        tag: null
      });
      
      ////////////////
      
      validator = app.validator()
        .add({name: 'alpha'}, function() {});
        
      // Returns invalid message when validator function doesn't return
      assert.equal(validator.validate({name: '1234'}), 'Invalid: 1234');
      
      ////////////////
      
      validator = app.validator()
        .add({firstname: 'alpha'})
        .add({lastname: 'alpha'})
        .add({age: 'integer'})
        .add({count: 'number'})
        .add({some: 'anything'});
        
      validator.filter({
        firstname: validator.fn.toUpperCase,
        lastname: validator.fn.toLowerCase,
        age: validator.fn.toInteger,
        count: validator.fn.toFloat
      });
      
      validator.postFilter({
        age: function(val) {
          return val + 1;
        },
        count: function(val) {
          return val + 2;
        }
      });
      
      var valid1 = validator.getValid({
        firstname: "1",
        lastname: '2',
        age: 'a',
        count: 'b'
      });
      
      // Should return an empty object if no fields validated
      assert.deepEqual(valid1, {});
      
      var valid2 = validator.getValid({
        firstname: "John",
        lastname: "Doe",
        age: 'a',
        count: 'b'
      });
      
      // Should only return the valid fields + filters applied
      assert.deepEqual(valid2, {firstname: "JOHN", lastname: "doe"});
      
      var valid3 = validator.getValid({
        firstname: "John",
        lastname: "Doe",
        age: '29',
        count: '55.2'
      });
      
      // Should return all valid fields + filters & postfilters applied
      assert.deepEqual(valid3, {
        firstname: "JOHN",
        lastname: "doe",
        age: 30, // Gets added 1 on the post filter
        count: 57.2 // Gets added 2 on the post filter
      });
      
      var valid4 = validator.getValid({});
      
      // Should return an empty object if no fields passed. If there are required fields, 
      // it should just continue the validation instead of returning the validation error.
      assert.deepEqual(valid4, {});
      
    }
    
  },
  
  'Properly applies filters': function() {
    
    var validator = app.validator()
      .addOptional({name: 'alpha'})
      .addOptional({some: 'anything'})
      .addOptional({age: 'integer'})
      .filter({
        name: function(val) {
          return new Buffer(val).toString('base64')
        },
        age: function(val) {
          return app.md5(val.toString());
        }
      })
      .postFilter({
        age: function(md5) {
          return md5.toUpperCase();
        }
      });
      
    var fields = {
      name: 'Ernie',
      age: 29,
      some: '--UNCHANGED--'
    }
    
    validator.validate(fields);
    
    var expected = { 
      name: 'RXJuaWU=',                             // Affected by base64 filter
      age: '6EA9AB1BAA0EFB9E19094440C317E21B',      // Affected by md5 filter and the post filter
      some: '--UNCHANGED--'                         // Remains unchanged (no filter)
    }
    
    assert.deepEqual(fields, expected);
    
    // Filters applied to values only when present
    // Values are guaranteed to be strings
    
    fields = {};
    
    expected = validator.validate(fields);
    
    assert.isNull(expected);
    assert.deepEqual(fields, {
      name: null,
      age: null,
      some: null
    });
  
  },
  
  'Properly applies post validation': function() {

    var validator = app.validator();
    
    validator.context(function() {
      this.add({one: 'anything'});
      this.add({two: 'anything'});
      this.add({three: 'anything'});
    });
    
    // 1st postValidate function
    
    validator.postValidate(function(fields, validOnly) {
      
      if (fields.one !== fields.two) {
        if (validOnly) {
          delete fields.one;
          delete fields.two;
        } else {
          return "One and Two are different";
        }
      }
      
      if (fields.three !== 'three') {
        if (validOnly) {
          delete fields.three;
        } else {
          return "Three is not three";
        }
      }
      
    });
    
    // 2nd postValidate function
    
    validator.postValidate(function(fields, validOnly) {
      
      if (fields.one === 'heya' && fields.two === 'heya') {
        if (validOnly) {
          delete fields.one;
          delete fields.two;
        } else {
          return "One and Two are heya";
        }
      }
      
    });
    
    var err, valid, fields;

    
    //////////////////////////////
    /// 1st Post Validation
    //////////////////////////////

    
    // Test errors
    
    err = validator.validate(fields={
      one: 'one',
      two: 'two',
      three: 'three'
    });
    
    assert.equal(err, "One and Two are different");
    
    assert.deepEqual(fields, {
      one: 'one',
      two: 'two',
      three: 'three'
    });
    
    // Test another error
    
    err = validator.validate(fields={
      one: 'blah',
      two: 'blah',
      three: 'four'
    });
    
    assert.equal(err, "Three is not three");
    
    assert.deepEqual(fields, {
      one: 'blah',
      two: 'blah',
      three: 'four'
    });
    
    // When all fields are valid
    
    err = validator.validate(fields={
      one: 'one',
      two: 'one',
      three: 'three'
    });
    
    assert.isNull(err);
    
    assert.deepEqual(fields, { // Not mutated
      one: 'one',
      two: 'one',
      three: 'three'
    });
    
    // When validOnly and not all fields are invalid
    
    valid = validator.getValid(fields={
      one: 'one',
      two: 'two',
      three: 'three'
    });
    
    assert.deepEqual(valid, {
      three: 'three'
    });

    assert.deepEqual(fields, { // Not mutated
      one: 'one',
      two: 'two',
      three: 'three'
    });
    
    // When validOnly and all fields are invalid
    
    valid = validator.getValid(fields={
      one: '1',
      two: '2',
      three: '3'
    });
    
    assert.deepEqual(valid, {});
    
    assert.deepEqual(fields, { // Not mutated
      one: '1',
      two: '2',
      three: '3'
    });

    
    //////////////////////////////
    /// 2nd Post Validation
    //////////////////////////////
    
    
    // NOTE: When no errors tested above
    // NOTE: When validOnly and all fields valid tested above
    
    // Test error
    
    err = validator.validate(fields={
      one: 'heya',
      two: 'heya',
      three: 'three'
    });
    
    assert.equal(err, "One and Two are heya");
    
    assert.deepEqual(fields, {
      one: 'heya',
      two: 'heya',
      three: 'three'
    });
    
    // When validOnly and not all fields are invalid
    
    valid = validator.getValid(fields={
      one: 'heya',
      two: 'heya',
      three: 'three'
    });
    
    assert.deepEqual(valid, {three: 'three'});
    
    assert.deepEqual(fields, {
      one: 'heya',
      two: 'heya',
      three: 'three'
    });
    
    // When validOnly and all fields are invalid
    
    valid = validator.getValid(fields={
      one: 'heya',
      two: 'heya',
      three: 'blah'
    });
    
    assert.deepEqual(valid, {});
    
    assert.deepEqual(fields, {
      one: 'heya',
      two: 'heya',
      three: 'blah' 
    });
    
    
    /////////////////////////////////////////////////////////////////////////////////////////
    /// Execution order
    /// postValidation should run after postFilters (which themselves run after filters)
    /////////////////////////////////////////////////////////////////////////////////////////
    
    
    // Post Validation runs after postFilters() are applied
    
    validator.postFilter({
      one: validator.fn.toUpperCase
    });
    
    err = validator.validate(fields={
      one: 'blah',
      two: 'blah',
      three: 'three'
    });
    
    assert.equal(err, "One and Two are different"); // two has been converted to uppercase
    
    assert.deepEqual(fields, {
      one: 'BLAH',
      two: 'blah',
      three: 'three'
    });
    
    // Add another post filter to convert two to uppercase
    
    validator.postFilter({
      two: validator.fn.toUpperCase
    });
    
    err = validator.validate(fields={
      one: 'blah',
      two: 'blah',
      three: 'three'
    });
    
    assert.isNull(err); // BLAH == BLAH, therefore no errors
    
    assert.deepEqual(fields, {
      one: 'BLAH',
      two: 'BLAH',
      three: 'three'
    });
    
  },
  
  'Built-in filters return valid results': function() {
    
    var validator = app.validator();
    
    var exclude = [
      'typecast',
      'escape',
      'sanitize',
      'md5',
      'encodeURI',
      'encodeURIComponent',
      'decodeURI',
      'decodeURIComponent'];
    
    for (var method in validator.fn) {
      if (exclude.indexOf(method) === -1) {
        var ob = {}, filter = {};
        ob[method] = 'anything';
        filter[method] = validator.fn[method];
        validator.add(ob);
        validator.filter(filter);
      }
    }
    
    assert.strictEqual(validator.fn.typecast, protos.util.typecast);
    assert.strictEqual(validator.fn.escape, sanitizer.escape);
    assert.strictEqual(validator.fn.sanitize, sanitizer.sanitize);
    assert.strictEqual(validator.fn.md5, app.md5);
    assert.strictEqual(validator.fn.encodeURI, encodeURI);
    assert.strictEqual(validator.fn.encodeURIComponent, encodeURIComponent);
    assert.strictEqual(validator.fn.decodeURI, decodeURI);
    assert.strictEqual(validator.fn.decodeURIComponent, decodeURIComponent);
    
    var subject = {
      sanitizeEscape: '<p>Hello <script type="text/javascript">throw new Error();</script></p>',
      base64: 'Hello World!',
      toInteger: '5',
      toFloat: '2.5',
      toLowerCase: 'Hello World',
      toUpperCase: 'Hello World'
    }
    
    var err = validator.validate(subject);
    
    assert.isNull(err);
    
    assert.deepEqual(subject, {
      sanitizeEscape: '&lt;p&gt;Hello &lt;/p&gt;',
      base64: 'SGVsbG8gV29ybGQh',
      toInteger: 5,
      toFloat: 2.5,
      toLowerCase: 'hello world',
      toUpperCase: 'HELLO WORLD'
    });
    
  },
  
  'Throws on invalid validation data': function() {
    try {
      app.validator().add({value: 99})
    } catch(e) {
      assert.strictEqual(e.toString(), "Error: Validator: invalid validation data provided");
    }
  },
  
  'Properly sets and gets contexts': function() {
    
    var validator = app.validator();
    var Validator = validator.constructor;
    var arglen = {};
    var instance = {};
    
    var foo = validator.context('foo', function() {
      instance.foo = this;
      arglen.foo = arguments.length;
    });
    
    var bar = validator.context('bar', function() {
      instance.bar = this;
      arglen.bar = arguments.length;
    });
    
    assert.strictEqual(foo, validator);
    assert.strictEqual(bar, validator);
    assert.strictEqual(instance.foo, validator.context('foo'));
    assert.strictEqual(instance.bar, validator.context('bar'));
    assert.strictEqual(instance.foo, validator.__context.foo);
    assert.strictEqual(instance.bar, validator.__context.bar);
    assert.instanceOf(instance.foo, Validator);
    assert.instanceOf(instance.bar, Validator);
    assert.isFalse(instance.foo === instance.bar);
    assert.deepEqual(arglen, {foo: 0, bar: 0});
    
    try {
      validator.context('foo', 1);
    } catch(e) {
      assert.instanceOf(e, Error);
      assert.equal(e.toString(), 'Error: Expecting function');
    }
    
    try {
      validator.context('', function() {});
    } catch(e) {
      assert.instanceOf(e, Error);
      assert.equal(e.toString(), 'Error: Expecting context');
    }
    
  },
  
  'Running context(func) runs with instance': function() {
    var instance, validator = app.validator();
    validator.context(function() {
      instance = this;
    });
    assert.strictEqual(instance, validator);
  },
  
  'Properly sets context aliases': function() {
    
    var instance, validator = app.validator();
    
    validator.context('foo bar baz', function() {
      instance = this;
    });
    
    var foo = validator.context('foo');
    var bar = validator.context('bar');
    var baz = validator.context('baz');
    
    assert.strictEqual(foo, instance);
    assert.strictEqual(bar, instance);
    assert.strictEqual(baz, instance);
    
  },
  
  'Properly gets/sets multiple contexts': function() {
    
    var customInstance = app.validator();
    var validator = app.validator();

    var one, two;
    
    validator.context({
      
      one: function(v) {
        if (this === v) {
          one = this;
        }
      },
      
      two: function(v) {
        if (this === v) {
          two = this;
        }
      },
      
      three: customInstance,
      
      four: 4, // Should be ignored
      
      five: {} // Should be ignored
      
    });
    
    // Checking multiple contexts being set
    assert.strictEqual(one, validator.context('one'));
    assert.strictEqual(two, validator.context('two'));
    assert.strictEqual(customInstance, validator.context('three'));

    // Invalid properties in context object are ignored
    assert.isUndefined(validator.context('four'));
    assert.isUndefined(validator.context('five'));
    
    // Validator.prototype.getContexts() returns the internal context representation
    assert.strictEqual(validator.__context, validator.getContexts());
    
  }
  
}).addBatch({
  
  '': {
    
    topic: function() {
      
      var validator = app.validator();
    
      validator.add({one: 'anything'});
  
      validator.filter({
        one: null
      });
    
    },
  
    "Throws when passing non-function to filter()": function(e) {
      assert.instanceOf(e, Error);
      assert.equal(e.toString(), 'Error: Function expected for filter: one');
    }
    
  },
  
  ' ': {
    
    topic: function() {
      
      var validator = app.validator();
    
      validator.add({one: 'anything'});
  
      validator.postFilter({
        one: null
      });
    
    },
  
    "Throws when passing non-function to postFilter()": function(e) {
      assert.instanceOf(e, Error);
      assert.equal(e.toString(), 'Error: Function expected for filter: one');
    }

  },
  
  '  ': {
    
    topic: function() {
      
      var validator = app.validator();
    
      validator.add({one: 'anything'});
  
      validator.postValidate(null);
    
    },
  
    "Throws when passing non-function to postValidate()": function(e) {
      assert.instanceOf(e, Error);
      assert.equal(e.toString(), 'Error: Validator::postValidate() expects function');
    }

  }
  
}).export(module);
