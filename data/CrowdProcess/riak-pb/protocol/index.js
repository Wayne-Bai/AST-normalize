var protobuf = require('protobuf.js');
var butils = require('butils');
var path = require('path');

var Parser = require('./parser');
var messageCodes = require('./message_codes');

var translator = protobuf.loadSchema(path.join(__dirname, './riak_kv.proto'));

exports.parse =
function parse() {
  return Parser(translator);
};

exports.serialize =
function serialize(o) {
  var buffer = translator.encode(o.type, o.data);
  var message = [];

  butils.writeInt32(message, buffer.length + 1);
  butils.writeInt(message, messageCodes[o.type], 4);
  message = message.concat(buffer);
  return new Buffer(message);
};