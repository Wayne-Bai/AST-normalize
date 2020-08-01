'use strict';

var _ = require('lodash');
var contra = require('contra');

function find (Model, query, count, done) {
  if (count === 1) {
    single();
  } else {
    many();
  }

  function single () {
    contra.waterfall([
      function (next) {
        Model.find(query).count(next);
      },
      function (count, next) {
        var skips = Math.floor(Math.random() * count);
        Model.find(query).skip(skips).limit(1).exec(next);
      }
    ], done);
  }

  function many () {
    contra.waterfall([
      function (next) {
        Model.find(query, '_id').lean().exec(next);
      },
      function (documents, next) {
        var random = _(documents).pluck('_id').sample(count).value();
        var byIds = {
          _id: { $in: random }
        };
        Model.find(byIds, next);
      }
    ], done);
  }
}

module.exports = {
  find: find
};
