/* Copyright 2015 PayPal */
"use strict";

var paypal = require('../../');
require('../configure');

var invoiceId = "INV2-9DRB-YTHU-2V9Q-7Q24";

var update_invoice_json = {
    "id": invoiceId,
    "merchant_info": {
        "email": "PPX.DevNet-facilitator@gmail.com",
        "first_name": "Dennis",
        "last_name": "Doctor",
        "business_name": "Medical Professionals, LLC",
        "phone": {
            "country_code": "001",
            "national_number": "5032141716"
        },
        "address": {
            "line1": "1234 Main St.",
            "city": "Portland",
            "state": "OR",
            "postal_code": "97217",
            "country_code": "US"
        }
    },
    "billing_info": [{
        "email": "example@example.com"
    }],
    "items": [{
        "name": "Sutures",
        "quantity": 400.0,
        "unit_price": {
            "currency": "USD",
            "value": 5
        }
    }],
    "note": "Medical Invoice 16 Jul, 2013 PST",
    "payment_term": {
        "term_type": "NET_45"
    },
    "shipping_info": {
        "first_name": "Sally",
        "last_name": "Patient",
        "business_name": "Not applicable",
        "phone": {
            "country_code": "001",
            "national_number": "5039871234"
        },
        "address": {
            "line1": "1234 Broad St.",
            "city": "Portland",
            "state": "OR",
            "postal_code": "97216",
            "country_code": "US"
        }
    },
    "tax_inclusive": false,
    "total_amount": {
        "currency": "USD",
        "value": "2000.00"
    }
};

paypal.invoice.update(invoiceId, update_invoice_json, function (error, invoice) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log("Update Invoice Response");
        console.log(invoice);
    }
});
