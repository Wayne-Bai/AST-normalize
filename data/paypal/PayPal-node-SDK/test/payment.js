/* Copyright 2015 PayPal */
"use strict";

var chai = require('chai'),
	expect = chai.expect,
	should = chai.should(),
    util = require('../lib/utils'),
    url = require('url');

var paypal = require('../');
require('./configure');

describe('SDK', function () {
	describe('Payment', function () {
        var create_payment_json_card = {
            "intent": "sale",
            "payer": {
                "payment_method": "credit_card",
                "funding_instruments": [{
                    "credit_card": {
                        "type": "visa",
                        "number": "4417119669820331",
                        "expire_month": "11",
                        "expire_year": "2018",
                        "cvv2": "874"
                    }
                }]
            },
            "transactions": [{
                "amount": {
                    "total": "7",
                    "currency": "USD",
                    "details": {
                        "subtotal": "5",
                        "tax": "1",
                        "shipping": "1"
                    }
                },
                "description": "This is the payment transaction descriptiön."
            }]
        };

        var discount_amount = "-2.00";
        var shipping = "1.00";
        var handling_fee = "1.00";
        var insurance = "1.00";
        var shipping_discount = "1.00";

        var create_payment_extra_parameters = {
            "intent": "sale",
            "redirect_urls": {
                "return_url": "http://www.return.com",
                "cancel_url": "http://www.cancel.com"
            },
            "payer": {
                "payment_method": "paypal",
                "payer_info": {
                    "tax_id_type": "BR_CPF",
                    "tax_id": "Fh618775690"
                }
            },
            "transactions": [
                {
                    "amount": {
                        "total": "34.07",
                        "currency": "USD",
                        "details": {
                            "subtotal": "30.00",
                            "tax": "0.07",
                            "shipping": shipping,
                            "handling_fee": handling_fee,
                            "shipping_discount": shipping_discount,
                            "insurance": insurance
                        }
                    },
                    "description": "This is the payment transaction description.",
                    "custom": "EBAY_EMS_90048630024435",
                    "invoice_number": "48787589677",
                    "payment_options": {
                        "allowed_payment_method": "INSTANT_FUNDING_SOURCE"
                    },
                    "soft_descriptor": "ECHI5786786",
                    "item_list": {
                        "items": [
                            {
                                "name": "bowling",
                                "description": "Bowling Team Shirt",
                                "quantity": "5",
                                "price": "3",
                                "tax": "0.01",
                                "sku": "1",
                                "currency": "USD"
                            },
                            {
                                "name": "mesh",
                                "description": "80s Mesh Sleeveless Shirt",
                                "quantity": "1",
                                "price": "17",
                                "tax": "0.02",
                                "sku": "product34",
                                "currency": "USD"
                            },
                            {
                                "name": "discount",
                                "quantity": "1",
                                "price": discount_amount,
                                "sku": "product",
                                "currency": "USD"
                            }
                        ],
                        "shipping_address": {
                            "recipient_name": "Betsy Buyer",
                            "line1": "111 First Street",
                            "city": "Saratoga",
                            "country_code": "US",
                            "postal_code": "95070",
                            "state": "CA"
                        }
                    }
                }
            ]
        };

        if (process.env.NOCK_OFF !== 'true') {
            require('./mocks/payment');
        }

        it('create with credit_card', function (done) {
            paypal.payment.create(create_payment_json_card, function (error, payment) {
                expect(error).equal(null);
                expect(payment.id).to.contain('PAY-');

                paypal.payment.get(payment.id, function (error, payment) {
                    expect(error).equal(null);
                    expect(payment.state).to.contain('approved');
                    done();
                });
            });
        });

        it('list', function (done) {
            paypal.payment.list({ "count": 2 }, function (error, payment_history) {
                expect(error).equal(null);
                expect(payment_history.count).equal(2);
                done();
            });
        });

        it('create with paypal with extra parameters', function (done) {
            paypal.payment.create(create_payment_extra_parameters, function (error, payment) {
                expect(error).to.equal(null);
                expect(payment.id).to.contain('PAY-');

                //Validate tax information
                expect(payment.payer.payer_info.tax_id).to.equal(create_payment_extra_parameters.payer.payer_info.tax_id);
                expect(payment.payer.payer_info.tax_id_type).to.equal(create_payment_extra_parameters.payer.payer_info.tax_id_type);

                //Check for handling_fee, insurance, shipping_discount
                expect(payment.transactions[0].amount.details.shipping).to.equal(shipping);
                expect(payment.transactions[0].amount.details.handling_fee).to.equal(handling_fee);
                expect(payment.transactions[0].amount.details.insurance).to.equal(insurance);
                expect(payment.transactions[0].amount.details.shipping_discount).to.equal(shipping_discount);

                //Check for negative priced item
                for (var i = 0; i < payment.transactions[0].item_list.length; i++) {
                    var item = payment.transactions[0].item_list[i];
                    if (item.name === 'discount') {
                        expect(item.price).to.equal(discount_amount);
                    }
                }
                done();
            });
        });

        it('verify hateos endpoint matches configurations', function (done) {
            var paymentId = "PAY-0XL713371A312273YKE2GCNI";

            paypal.payment.get(paymentId, function (error, payment) {
                expect(error).equal(null);
                var hateos_hostname = url.parse(payment.links[0].href, true).host;
                var api_endpoint = util.getDefaultApiEndpoint(paypal.configuration.mode);
                expect(hateos_hostname).to.equal(api_endpoint);
                done();
            });
        });
    });
});
