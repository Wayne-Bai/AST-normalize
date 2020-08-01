module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    //Tasks
    compass: {
      dist: {
        options: {
          sassDir: '<%= pkg.dir.sass %>',
          cssDir: '<%= pkg.dir.css %>',
          javascriptDir: '<%= pkg.dir.js %>',
          imageDir: '<%= pkg.dir.img %>',
          environment: 'development',
          noLineComments: true,
          relativeAssets: true,
          outputStyle: 'compressed'
        }
      }
    },
    concat: {
      lib: {
        src: ['<%= pkg.dir.js %>/*.js'],
        dest: '<%= pkg.dir.js %>/concat/custom.cat.js'
      }
    },
    imagemin: {
      dist: {
        options: {
          optimizationLevel: 6,
          progressive: true
        },
        src: ['<%= pkg.dir.img %>/*'],
        dest: '<%= pkg.dir.img %>/compressed'
      }
    },
    uglify: {
      my_target: {
        files: {
          '<%= pkg.dir.js %>/custom.min.js': ['<%= pkg.dir.js %>/concat/custom.cat.js']
        }
      }
    },
    watch: {
      files: ['<%= pkg.dir.sass %>/*.scss'],
      tasks: ['compass']
    }
  });

  // Load the plugin that provides the task.
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['compass', 'imagemin', 'concat', 'uglify']);

};