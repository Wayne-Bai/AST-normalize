module.exports = {
	dist: {
		options: {
			destination: '<%= paths.dev %>/jsdocs',
			template: "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template",
			configure: "<%= paths.helper %>/configs/jsdoc.conf.json"
		},
		src: [
			'<%= paths.src %>/js/**/*.js'
		]
	}
};