/* Copyright 2015 PayPal */
"use strict";

var paypal = require('../../');
require('../configure');

var new_credit_card_details = {
    "type": "visa",
    "number": "4417119669820331",
    "expire_month": "11",
    "expire_year": "2019"
};

paypal.creditCard.create(new_credit_card_details, function (error, credit_card) {
    if (error) {
        throw error;
    } else {
        paypal.creditCard.del(credit_card.id, function (error, no_response) {
            if (error) {
                throw error;
            } else {
                console.log("CreditCard deleted.");
            }
        });
    }
});
