module.exports = Request;

function Request () {
    this.headers = {};
}

Request.prototype._setMethod = function (m) {
    this.method = m;
};

Request.prototype._setHeader = function (key, value) {
    if (typeof key !== 'string') key = key.toString('utf8');
    if (typeof value !== 'string') value = value.toString('utf8');
    this.headers[key.trim().toLowerCase()] = value.trim();
};

Request.prototype._setUrl = function (u) {
    this.url = u;
};

Request.prototype._setVersion = function (version) {
    var hparts = version.split('/');
    if (hparts[0].toUpperCase() !== 'HTTP') {
        return this._error('invalid http version');
    }
    this.httpVersion = hparts[1];
    this.httpVersionMajor = hparts[1];
};
