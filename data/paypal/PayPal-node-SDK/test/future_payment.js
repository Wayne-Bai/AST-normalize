/* Copyright 2015 PayPal */

"use strict";

var chai = require('chai'),
	expect = chai.expect,
	should = chai.should();

var paypal = require('../');
require('./configure');

describe('SDK', function () {
	describe('FuturePayment', function () {

		if (process.env.NOCK_OFF !== 'true') {
			require('./mocks/future_payment');
		}

		it('fail with bad auth code', function (done) {
			paypal.generateToken({'authorization_code': 'invalid_code'}, function (error, generatedToken) {
				expect(error.httpStatusCode).equal(400);
				expect(error.response.error_description).equal('Invalid auth code');
				done();
			});
		});

		//Set up payment details
        var create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": "1.00"
                },
                "description": "This is the payment description."
            }]
        };

        it('redirect uri required for paypal payment without refresh token', function (done) {
			paypal.payment.create(create_payment_json, function (error, payment) {
				expect(error.httpStatusCode).equal(400);
				expect(error.response.name).equal('VALIDATION_ERROR');
				expect(error.response.details[0].field).equal('redirect_urls');
				expect(error.response.details[0].issue).equal('This field required when payment_method is \'paypal\'');
				done();
			});
		});

		it('fail with bad refresh token', function (done) {
			paypal.payment.create(create_payment_json, {'refresh_token': 'invalid_token'}, function (error, payment) {
				expect(error.httpStatusCode).equal(400);
				expect(error.response.error_description).equal('Invalid refresh token');
				done();
			});
		});
	});
});
