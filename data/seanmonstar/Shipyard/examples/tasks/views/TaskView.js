var Class = require('shipyard/class/Class'),
	View = require('shipyard/view/View'),
	Container = require('shipyard/view/Container'),
	CheckboxView = require('shipyard/view/CheckboxView'),
	computed = View.computed;

module.exports = new Class({

	Extends: Container,

	tag: 'li',

	classNames: ['task-view', computed('isDone')],

	initialize: function TaskView(options) {
		this.parent(options);
		var view = this;

		var checkbox = new CheckboxView({
			'class': 'delete',
			'checked': this.binding('isDone'),
			'onClick': function() {
				view.parentView.emit('taskComplete', view.get('content'));
			}
		});
		this.addView(checkbox);

		var label = new View({
			'class': 'title',
			'content': this.binding('label')
		});
		this.addView(label);
	},

	label: computed('content.title'),

	isDone: computed('content.isDone')

});
