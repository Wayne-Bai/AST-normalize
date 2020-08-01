/*
 * add cordova platforms task
 */

var Q = require('q'),
    fs = require('q-io/fs'),
    path = require('path'),
    settings = require('../../settings'),
    pathHelper = require('../../helper/path'),
    platformsLib = require('../../cordova/platforms');

module.exports = function (response) {
    if (!response.platforms.length) return response;

    return platformsLib.add(
        pathHelper.resolve(response.path),
        response.platforms.map(platformsLib.extendPlatform),
        response.options.verbose
    ).then(function() { return response; });
};
