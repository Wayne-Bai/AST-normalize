'use strict';

module.exports = function (req, res, next) {
  res.status(404).json({
    messages: ['API endpoint not found.']
  });
};
