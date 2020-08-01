/* Copyright 2015 PayPal */
"use strict";

var paypal = require('../../../');
require('../../configure');

var create_webhook_json = {
    "url": "https://www.yeowza.com/paypal_webhook",
    "event_types": [
        {
            "name": "PAYMENT.AUTHORIZATION.CREATED"
        },
        {
            "name": "PAYMENT.AUTHORIZATION.VOIDED"
        }
    ]
};

paypal.notification.webhook.create(create_webhook_json, function (error, webhook) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log("Create webhook Response");
        console.log(webhook);
    }
});
