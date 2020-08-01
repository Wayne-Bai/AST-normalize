define(function (require, exports, module) {

var rich = require('rich');
var _ = require('underscore');
var backbone = require('backbone');
var autolayout = require('rich/autolayout/init');
var utils = require('app/utils');
var RectangleView = require('app/shared/views/rectangle-view').RectangleView;
var Rectangle = require('app/shared/models/rectangle').Rectangle;
var Column = require('./column').Column;
var Content = require('./content').Content;
var Action = require('./action').Action;

var AutoLayoutDemo = rich.View.extend({
    autoLayoutTransition: {
        duration: 500
    },

    constraints: [
        {
            item: 'column',
            attribute: 'width',
            relatedBy: '==',
            toItem: 'superview',
            toAttribute: 'width',
            multiplier: 0.2
        },

        // column min width = 120px
        "[column(>=120)]",

        {
            item: 'column',
            attribute: 'left',
            relatedBy: '==',
            toItem: 'superview',
            toAttribute: 'left',
            constant: 0
        },

        {
            item: 'content',
            attribute: 'left',
            relatedBy: '==',
            toItem: 'column',
            toAttribute: 'right',
            constant: 0
        },
    ],

    initialize: function(){

        var color0 = new Rectangle({
            color: utils.colors.blue[0]
        });

        var gray = new Rectangle({
            color: '#ccc'
        });

        //init views
        this.column = new Column({
            model: color0
        });

        this.content = new Content({
            model: gray
        });

        this.addSubview(this.column);
        this.addSubview(this.content);
    },


});

exports.AutoLayoutDemo = AutoLayoutDemo;

});
