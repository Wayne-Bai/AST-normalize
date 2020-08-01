var fs         = require('fs')
  , changeCase = require('change-case')

// Global config
exports.defaultConfigFileName   = 'config.json';
exports.defaultThemeName        = 'flat';
exports.defaultGenericIconSet   = 'custom.js';
exports.cmdIncludeIconSetPrefix = 'icon';

// Modules
exports.build = require('./module/build');
exports.theme = require('./module/theme');

/**
 * Returns available icon sets modules
 *
 * @return {array} Normalized icon sets modules
 */
var iconSets = function() {

  var files = fs.readdirSync(__dirname + '/../tasks/icons/');

  files = files
    .filter(function(file) {

      if(exports.defaultGenericIconSet === file) {
        return null;
      }

      return file;
    })
    .map(function(file) {

      file = file.replace('.js', '');
      file = changeCase.paramCase(file);

      return file;
    })
  ;

  return files;
};

exports.iconSets = iconSets();