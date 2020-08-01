module.exports = function(grunt) {

grunt.config('copy', {

  // @begin: karma reports
  karma_report_jasmine: {
    files: [
      {
        expand: true,
        flatten: true,
        cwd: '<%= project.paths.reports %>/__jasmine',
        src: [
          'Phantom*/index.html'
        ],
        dest: '<%= project.paths.reports %>/jasmine',
      }
    ]
  },
  // @end: karma reports

  //----------------------------------------------------------------------------

  // @begin: dev build tasks
  dev_jstobuild: {
    files: [
      {
        expand: true,
        cwd: '<%= project.paths.src %>/',
        src: [
          '**/*.js',
          '!**/tests/**/*',
          '!vendor/**/*',
          '!require.unit.load.js'
        ],
        dest: '<%= project.paths.build %>/'
      }
    ]
  },

  dev_tobuild: {
    files: [
      {
        expand: true,
        cwd: '<%= project.paths.src %>/',
        src: [
          '**',
          '!{,app/**/,shared/**/}*.js',
          '!**/*.{less,css}',
          '!vendor/**/*'
        ],
        dest: '<%= project.paths.build %>/'
      }
    ]
  },

  dev_vendortobuild: {
    files: [
      {
        expand: true,
        cwd: '<%= project.paths.src %>/',
        src: [
        'vendor/**/*',
        '!vendor/**/*.{less,html}',
        ],
        dest: '<%= project.paths.build %>/'
      }
    ]
  },
  // @end: dev build tasks

  // @begin: prod build tasks
  prod_jstobuild: {
    files: [
      {
        expand: true,
        cwd: '<%= project.paths.src %>/',
        src: [
          '**/*.js',
          '!**/tests/**/*',
          '!require.config.js',
          '!require.unit.load.js'
        ],
        dest: '<%= project.paths.build %>/'
      }
    ]
  },

  prod_todist: {
    files: [
      {
        expand: true,
        cwd: '<%= project.paths.src %>/',
        src: [
          '**',
          '!{,app/**/,shared/**/}*.js',
          '!**/*.{less,html}',
          '!styles/**/*.*'
        ],
        dest: '<%= project.paths.dist %>/'
      },
      {
        expand: true,
        cwd: '<%= project.paths.src %>/',
        src: [
          'shared/fallback/ie.js'
        ],
        dest: '<%= project.paths.dist %>/'
      },
      {
        expand: true,
        cwd: '<%= project.paths.src %>/',
        src: [
          'require.config.js'
        ],
        dest: '<%= project.paths.dist %>/'
      },
      {
        expand: true,
        cwd: '<%= project.paths.src %>/',
        src: [
          'index.html'
        ],
        dest: '<%= project.paths.dist %>/'
      }
    ]
  }
  // @end: prod build tasks

});

};
