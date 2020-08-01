'use strict';

var Article = require('../../../models/Article');
var errors = require('../../../lib/errors');

function redirect (res, next) {
  return function (err, documents) {
    if (err) {
      next(err);
    } else if (!documents || !documents.length) {
      next(new errors.NotFoundError());
    } else {
      res.redirect('/articles/' + documents[0].slug);
    }
  };
}

module.exports = redirect;
