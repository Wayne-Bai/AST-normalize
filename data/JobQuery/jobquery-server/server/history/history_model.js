"use strict";

var mongoose = require('mongoose');

var mongoOID = mongoose.Schema.Types.ObjectId;

var historySchema = new mongoose.Schema({
  user:         {type: mongoOID, required: true, ref: 'User'},
  priorJobSearch:
    [{
      tags:
        [{
          tag: {type: mongoOID, ref: 'Tag'},
          score: {type: Number, min: 1, max: 4}
        }],
      userInterest:
        [{
          opportunity:  {type: mongoOID, ref: 'Opportunity'},
          score:  {type: Number, min: 1, max: 4}
        }],
    }],
  createdAt:      {type: Date, required: true, default: Date.now},
  updatedAt:      {type: Date, required: true, default: Date.now}
});

historySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = exports = mongoose.model('History', historySchema);
