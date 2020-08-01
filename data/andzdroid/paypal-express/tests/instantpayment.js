var PaypalExpress = require('../lib/paypal-express');

var USERNAME = 'sdk-three_api1.sdk.com';
var PASSWORD = 'QFZCWN5HZM8VBG7Q';
var SIGNATURE = 'A-IzJhZZjhg29XQ2qnhapuwxIDzyAZQ92FRP5dqBzVesOkzbdUONzmOU';

module.exports['Begin Instant Payment'] = function(test) {
  var paypalExpress = new PaypalExpress(USERNAME, PASSWORD, SIGNATURE);
  paypalExpress.useSandbox(true);

  paypalExpress.beginInstantPayment({
    'RETURNURL': 'http://www.google.com/',
    'CANCELURL': 'http://www.google.com/',
    'PAYMENTREQUEST_0_AMT': 1
  }, function(err, data) {
    if (err) {
      test.ok(false, err);
      test.done();
    }

    if (data) {
      console.log(data);
      test.ok(true);
      test.done();
    }
  });
};
