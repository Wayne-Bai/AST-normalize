/**
 * Copyright 2015 PayPal
 *
 * Sample to show using multiple client_id and client_secret using the configure method.
 */
"use strict";

var paypal = require('../../');
require('../configure');

var payment_id_first = "PAY-0XL713371A312273YKE2GCNI";
var payment_id_second = "PAY-1BE91891655505349KTAUV3Y";

var first_config = {
    'mode': 'sandbox',
    'client_id': '<FIRST_CLIENT_ID>',
    'client_secret': '<FIRST_CLIENT_SECRET>'
};

var second_config = {
    'mode': 'sandbox',
    'client_id': '<SECOND_CLIENT_ID>',
    'client_secret': '<SECOND_CLIENT_SECRET>'
};

paypal.payment.get(payment_id_first, function (error, payment) {
    if (error) {
        console.log(error);
        throw error;
    } else {
        console.log("Get Payment Response");
        console.log(JSON.stringify(payment));


        //Use the configure method to set the configurations to the second_config
        //From this point onwards the second_config would be used by default unless
        //another configuration object is explicitly passed in as the example in multiple_config
        paypal.configure(second_config);
        paypal.payment.get(payment_id_second, function (error, payment) {
            if (error) {
                console.log(error);
                throw error;
            } else {
                console.log("Get Payment Response");
                console.log(JSON.stringify(payment));
            }
        });
    }
});