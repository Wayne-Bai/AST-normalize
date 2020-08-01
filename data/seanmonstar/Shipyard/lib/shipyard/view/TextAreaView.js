var Class = require('shipyard/class/Class'),
    View = require('shipyard/view/View');

module.exports = new Class({
    
    Extends: View,

    tag: 'textarea',

    classNames: ['shipyard-textarea'],

    onBlur: function() {
        this.set('value', this.get('element').get('value'));
    },

	content: View.computed('value'),

	_setupContentBinding: function _setupContentBinding() {
		this.observe('value', function(value) {
			var el = this.get('element');
			if (el) {
				el.set('value', value);
			}
		});
	}

});
