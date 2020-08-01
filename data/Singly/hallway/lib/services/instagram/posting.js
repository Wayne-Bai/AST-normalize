module.exports = {
  photos: function(data, callback) {
    return callback(null, {
      error: 'Instagram does not allow uploading via the API.',
      see: 'http://instagram.com/developer/endpoints/media/'
    });
  }
};
