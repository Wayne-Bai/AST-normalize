/*globals YAHOO */
XC.Test.ConnectionAdapter = new YAHOO.tool.TestCase({
  name: 'XC Connection Adapter Tests',

  testInterface: function () {
    var Assert = YAHOO.util.Assert;

    Assert.isNotUndefined(XC.ConnectionAdapter.jid);
    Assert.isNotUndefined(XC.ConnectionAdapter.send);
    Assert.isNotUndefined(XC.ConnectionAdapter.registerHandler);
    Assert.isNotUndefined(XC.ConnectionAdapter.unregisterHandler);

    Assert.isFunction(XC.ConnectionAdapter.jid,
                      'XC.ConnectionAdapter.jid is not a function.');
    Assert.isFunction(XC.ConnectionAdapter.send,
                      'XC.ConnectionAdapter.send is not a function.');
    Assert.isFunction(XC.ConnectionAdapter.registerHandler,
                      'XC.ConnectionAdapter.registerHandler is not a function.');
    Assert.isFunction(XC.ConnectionAdapter.unregisterHandler,
                      'XC.ConnectionAdapter.unregisterHandler is not a function.');

  },

  testRequiredInterface: function () {
    var Assert = YAHOO.util.Assert;
    Assert.throws(XC.Error, XC.ConnectionAdapter.jid,
                  'Calling jid() without overriding the function SHOULD throw an error');
    Assert.throws(XC.Error, XC.ConnectionAdapter.send,
                  'Calling send() without overriding the function SHOULD throw an error');
    Assert.throws(XC.Error, XC.ConnectionAdapter.registerHandler,
                  'Calling registerHandler() without overriding the function SHOULD throw an error');

    Assert.throws(XC.Error, XC.ConnectionAdapter.unregisterHandler,
                  'Calling unregisterHandler() without overriding the function SHOULD throw an error');
  }
});

YAHOO.tool.TestRunner.add(XC.Test.ConnectionAdapter);
