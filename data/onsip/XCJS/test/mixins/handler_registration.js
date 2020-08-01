/*globals YAHOO */
XC.Test.HandlerRegistration = new YAHOO.tool.TestCase({
  name: 'XC Handler Registration Tests',

  setUp: function () {
    this.conn = XC.Test.MockConnection.extend().init();
    this.xc = XC.Connection.extend({connectionAdapter: this.conn});
  },

  tearDown: function () {
    delete this.conn;
    delete this.xc;
  },

  testMixin: function () {
    var Assert = YAHOO.util.Assert;
    Assert.isObject(XC.Mixin.HandlerRegistration, 'XC.Mixin.HandlerRegistration is not an object');
  },

  testRegisterHandler: function() {
    var Assert = YAHOO.util.Assert;

    var tmp = XC.Base.extend(XC.Mixin.HandlerRegistration);
    Assert.isFunction(tmp.registerHandler, 'registerHandler is not a function');

    Assert.isTrue(tmp.registerHandler('onEvent', function() {}),
                  'Failed to register handler with 2 arg version');
    Assert.isTrue(tmp.registerHandler('onEvent', function() {}, this),
                  'Failed to register handler with 3 arg version');

    Assert.isFalse(tmp.registerHandler('onEvent'),
                   'Should not return success with a non callable callback');
  },

  testFireHandler: function() {
    var Assert = YAHOO.util.Assert;

    var tmp = XC.Base.extend(XC.Mixin.HandlerRegistration),
      assertion = false;

    Assert.isFunction(tmp.fireHandler, 'fireHandler is not a function');
    tmp.registerHandler('onEvent', function() {
                          assertion = true;
                        });
    tmp.fireHandler('onEvent');
    Assert.isTrue(assertion, 'assertion should be true');

    // test context
    var assertionThis;
    tmp.registerHandler('onEvent2', function() {
                          assertionThis = this;
                        });
    tmp.fireHandler('onEvent2');
    Assert.areSame(tmp, assertionThis, 'registered handler has wrong target in 2 arg case');

    var target = {};
    assertionThis = null;
    tmp.registerHandler('onEvent3', function() {
                          assertionThis = this;
                        }, target);
    tmp.fireHandler('onEvent3');
    Assert.areSame(target, assertionThis, 'registered handler has wrong target in 3 arg case');

    // override a handler
    assertionThis = null;
    assertion = false;
    tmp.registerHandler('onEvent3',function() {
                          assertion = true;
                        });
    tmp.fireHandler('onEvent3');
    Assert.isTrue(assertion, 'handler should be overriden ');

    // extend a registration service
    assertionThis = null;
    assertion = false;

    var extended = tmp.extend();
    extended.fireHandler('onEvent3');
    Assert.isTrue(assertion, 'registered handler did not fire after extend');

    assertion = false;
    extended.registerHandler('onEvent4', function() { assertion = true; });
    tmp.fireHandler('onEvent4');
    Assert.isFalse(assertion, 'a handler registered after extension should not fire from the parent');
  },

  testFireHandlerWithArguments: function() {
    var Assert = YAHOO.util.Assert;

    var tmp = XC.Base.extend(XC.Mixin.HandlerRegistration),
      cbArgs = null,
      arg1 = 1;

    tmp.registerHandler('onEvent', function() {
                          cbArgs = Array.from(arguments);
                        });

    tmp.fireHandler('onEvent', arg1);
    Assert.areEqual(1, cbArgs.length, 'cbArgs should have length 1');
    Assert.areEqual(arg1, cbArgs[0], 'arg1 is not the same');
  },

  testHandlersAreUnique: function() {
    var Assert = YAHOO.util.Assert;

    var tmp1 = XC.Base.extend(XC.Mixin.HandlerRegistration),
      tmp2 = XC.Base.extend(XC.Mixin.HandlerRegistration),
      assertion1 = false,
      assertion2 = false;

    // ensures the onEvent callbacks are stored in unique
    // objects, instead of a singleton or prototype object
    tmp1.registerHandler('onEvent', function() {
                          assertion1 = true;
                        });
    tmp2.registerHandler('onEvent', function() {
                          assertion2 = true;
                        });

    tmp1.fireHandler('onEvent');
    Assert.isTrue(assertion1, 'assertion1 should be true');
    Assert.isFalse(assertion2, 'assertion2 should be false');
  }

});

YAHOO.tool.TestRunner.add(XC.Test.HandlerRegistration);
