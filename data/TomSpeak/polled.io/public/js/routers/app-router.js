var Backbone = require('backbone');
var $ = require('jquery');
Backbone.$ = $;

var views = {
	createPoll: require('./../views/CreatePollView.js'),
	viewPoll: require('./../views/ViewPollView.js'),
	choicesView: require('./../views/ChoicesView.js'),
	choiceView: require('./../views/ChoiceView.js')
};

var models = {
	poll: require('./../models/poll.js'),
};

var regions = {
	content: $('#content'),
}

module.exports = Backbone.Router.extend({
	routes: {
		'': "home",
		'poll/:url': 'view',
	},

	initialize: function(startPushHistory){
		startPushHistory();

		/**
		 * This is a listener that tracks Backbone.navigate
		 * If a user is navigated to the 'view' route via Backbone
		 * We want to set a flag so that the view is animated in, otherwise
		 * The user has been hard linked to the view and it just needs to be shown
		 * immediately
		 */
		this.on('route', function(route, params) {
			if (route === 'view') {
				this.navigatedTo = true;
			}
		}.bind(this));
	},

	home: function() {
		var poll = new models.poll();

		regions.content.html(new views.createPoll({
			model: poll,
			router: this
		}).render().el);

        $('.js-title-input').focus();
	},
	view: function(url) {
		var poll = new models.poll({
			url: url
		});

		poll.getByURL(url);
		poll.fetch({
			success: function(){
				regions.content.html(new views.viewPoll({
					model: poll.toJSON(),
					navigatedTo: this.navigatedTo
				}).render().el);

				$('[data-region="choices"]').html(new views.choicesView({
					model: poll
				}).render().el);
			}.bind(this),

			error: function(error) {
				console.log(error);
			}
		});
	}
});
