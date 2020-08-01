module.exports = function(grunt) {
    grunt.registerTask('default', ['clean', 'syntax-check', 'html2js',
        'build', 'test', 'minify', 'copy', 'ngdocs']);
};
