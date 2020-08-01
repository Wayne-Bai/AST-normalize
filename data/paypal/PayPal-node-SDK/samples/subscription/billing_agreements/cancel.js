/* Copyright 2015 PayPal */
"use strict";

var paypal = require('../../../');
require('../../configure');

var billingAgreementId = "I-08413VDRU6DE";

var cancel_note = {
    "note": "Canceling the agreement"
};

paypal.billingAgreement.cancel(billingAgreementId, cancel_note, function (error, response) {
    if (error) {
        console.log(error);
        throw error;
    } else {
        console.log("Cancel Billing Agreement Response");
        console.log(response);

        paypal.billingPlan.get(billingAgreementId, function (error, billingPlan) {
            if (error) {
                console.log(error.response);
                throw error;
            } else {
                console.log(billingPlan.state);
            }
        });
    }
});
