/* Copyright 2015 PayPal */
"use strict";

var paypal = require('../../');
require('../configure');

var data = {
    "amount": {
        "currency": "USD",
        "total": "0.01"
    }
},
saleId = "3RM92092UW5126232";

paypal.sale.refund(saleId, data, function (error, refund) {
    if (error) {
        throw error;
    } else {
        console.log("Refund Sale Response");
        console.log(JSON.stringify(refund));
    }

});
