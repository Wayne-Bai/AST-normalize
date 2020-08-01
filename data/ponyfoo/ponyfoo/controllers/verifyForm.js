'use strict';

var httpService = require('../services/http');

module.exports = function (req, res, next) {
  if (!req.body.verify) {
    next();
  } else {
    res.redirect(httpService.referer(req));
  }
};
