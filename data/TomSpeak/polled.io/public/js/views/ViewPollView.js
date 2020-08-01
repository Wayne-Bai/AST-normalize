var Backbone = require('backbone');
var $ = require('jquery');
Backbone.$ = $;

/**
 * ViewPollView
 * Parent of ChoicesView, Grandparent of ChoiceView
 * 	- Handles the navigatedTo animation
 * 	- Share input 1 click select all
 * 	- Updates the page's title with the poll title
 */
module.exports = Backbone.View.extend({
	initialize: function(options) {
		//If the user was navigated here via Backbone, we animate the view in.
		//Else, just display the view.
		this.navigatedTo = options.navigatedTo;
	},
	events: {
		'click .share-input': 'selectText',
	},

	render: function() {
		var template = require('../../templates/_view-poll.html');
		this.$el.html(template({
			model: this.model,
			navigatedTo: this.navigatedTo,
			hasVoted: this.hasVoted
		}));

		document.title = 'Polled - ' + this.model.title;

		return this;
	},

	selectText: function(ev) {
		ev.target.setSelectionRange(0, 100);
	},
});
