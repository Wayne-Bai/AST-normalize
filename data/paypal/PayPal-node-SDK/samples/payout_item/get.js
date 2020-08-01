/* Copyright 2015 PayPal */
"use strict";

var paypal = require('../../');
require('../configure');

var payoutItemId = "DFNMVY92UC32Q";

paypal.payoutItem.get(payoutItemId, function (error, payoutItem) {
    if (error) {
        console.log(error);
        throw error;
    } else {
        console.log("Get payoutItem Response");
        console.log(JSON.stringify(payoutItem));
    }
});
