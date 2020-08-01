var Class = function () {
};
Class.prototype = {
    initialize: function () {
    },
    events: function () {
        return {
            onInitialize: function() {
            },
            onAfterRender: function() {
            }
        };
    },
    fireEvent: function (event) {
        var events = this.events();
        if (event in events) {
            if (events[event] instanceof Function) {
                events[event].call(this, arguments);
            }
        }
    }
};
Class.extend = function (props) {

    // extended class with the new prototype
    var NewClass = function () {

        // call the constructor
        if (this.initialize) {
            this.initialize.apply(this, arguments);
        }

        this.fireEvent('onInitialize');
    };

    // instantiate class without calling constructor
    var F = function () {
    };
    F.prototype = this.prototype;

    var proto = new F();
    proto.constructor = NewClass;

    NewClass.prototype = proto;

    //inherit parent's statics
    for (var i in this) {
        if (this.hasOwnProperty(i) && i !== 'prototype') {
            NewClass[i] = this[i];
        }
    }

    // mix includes into the prototype
    if (props.templates) {
        extend.apply(null, [proto].concat(props.templates));
        delete props.templates;
    }

    // merge options
    if (props.options && proto.options) {
        props.options = extend({}, proto.options, props.options);
    }

    // mix given properties into the prototype
    extend(proto, props);

    var parent = this;
    // jshint camelcase: false
    NewClass.__super__ = parent.prototype;

    return NewClass;
};