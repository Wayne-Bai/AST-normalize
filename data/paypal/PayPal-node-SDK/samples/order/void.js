"use strict";

var paypal = require('../../');
require('../configure');

var orderId = "O-20L81840AL4365052";

paypal.order.void(orderId, function (error, order) {
    if (error) {
        console.error(error);
    } else {
        console.log(order);
    }
});
