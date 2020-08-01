/* Copyright 2015 PayPal */
"use strict";

var paypal = require('../../../');
require('../../configure');

paypal.notification.webhookEventType.list(function (error, webhookEventTypes) {
    if (error) {
        throw error;
    } else {
        console.log("List webhookEventTypes Response");
        console.log(JSON.stringify(webhookEventTypes));
    }
});
