var gulp = require('gulp');


/**
 * Safely handle misconfigured
 * project name
 */
var path = require('path');
var project = require('./package.json');
if (project.name === path.basename(__dirname)) {
	console.log('[' + new Date().toLocaleTimeString() + '] Config Error: \x1b[31m%s\x1b[0m', 'The \"name\" value in your package.json configuration \'' + project.name + '\'');
	console.log('[' + new Date().toLocaleTimeString() + ']               \x1b[31m%s\x1b[0m', 'cannot be the same as the directory name of the development theme \'' + path.basename(__dirname) + '\'.');
	console.log('[' + new Date().toLocaleTimeString() + '] Please either rename the development theme directory (to \'' + project.name +  '_dev\' for example)');
	console.log('[' + new Date().toLocaleTimeString() + '] or change the name value in your package.json to something else.');
	process.exit(1);
}

// gulpfile booting message
console.log('[' + new Date().toLocaleTimeString() + '] \x1b[32m%s\x1b[0m', 'Starting to Gulp! Please wait...');



/**
 * Grouped
 */
gulp.task('default', [
	  'fonts:watch',
	 'images:watch',
	'scripts:watch',
	 'styles:watch',
	  'theme:watch',
	'browser:sync'
]);

gulp.task('build', [
	  'fonts:prod',
	 'images:prod',
	'scripts:prod',
	 'styles:prod',
	  'theme:prod'
]);


/**
 * Browser
 */
gulp.task('browser:sync', [], require('./gulp/recipes/browser-sync'));


/**
 * Fonts
 */
gulp.task('fonts:clean', [],              require('./gulp/recipes/fonts/clean'));
gulp.task('fonts:dev',   ['fonts:clean'], require('./gulp/recipes/fonts/dev'));
gulp.task('fonts:prod',  ['fonts:clean'], require('./gulp/recipes/fonts/prod'));
gulp.task('fonts:watch', ['fonts:dev'],   require('./gulp/recipes/fonts/watch'));


/**
 * Images
 */
gulp.task('images:clean', [],               require('./gulp/recipes/images/clean'));
gulp.task('images:dev',   ['images:clean'], require('./gulp/recipes/images/dev'));
gulp.task('images:prod',  ['images:clean'], require('./gulp/recipes/images/prod'));
gulp.task('images:watch', ['images:dev'],   require('./gulp/recipes/images/watch'));


/**
 * Scripts
 */
gulp.task('scripts:clean', [],                require('./gulp/recipes/scripts/clean'));
gulp.task('scripts:dev',   ['scripts:clean'], require('./gulp/recipes/scripts/dev'));
gulp.task('scripts:prod',  ['scripts:clean'], require('./gulp/recipes/scripts/prod'));
gulp.task('scripts:watch', ['scripts:clean'], require('./gulp/recipes/scripts/watch'));


/**
 * Styles
 */
gulp.task('styles:clean', [],               require('./gulp/recipes/styles/clean'));
gulp.task('styles:dev',   ['styles:clean'], require('./gulp/recipes/styles/dev'));
gulp.task('styles:prod',  ['styles:clean'], require('./gulp/recipes/styles/prod'));
gulp.task('styles:watch', ['styles:dev'],   require('./gulp/recipes/styles/watch'));


/**
 * Theme
 */
gulp.task('theme:clean', [],              require('./gulp/recipes/theme/clean'));
gulp.task('theme:dev',   ['theme:clean'], require('./gulp/recipes/theme/dev'));
gulp.task('theme:prod',  ['theme:clean'], require('./gulp/recipes/theme/prod'));
gulp.task('theme:watch', ['theme:dev'],   require('./gulp/recipes/theme/watch'));
