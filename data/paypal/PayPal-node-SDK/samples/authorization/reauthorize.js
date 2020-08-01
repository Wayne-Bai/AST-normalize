/* Copyright 2015 PayPal */
"use strict";

var paypal = require('../../');
require('../configure');

var reauthorize_details = {
    "amount": {
        "currency": "USD",
        "total": "4.54"
    }
};

paypal.authorization.reauthorize("7GH53639GA425732B", reauthorize_details, function (error, reauthorization) {
    if (error) {
        console.error(error);
    } else {
        console.log(reauthorization);
    }
});
