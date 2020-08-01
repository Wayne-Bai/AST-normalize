var baseConfig = require('./karma.conf');

/**
 * Karma configuration for running tests on a PhpStorm
 * @param config
 */
module.exports = function (config) {
    'use strict';

    // Load the base config
    baseConfig(config);

    // Continuous Integration mode
    config.singleRun = true;

    // Use PhantomJS for te tests
    config.browsers = ['PhantomJS'];
};