var app = app || {};

(function () {
	'use strict';

	app.Job = Backbone.Model.extend({
		defaults: {
			name : "",
			executor : "",
			last_status : "",
			last_success_ts : 0,
			last_task_id : "",
			executor_flags : "",
			uris : "",
			create_ts : 0,
			owner : "",
			schedule : "",
			hook : "",
		},
		urlRoot: '/job',
	});
})();