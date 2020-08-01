/*global module:false*/
module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
    '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
    '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
    '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
    ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    compass: {
      dist: {
        options: {
          require: 'zurb-foundation',
          sassDir: '_assets/sass',
          cssDir: 'css',
          outputStyle: 'expanded',
          noLineComments: true,
          app: 'standalone',
          environment: 'production',
          raw: 'preferred_syntax = :scss\n'
        }
      }
    },
    cssmin: {
      compress: {
        files: {
          'css/app.css': ['css/app.css'],
          'css/site.css': ['css/site.css']
        }
      }
    },
    copy: {
      main: {
        files: [
          {src: ['_assets/js/vendor/modernizr.js'], dest: 'js/modernizr.js', filter: 'isFile'}
        ]
      }
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      founation: {
        src: [
          '_assets/js/foundation/foundation.js',
          '_assets/js/foundation/foundation.alerts.js',
          '_assets/js/foundation/foundation.clearing.js',
          '_assets/js/foundation/foundation.cookie.js',
          '_assets/js/foundation/foundation.dropdown.js',
          '_assets/js/foundation/foundation.forms.js',
          '_assets/js/foundation/foundation.joyride.js',
          '_assets/js/foundation/foundation.magellan.js',
          '_assets/js/foundation/foundation.orbit.js',
          '_assets/js/foundation/foundation.placeholder.js',
          '_assets/js/foundation/foundation.reveal.js',
          '_assets/js/foundation/foundation.section.js',
          '_assets/js/foundation/foundation.tooltips.js',
          '_assets/js/foundation/foundation.topbar.js',
        ],
        dest: 'js/foundation.js'
      },
      app: {
        src: ['_assets/js/app/app.js'], // , '_assets/js/vendor/github.js'
        dest: 'js/app.js'
      }
    },
    'jshint': {
      all: ['_assets/js/app/*.js', '!_assets/js/vendor/**/*.js', '!_assets/js/vendor/**/*.js'],
      options: {
        browser: true,
        curly: false,
        eqeqeq: false,
        eqnull: true,
        expr: true,
        immed: true,
        newcap: true,
        noarg: true,
        smarttabs: true,
        sub: true,
        undef: false
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      foundation: {
        src: 'js/foundation.js',
        dest: 'js/foundation.js'
      },
      app: {
        src: 'js/app.js',
        dest: 'js/app.js'
      },
      zepto: {
        src: '_assets/js/vendor/zepto.js',
        dest: 'js/zepto.js'
      },
      jquery: {
        src: '_assets/js/vendor/jquery.js',
        dest: 'js/jquery.js'
      }
    },
    shell: {
      jekyll_basic: {
        command: 'jekyll',
        options: {
          stdout: true
        }
      },
      jekyll_server: {
        command: 'jekyll --server',
        options: {
          stdout: true
        }
      },
      jekyll_stop: {
        command: '',
        options: {
          stdout: false
        }
      }
    },
    watch: {
      js: {
        files: '_assets/js/**/*.js',
        tasks: ['jshint', 'concat', 'copy', 'shell:jekyll_server'],
        options: {
          nospawn: true,
          interrupt: true
        }
      },
      css: {
        files: '_assets/sass/**/*.scss',
        tasks: ['compass', 'shell:jekyll_server'],
        options: {
          nospawn: true,
          interrupt: true
        }
      },
      ext: {
        files: ['!_site/**/*', '!node_modules/**/*', '!_assets/**/*', '**/*.md', '**/*.html', '**/*.yml', '**/*.txt', '**/*.xml'],
        tasks: ['shell:jekyll_server'],
        options: {
          nospawn: true,
          interrupt: true
        }
      },
      site: {
        files: '_site/index.html',
        tasks: [], // 'livereload'
        options: {
          nospawn: true,
          interrupt: true
        }
      },
    },

    gruntfile: {
      src: 'Gruntfile.js'
    }
  });

  grunt.registerTask('default', ['watch']); // 'livereload-start'
  grunt.registerTask('dist', ['compass', 'cssmin', 'jshint', 'uglify', 'concat']);

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-livereload');

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
};
