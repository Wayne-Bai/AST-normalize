/*jshint node:true*/
var Page = require('astrolabe').Page;

var rxLogout = {
    isDisplayed: {
        value: function () {
            return this.rootElement.isDisplayed();
        }
    },

    logout: {
        value: function () {
            this.rootElement.click();
        }
    }
};

exports.rxLogout = {
    initialize: function (rxLogoutElement) {
        rxLogout.rootElement = {
            get: function () { return rxLogoutElement; }
        };
        return Page.create(rxLogout);
    }
};
