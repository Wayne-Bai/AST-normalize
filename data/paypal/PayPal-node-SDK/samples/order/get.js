/* Copyright 2015 PayPal */
"use strict";

var paypal = require('../../');
require('../configure');

var orderId = "O-20L81840AL4365052";

paypal.order.get(orderId, function (error, order) {
    if (error) {
        console.log(error);
        throw error;
    } else {
        console.log("Get Order Response");
        console.log(JSON.stringify(order));
    }
});
