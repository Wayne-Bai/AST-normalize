module.exports = {
	dist: {
		options: {
			config: '<%= paths.helper %>/configs/csscomb.json'
		},
		expand: true,
		cwd: '<%= paths.src %>/scss/',
		src: ['**/*.scss', '!utils/**/*.scss', '!icons/**/*.scss'],
		dest: '<%= paths.src %>/scss/'
	}
};