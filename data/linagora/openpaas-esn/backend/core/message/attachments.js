'use strict';

var ObjectId = require('mongoose').Types.ObjectId;
var filestore = require('../filestore');

function storeAttachment(metaData, stream, options, callback) {
  if (!metaData.name) {
    return callback(new Error('Attachment name is required.'));
  }
  if (!metaData.contentType) {
    return callback(new Error('Attachment contentType is required.'));
  }
  if (!stream) {
    return callback(new Error('Attachment stream is required.'));
  }

  options = options ||  {};

  var fileId = new ObjectId();

  var returnAttachmentModel = function(err, file) {
    if (err) {
      return callback(err);
    }

    var attachmentModel = {
      _id: fileId,
      name: metaData.name,
      contentType: metaData.contentType,
      length: file.length
    };

    callback(null, attachmentModel);
  };

  options.filename = metaData.name;

  filestore.store(fileId, metaData.contentType, {name: metaData.name, creator: metaData.creator}, stream, options, returnAttachmentModel);
}
module.exports.storeAttachment = storeAttachment;

function getAttachmentFile(attachment, callback) {
  if (!attachment) {
    return callback(new Error('Attachment parameter is missing.'));
  }

  filestore.get(attachment._id, callback);
}
module.exports.getAttachmentFile = getAttachmentFile;

function setMessageReference(attachment, message, callback) {
  if (!attachment) {
    return callback(new Error('Attachment parameter is missing.'));
  }

  if (!message) {
    return callback(new Error('Message parameter is missing.'));
  }
  return filestore.addMeta(attachment._id,
    {metadata: {referenced: [{objectType: 'message', id: message._id}]}},
  callback);
}
module.exports.setMessageReference = setMessageReference;
