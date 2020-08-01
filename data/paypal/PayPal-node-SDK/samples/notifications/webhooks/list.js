/* Copyright 2015 PayPal */
"use strict";

var paypal = require('../../../');
require('../../configure');

paypal.notification.webhook.list(function (error, webhooks) {
    if (error) {
        throw error;
    } else {
        console.log(webhooks);
    }
});
