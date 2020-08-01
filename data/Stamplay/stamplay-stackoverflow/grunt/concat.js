module.exports = {

	options: {
		separator: "\n/* ---- HALLO HALLO ---- */\n",
		stripBanners: {
			block: true
		},
		banner: "/*! Stamplay v<%= pkg.version %> | " + "(c) 2014 The Stamplay Dreamteam */ \n"
	},

	css: {
		src: [
			'css/index.css',
			'css/question.css',
			'css/answer.css',
			'css/tags.css',
			'css/users.css',
			'css/footer.css',
			'css/sidebar.css',
			'bower_components/textAngular/src/textAngular.css'
		],
		dest: './dist/stylesheets.min.css',
	},

	lib: {
		src: [
			'js/lib/ng-infinite-scroll.js',
			'js/lib/ui-bootstrap-0.11.0.min.js',
			'/bower_components/momentjs/min/moment.min.js'
		],
		dest: './dist/libs.min.js'
	},

	controllers: {
		src: [
			"js/controllers/answerCtrl.js",
			"js/controllers/answerEditCtrl.js",
			"js/controllers/askCtrl.js",
			"js/controllers/homeCtrl.js",
			"js/controllers/loginCtrl.js",
			"js/controllers/logoutCtrl.js",
			"js/controllers/menuCtrl.js",
			"js/controllers/tagsCtrl.js",
			"js/controllers/usersCtrl.js"
		],
		dest: './dist/controllers.js'
	},

	services: {
		src: [
			"js/services/main.js",
			"js/services/userService.js",
			"js/services/tagsService.js",
			"js/services/questionsService.js",
			"js/services/answersService.js",
			"js/services/angular-stamplay.js"
		],
		dest: './dist/services.js'
	}

};