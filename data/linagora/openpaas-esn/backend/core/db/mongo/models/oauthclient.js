'use strict';

var mongoose = require('mongoose');
var randomstring = require('randomstring');
var Schema = mongoose.Schema;

var OAuthClientSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  clientId: { type: String, unique: true},
  clientSecret: { type: String},
  redirectUri: { type: String },
  description: { type: String},
  created: { type: Date, default: Date.now },
  creator: {type: Schema.ObjectId, ref: 'User'},
  schemaVersion: {type: Number, default: 1}
});

OAuthClientSchema.pre('save', function(next) {
  if (!this.isNew) {
    return next();
  }
  this.clientId = randomstring.generate(20);
  this.clientSecret = randomstring.generate(40);
  next();
});

module.exports = mongoose.model('OAuthClient', OAuthClientSchema);
