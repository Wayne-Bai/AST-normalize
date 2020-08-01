var path = require('path');
var temp = require('temp');
var fs = require('fs');
var util = require('util');

var lconfig;

exports.configurate = function() {
  if (!lconfig) {
    // override from the system temporary directory because of the locker's
    // insane insistence on relative paths.
    temp.dir = '.';

    lconfig = require(path.join(__dirname, '..', '..', 'lib', 'lconfig.js'));
  }

  return lconfig;
};

exports.loadFixture = function (path) {
  return JSON.parse(fs.readFileSync(path));
};
