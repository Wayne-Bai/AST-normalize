/**
 * @module lib/config-inspector
 */

var configurationInformation = require('./lib/information');
var configurationSummary = require('./lib/summary');


module.exports = exports = {

  getConfigurationInformation: configurationInformation,
  getConfigurationSummary: configurationSummary

};
