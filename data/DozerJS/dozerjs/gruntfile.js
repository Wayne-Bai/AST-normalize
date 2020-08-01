module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({

    // Get package JSON
    pkg: grunt.file.readJSON('package.json'),

    // JSHint
    jshint: {
      dozer: {
      options: {
          jshintrc: '.jshintrc',
          jshintignore: '.jshintignore'
        },
        files: {
          src: ['index.js', 'lib/**/*.js']
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', [ 'jshint' ]);

};