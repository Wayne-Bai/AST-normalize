/*jshint node:true */
module.exports = function (grunt) {
    // mode - Either leave it empty or set to 'full', i.e. `grunt test:full`. This will
    // cause the phantomjs-check task to run against all of our EncoreUI modules.
    // This requires a `grunt server` instance running somewhere else.
    // I could have a `server:testing` task run beforehand to give us the server,
    // but this gets in the way of our Travis configuration
    grunt.registerTask('test', 'Run tests', function (mode) {
        if (mode === 'debug') {
            grunt.task.run('karma:debug');
        } else {
            grunt.task.run('karma:single');
            if (mode === 'full') {
                grunt.task.run('modules');
                grunt.task.run('phantomjs-check:allModules');
            }
        }
    });
};
