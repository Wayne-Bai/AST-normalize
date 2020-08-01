/* Copyright 2015 PayPal */
"use strict";

var paypal = require('../../../');
require('../../configure');

var webhookId = "70Y03947RF112050J";

var webhook_replace_attributes = [
        {
            "op": "replace",
            "path": "/url",
            "value": "https://www.yeowza.com/paypal_webhook_url"
        },
        {
            "op": "replace",
            "path": "/event_types",
            "value": [
                {
                    "name": "PAYMENT.SALE.REFUNDED"
                }
            ]
        }
    ];

paypal.notification.webhook.replace(webhookId, webhook_replace_attributes, function (error, results) {
    if (error) {
        console.log(error);
        throw error;
    } else {
        console.log("Events for this webhook: ");
        console.log(results);
    }
});
