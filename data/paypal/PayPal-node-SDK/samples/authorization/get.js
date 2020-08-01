"use strict";

var paypal = require('../../');
require('../configure');

paypal.authorization.get("99M58264FG144833V", function (error, authorization) {
    if (error) {
        console.error(error);
    } else {
        console.log(authorization);
    }
});
