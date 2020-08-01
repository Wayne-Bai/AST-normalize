"use strict";

var paypal = require('../../');
require('../configure');

var orderId = "O-20L81840AL4365052";

var authorize_details = {
    "amount": {
        "currency": "USD",
        "total": "0.80"
    }
};

paypal.order.authorize(orderId, authorize_details, function (error, authorization) {
    if (error) {
        console.log(error.response);
        console.error(error);
    } else {
        console.log(authorization);
    }
});
