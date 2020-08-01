var Fs = require('fs');
var Hoek = require('hoek');
var Path = require('path');


var Hooks = function () {

    this.load();
};


Hooks.prototype.load = function () {

    var self = this;
    this._hooks = this._hooks || {};
    
    var files = Fs.readdirSync(__dirname).filter(function (d) { return d.indexOf('.js') > 0 && d != 'index.js' });

    files.forEach(function (d) {

        var servername = d.split('.').shift();
        self._hooks[servername] = require('./' + d);
    });
};


Hooks.prototype.get = function () {

    return this._hooks;
};


Hooks.prototype.extend = function (obj) {

    return this._hooks = Hoek.merge(this._hooks, obj);
};


module.exports = Hooks;