/**
 * A Blob represents a binary data object that is stored with the Nitrogen service.
 *
 * @class Blob
 * @namespace nitrogen
 */

function Blob(json) {
    for(var key in json) {
        this[key] = json[key];
    }
}

/**
 * Saves a blob via streaming to the Nitrogen service.
 *
 * @method save
 * @async
 * @param {Object} session An open session with a Nitrogen service.
 * @param {Object} stream A stream with the contents of the blob.
 * @param {Function} callback Callback function of the form f(err, blob).
 **/

Blob.prototype.save = function(session, stream, callback) {
    if (!session.service.config.endpoints.blobs) return callback("blob endpoint not available on this service");

    var self = this;

    stream.pipe(
        session.post({ url: session.service.config.endpoints.blobs,
                       headers: { 'Content-Type': self.content_type } }, function (err, resp, body) {

            if (err) return callback(err);
            if (resp.statusCode != 200) return callback(resp.statusCode);

            var bodyJson = JSON.parse(body);

            return callback(null, new Blob(bodyJson.blob));
        })
    );
};

/**
 * Fetches a blob from the Nitrogen service.
 *
 * @method get
 * @async
 * @param {Object} session An open session with a Nitrogen service.
 * @param {Object} url The url for the blob.
 * @param {Function} callback Callback function of the form f(err, httpResponse, blobData).
 **/

Blob.get = function(session, url, callback) {
    session.get({ url: url, encoding: null }, callback);
};

module.exports = Blob;