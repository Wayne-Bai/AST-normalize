/* Copyright 2015 PayPal 

Example to demonstrate creating a single synchronous payout, meaning the payment
will be executed immediately and response returned in the batch_status entry in the 
returned JSON object.

*/

"use strict";
var paypal = require('../../');
require('../configure');

var sender_batch_id = Math.random().toString(36).substring(9);

var create_payout_json = {
    "sender_batch_header": {
        "sender_batch_id": sender_batch_id,
        "email_subject": "You have a payment"
    },
    "items": [
        {
            "recipient_type": "EMAIL",
            "amount": {
                "value": 0.90,
                "currency": "USD"
            },
            "receiver": "shirt-supplier-three@mail.com",
            "note": "Thank you.",
            "sender_item_id": "item_3"
        }
    ]
};

var sync_mode = 'true';

paypal.payout.create(create_payout_json, sync_mode, function (error, payout) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log("Create Single Payout Response");
        console.log(payout);
    }
});
