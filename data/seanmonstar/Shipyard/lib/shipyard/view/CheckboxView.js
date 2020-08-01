var Class = require('../class/Class'),
    View = require('./View');

module.exports = new Class({

    Extends: View,

    template: require('./templates/self-closing.ejs'),

    tag: 'input',

    type: 'checkbox',

    checked: false,

    attributes: ['type', 'value', 'name', 'checked'],

    classNames: ['shipyard-checkbox'],

    onClick: function(ev) {
        this.set('checked', this.get('element').get('checked'));
    }

});
