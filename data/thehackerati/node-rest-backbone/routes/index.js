/**
 * index.js
 *
 * Requires all .js files defined in this directory.
 */
var fs = require('fs');

module.exports = function(app, db_conn, passport) {
    fs.readdirSync(__dirname).forEach(function(file) {
        if (file === "index.js" || file.substr(file.lastIndexOf('.') + 1) !== 'js')
            return;
        var name = file.substr(0, file.indexOf('.'));
        console.log("Requiring routes for " + name);
        require('./' + name)(app, db_conn, passport);
    });
};
