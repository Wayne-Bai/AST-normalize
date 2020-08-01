'use strict';
angular.module('RedhatAccess.cases').filter('recommendationsResolution', function () {
    return function (text) {
        var shortText = '';
        var maxTextLength = 150;
        if (text !== undefined && text.length > maxTextLength) {
            shortText = text.substr(0, maxTextLength);
            // var lastSpace = shortText.lastIndexOf(' ');
            // shortText = shortText.substr(0, lastSpace);
            shortText = shortText.concat('...');
        } else {
            shortText = text;
        }
        return shortText;
    };
});