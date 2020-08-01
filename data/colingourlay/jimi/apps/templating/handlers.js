var jimi = require('jimi');

exports.root = function (req, res) {
    jimi.respond_using_template(res, 'root.html', {});
}

exports.favicon = function (req, res) {
    jimi.respond(res, 'Not here!');
}