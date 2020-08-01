'use strict';
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var sendmailTransport = require('nodemailer-sendmail-transport');

module.exports = function() {

    function buildTransporter() {
        if(config.server.smtp.enabled) {
            return nodemailer.createTransport(smtpTransport(config.server.smtp));
        }
        return nodemailer.createTransport(sendmailTransport());
    }

    return {
        send: function (opts, done) {

            var transporter = buildTransporter();

            transporter.sendMail(opts, function(err, res) {
                if(!err) {
                    transporter.close();
                }

                if(typeof done === 'function') {
                    done(err, res);
                }
            });
        }
    };
}();
