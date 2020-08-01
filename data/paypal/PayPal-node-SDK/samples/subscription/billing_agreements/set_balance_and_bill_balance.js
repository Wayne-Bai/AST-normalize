/* Copyright 2015 PayPal */
"use strict";

var paypal = require('../../../');
require('../../configure');

var billingAgreementId = "I-THNVHK6X9H0V";

var outstanding_amount = {
    "value" : "10",
    "currency" : "USD"
};

paypal.billingAgreement.setBalance(billingAgreementId, outstanding_amount, function (error, response) {
    if (error) {
        console.log(error);
        throw error;
    } else {
        console.log("Billing Agreement Set Balance Response");
        console.log(response);

        var outstanding_amount_note = {
            "note": "Billing Balance Amount",
            "amount": outstanding_amount
        };

        paypal.billingAgreement.billBalance(billingAgreementId, outstanding_amount_note, function (error, response) {
            if (error) {
                console.log(error);
                throw error;
            } else {
                console.log("Billing Agreement Bill Balance Response");
                console.log(response);
            }
        });
    }
});
