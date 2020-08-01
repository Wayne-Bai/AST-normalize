"use strict";

var Tag = require('../../tag/tag_model.js');
var UNABLE_TO_SAVE      = "Server unable to save tag.";
var UNABLE_TO_RETRIEVE  = "Server unable to retrieve tag.";

module.exports = exports = {

  get: function (req, res) {
    Tag.find()
    .where('active').equals(true)
    .where('isPublic').equals(true)
    .select('-createdAt -updatedAt -isPublic -active -isPublic -active')
    .populate({path: 'category', select: '-createdAt -updatedAt'})
    .exec(function(err, tags) {
      if (err) {
        res.json(500, UNABLE_TO_RETRIEVE);
        return;
      }
      res.json(200, tags);
    });
  }
};
