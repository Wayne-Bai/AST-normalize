'use strict';

var requireAuth = require('../middleware/controller/require-auth');

module.exports = initController;

function initController (app) {

    // Home page
    app.express.get('/', requireAuth, function (req, res) {
        res.redirect('/posts');
    });

}
