/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;' +
      ' Licensed <%= pkg.license %> */\n',
    // Task configuration.
    concat: {
      options: {
        stripBanners: true
      },
      pre: {
        src: [
          'public/js/store.js',
          'public/js/twitterlib.js',
          'public/js/snapbird.js'
        ],
        dest: 'public/build/<%= pkg.name %>.pre.js'
      },
      build: {
        src: [
          'public/js/jquery.min.js',
          '<%= uglify.min.dest %>'
        ],
        dest: 'public/build/<%= pkg.name %>.build.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      min: {
        src: '<%= concat.pre.dest %>',
        dest: 'public/build/<%= pkg.name %>.min.js'
      }
    },
    cssmin: {
      options: {
        banner: '<%= banner %>'
      },
      minify: {
        expand: true,
        cwd: 'public/css/',
        src: ['*.css', '!*.min.css'],
        dest: 'public/build/',
        ext: '.min.css'
      }
    },
    watch: {
      build: {
        files: ['public/css/**/*.css', 'public/js/**/*.js'],
        tasks: ['default']
      },
      grunfile: {
        files: 'Grunfile.js',
        tasks: ['default']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Default task.
  grunt.registerTask('default', ['cssmin', 'concat:pre', 'uglify:min', 'concat:build']);
  grunt.registerTask('heroku:', ['cssmin', 'concat:pre', 'uglify:min', 'concat:build']);
  grunt.registerTask('heroku:production', ['cssmin', 'concat:pre', 'uglify:min', 'concat:build']);

};
