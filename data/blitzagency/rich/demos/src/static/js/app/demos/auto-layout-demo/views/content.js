define(function (require, exports, module) {

var rich = require('rich');
var utils = require('app/utils');
var RectangleView = require('app/shared/views/rectangle-view').RectangleView;


var Content = RectangleView.extend({
    autoLayoutTransition: {
        duration: 500
    },
});

exports.Content = Content;

});
