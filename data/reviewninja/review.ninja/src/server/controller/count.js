'use strict';
// modules
var express = require('express');

// models
var User = require('mongoose').model('User');
var Star = require('mongoose').model('Star');

var router = express.Router();

router.all('/count/user', function(req, res) {
    User.count({}, function(err, count) {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({
            count: count,
            text: 'There are ' + count + ' users!'
        }));
    });
});

router.all('/count/star', function(req, res) {
    Star.count({}, function(err, count) {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({
            count: count,
            text: 'There are ' + count + ' ninja stars!'
        }));
    });
});

module.exports = router;
