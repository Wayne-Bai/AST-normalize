/**
 * grunt-jscrambler
 * @author José Magalhães (magalhas@gmail.com)
 * @license MIT <http://opensource.org/licenses/MIT>
 */
'use strict';

var _ = require('lodash');
var jScrambler = require('jscrambler');
var path = require('path');
var util = require('util');

module.exports = function (grunt) {
  grunt.registerMultiTask('jscrambler', 'Obfuscate your source files', function () {
    var done = this.async();
    var files = this.files;
    var options = this.options({
      keys: {},
      deleteProject: false
    });
    if (!options.params) {
      // By default we only use minification parameters
      options.params = {
        rename_local: '%DEFAULT%',
        whitespace: '%DEFAULT%'
      };
    }

    jScrambler
      .process({
        host: options.host,
        port: options.port,
        apiVersion: options.apiVersion,
        keys: options.keys,
        deleteProject: options.deleteProject,
        filesSrc: this.filesSrc,
        params: options.params
      }, writeFile)
      .then(done)
      .fail(function (err) {
        grunt.fail.fatal(util.inspect(err));
      });

    function writeFile(buffer, file) {
      files.forEach(function (elem) {
        elem.src.forEach(function (src) {
          if (grunt.file.arePathsEquivalent(src, file)) {
            var dest = elem.dest;
            var lastDestChar = dest[dest.length - 1];
            var destPath;
            if (elem.src.length === 1 && lastDestChar !== '/' && lastDestChar !== '\\') {
              destPath = dest;
            } else {
              destPath = path.join(dest, file);
            }
            grunt.file.write(destPath, buffer);
          }
        });
      });
    }
  });
};
