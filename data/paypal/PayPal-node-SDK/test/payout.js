/* Copyright 2015 PayPal */
"use strict";

var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

var paypal = require('../');
require('./configure');

describe('SDK', function () {
    describe('Payout', function () {
        var payout_id = 'R3LFR867ESVQY';
        var payout_item_id = 'VXURV6Y48P898';
        var sender_batch_id = "t1000";
        var sender_single_id = "t400";
        var sender_batch_id_rt = "t100";
        var payout_single_id = 'MKCGQ59GDWAQU';

        var create_batch_payout_json = {
            "sender_batch_header": {
                "sender_batch_id": sender_batch_id,
                "email_subject": "You have a payment"
            },
            "items": [
                {
                    "recipient_type": "EMAIL",
                    "amount": {
                        "value": 0.99,
                        "currency": "USD"
                    },
                    "receiver": "shirt-supplier-one@mail.com",
                    "note": "Thank you.",
                    "sender_item_id": "item_1"
                },
                {
                    "recipient_type": "EMAIL",
                    "amount": {
                        "value": 0.90,
                        "currency": "USD"
                    },
                    "receiver": "shirt-supplier-two@mail.com",
                    "note": "Thank you.",
                    "sender_item_id": "item_2"
                },
                {
                    "recipient_type": "EMAIL",
                    "amount": {
                        "value": 0.15,
                        "currency": "USD"
                    },
                    "receiver": "shirt-supplier-three@mail.com",
                    "note": "Thank you.",
                    "sender_item_id": "item_3"
                }
            ]
        };

        var create_single_payout_json = {
            "sender_batch_header": {
                "sender_batch_id": sender_single_id,
                "email_subject": "You have a payment"
            },
            "items": [
                {
                    "recipient_type": "EMAIL",
                    "amount": {
                        "value": 0.15,
                        "currency": "USD"
                    },
                    "receiver": "shirt-supplier-three@mail.com",
                    "note": "Thank you.",
                    "sender_item_id": "item_3"
                }
            ]
        };

        var create_batch_payout_json_rt = {
            "sender_batch_header": {
                "sender_batch_id": sender_batch_id_rt,
                "email_subject": "You have a payment",
                "recipient_type": "EMAIL"
            },
            "items": [
                {
                    "amount": {
                        "value": 0.99,
                        "currency": "USD"
                    },
                    "receiver": "shirt-supplier-one@mail.com",
                    "note": "Thank you.",
                    "sender_item_id": "item_1"
                },
                {
                    "amount": {
                        "value": 0.15,
                        "currency": "USD"
                    },
                    "receiver": "shirt-supplier-three@mail.com",
                    "note": "Thank you.",
                    "sender_item_id": "item_3"
                }
            ]
        };

        if (process.env.NOCK_OFF !== 'true') {
            require('./mocks/payout');
        }

        it('create batch payout success', function (done) {
            paypal.payout.create(create_batch_payout_json, function (error, payout) {
                expect(error).equal(null);
                expect(payout.batch_header.payout_batch_id).to.not.equal(null);
                expect(payout.batch_header.sender_batch_header.sender_batch_id).to.equal(sender_batch_id);
                expect(payout.links).to.not.be.empty;
                done();
            });
        });

        it('get batch payout success', function (done) {
            paypal.payout.get(payout_id, function (error, payout) {
                expect(error).equal(null);
                expect(payout.batch_header.payout_batch_id).to.equal(payout_id);
                done();
            });
        });

        it('create single payout success', function (done) {
            paypal.payout.create(create_single_payout_json, 'true', function (error, payout) {
                expect(error).equal(null);
                expect(payout.batch_header.payout_batch_id).to.not.equal(null);
                expect(payout.batch_header.sender_batch_header.sender_batch_id).to.equal(sender_single_id);
                expect(payout.links).to.not.be.empty;
                expect(payout.items).to.not.be.empty;
                done();
            });
        });

        it('create batch payout success with group recipient type', function (done) {
            paypal.payout.create(create_batch_payout_json_rt, function (error, payout) {
                expect(error).equal(null);
                expect(payout.batch_header.payout_batch_id).to.not.equal(null);
                expect(payout.batch_header.sender_batch_header.sender_batch_id).to.equal(sender_batch_id_rt);
                expect(payout.links).to.not.be.empty;
                done();
            });
        });

        it('create batch payout fails on synchronous mode', function (done) {
            paypal.payout.create(create_batch_payout_json, 'true', function (error, payout) {
                expect(error.httpStatusCode).to.equal(400);
                expect(error.response.details[0].issue).to.equal('SIZE_LIMIT_EXCEEDED_FOR_SYNC_PAYOUT');
                done();
            });
        });

        it('get payout item success', function (done) {
            paypal.payoutItem.get(payout_item_id, function (error, payoutItem) {
                expect(error).equal(null);
                expect(payoutItem.payout_item_id).to.equal(payout_item_id);
                expect(payoutItem.payout_batch_id).to.not.equal(null);
                expect(payoutItem.payout_item).to.not.equal(null);
                expect(payoutItem.links).to.not.equal(null);
                done();
            });
        });

        it('cancel payout item success', function (done) {
            paypal.payoutItem.cancel(payout_item_id, function (error, payoutItem) {
                expect(error).equal(null);
                expect(payoutItem.transaction_status).to.equal("RETURNED");
                expect(payoutItem.payout_item_id).to.equal(payout_item_id);
                expect(payoutItem.payout_batch_id).to.not.equal(null);
                expect(payoutItem.payout_item).to.not.equal(null);
                expect(payoutItem.links).to.not.equal(null);
                done();
            });
        });

        it('create payout with duplicate id failure', function (done) {
            var dup_payout_id = 'tduplicate';
            create_batch_payout_json.sender_batch_header.sender_batch_id = dup_payout_id;

            paypal.payout.create(create_batch_payout_json, function (error, payout) {
                expect(error).equal(null);
                expect(payout.batch_header.payout_batch_id).to.not.equal(null);
                expect(payout.batch_header.sender_batch_header.sender_batch_id).to.equal(dup_payout_id);
                expect(payout.links).to.not.be.empty;

                paypal.payout.create(create_batch_payout_json, function (error, payout) {
                    expect(error.httpStatusCode).to.equal(400);
                    expect(error.response.name).to.equal('USER_BUSINESS_ERROR');
                    expect(error.response.details[0].field).to.equal('SENDER_BATCH_ID');
                    expect(error.response.details[0].issue).to.equal('Duplicate batch request');
                    done();
                });
            });
        });

        it('cancel payout success', function (done) {
            create_single_payout_json.sender_batch_header.sender_batch_id = "payout94";
            paypal.payout.create(create_single_payout_json, 'true', function (error, payout) {
                expect(error).equal(null);
                expect(payout.items[0].transaction_status).to.equal('UNCLAIMED');
                var payout_item_id = payout.items[0].payout_item_id;

                paypal.payoutItem.cancel(payout_item_id, function (error, payoutItemDetails) {
                    expect(payoutItemDetails.transaction_status).to.equal('RETURNED');
                    done();
                });
            });
        });

        it('item already cancelled', function (done) {
            var payout_item_id = "5UD3FSLKEZ63";
            paypal.payoutItem.cancel(payout_item_id, function (error, payoutItemDetails) {
                expect(error.httpStatusCode).to.equal(400);
                expect(error.response.name).to.equal('ITEM_ALREADY_CANCELLED');
                expect(error.response.message).to.equal('Requested item is already cancelled.');
                done();
            });
        });

        it('only items in UNCLAIMED status can be cancelled', function (done) {
            create_batch_payout_json.sender_batch_header.sender_batch_id = "batch65";
            paypal.payout.create(create_batch_payout_json, function (error, payout) {
                expect(error).equal(null);
                var payout_batch_id = payout.batch_header.payout_batch_id;
                paypal.payout.get(payout_batch_id, function (error, payoutDetails) {
                    var payout_item_id = payoutDetails.items[0].payout_item_id;
                    expect(payoutDetails.items[0].transaction_status).to.equal('PENDING');
                    paypal.payoutItem.cancel(payout_item_id, function (error, payoutItemDetails) {
                        expect(error.httpStatusCode).to.equal(400);
                        expect(error.response.name).to.equal('ITEM_INCORRECT_STATUS');
                        expect(error.response.message).to.equal('Only items in Unclaimed status can be cancelled.');
                        done();
                    });
                });
            });
        });
    });
});
