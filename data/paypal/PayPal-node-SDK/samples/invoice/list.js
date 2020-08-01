/* Copyright 2015 PayPal */
"use strict";

var paypal = require('../../');
require('../configure');

paypal.invoice.list(function (error, invoices) {
    if (error) {
        throw error;
    } else {
        console.log("List invoices Response");
        console.log(JSON.stringify(invoices));
    }
});
