module.exports = function(grunt) {

  grunt.initConfig({
    bowerConfig: grunt.file.readJSON('.bowerrc'),
    uglify: {
      options: {
        mangle: false
      },
      prod:{  
        files: {
          // Bundle order can be acheived with globbing patterns.
          // See: https://github.com/gruntjs/grunt/wiki/Configuring-tasks#globbing-patterns
          'build/production/js/a.js':['build/_compile/js/jquery.js',
                                        'build/_compile/js/angular.js',
                                        'build/_compile/js/angular-resource.js',
                                        'build/_compile/js/ui-bootstrap.min.js',
                                        'build/_compile/js/imgur.js',
                                        'build/_compile/js/angular-cookies.js',
                                        'build/_compile/js/masonry.js',
                                        'build/_compile/js/angular-masonry.js',
                                        'build/_compile/js/imagesloaded.js',
                                        'build/_compile/js/*.js',],
        }
      }
    },
    less: {
      dev:{
        options: {
          paths: ["build/_compile/less"],
          yuicompress: true,
        },
        files: {
          'build/development/css/app.css': 'build/_compile/less/app.less'
        }
      },
      prod:{
        options: {
          paths: ["build/_compile/less"],
          yuicompress: true,
        },
        files: {
          'build/production/css/a.css': 'build/_compile/less/app.less'
        }
      }
    },
    clean: {
      dev: {
        src: [
          ['build/_compile','build/development/**']
        ]
      },
      prod: {
        src: [
          ['build/_compile','build/production/**']
        ]
      },
      compile: {
        src: [
          ['build/_compile']
        ]
      }
    },
    copy: {
      less: {
        files: [
          /* LESS
           * CSS files need to end in .less for @import compilation. */
          
          /* @ /plugins */
          {expand: true, cwd: '<%= bowerConfig.directory %>/bootstrap/less/', src: ['*'], dest: 'build/_compile/less', filter: 'isFile'}, // includes files ONLY in cwd
          
          /* @ /app    */
          {expand: true, flatten: true, src: ['app/assets/less/**'], dest: 'build/_compile/less', filter: 'isFile'}, //includes files recursively than flattens into same level directory
        ]
      },
      js: {
        files: [
          /* Javascript */
          {expand: true, cwd: '<%= bowerConfig.directory %>/angular-bootstrap/', src: ['ui-bootstrap-tpls.js'], dest: 'build/_compile/js'},
          {expand: true, cwd: '<%= bowerConfig.directory %>/angular-resource/', src: ['index.js'], dest: 'build/_compile/js/', rename: function(dest, src) {return dest + src.substring(0, src.indexOf('/')) + 'angular-resource.js';}},
          {expand: true, cwd: '<%= bowerConfig.directory %>/angular/', src: ['index.js'], dest: 'build/_compile/js/', rename: function(dest, src) {return dest + src.substring(0, src.indexOf('/')) + 'angular.js';}},
          {expand: true, cwd: '<%= bowerConfig.directory %>/angular-route/', src: ['index.js'], dest: 'build/_compile/js/', rename: function(dest, src) {return dest + src.substring(0, src.indexOf('/')) + 'angular-route.js';}},
          {expand: true, cwd: '<%= bowerConfig.directory %>/jquery/', src: ['jquery.js'], dest: 'build/_compile/js'},
          {expand: true, cwd: '<%= bowerConfig.directory %>/ng-infinite-scroll.min/', src: ['index.js'], dest: 'build/_compile/js/', rename: function(dest, src) {return dest + src.substring(0, src.indexOf('/')) + 'nginfinitescroll.js';}},
          {expand: true, cwd: '<%= bowerConfig.directory %>/angular-ui-utils/modules/keypress', src: ['keypress.js'], dest: 'build/_compile/js'},
          {expand: true, cwd: '<%= bowerConfig.directory %>/angular-cookies/', src: ['index.js'], dest: 'build/_compile/js/', rename: function(dest, src) {return dest + src.substring(0, src.indexOf('/')) + 'angular-cookies.js';}},
          {expand: true, cwd: '<%= bowerConfig.directory %>/masonry.pkgd/', src: ['index.js'], dest: 'build/_compile/js/', rename: function(dest, src) {return dest + src.substring(0, src.indexOf('/')) + 'masonry.js';}},
          {expand: true, cwd: '<%= bowerConfig.directory %>/angular-imgur-api/', src: ['imgur.js'], dest: 'build/_compile/js'},
          {expand: true, cwd: '<%= bowerConfig.directory %>/angular-masonry/', src: ['index.js'], dest: 'build/_compile/js/', rename: function(dest, src) {return dest + src.substring(0, src.indexOf('/')) + 'angular-masonry.js';}},
          {expand: true, cwd: '<%= bowerConfig.directory %>/imagesloaded.pkgd/', src: ['index.js'], dest: 'build/_compile/js/', rename: function(dest, src) {return dest + src.substring(0, src.indexOf('/')) + 'imagesloaded.js';}},
          
          /* @ /app    */
          {expand: true, flatten: true, src: ['app/*.js'], dest: 'build/_compile/js', filter: 'isFile'},
        ]
      },
      img: {
        files: [
          /* Images */
          
          /* @ /plugins */
          {expand: true, cwd: '<%= bowerConfig.directory %>/bootstrap/img/', src:['*'], dest: 'build/_compile/img'},
          
          /* @ /app    */
          {expand: true, flatten: true, src: ['app/assets/img/*'], dest: 'build/_compile/img', filter: 'isFile'},
        ]      
      },
      fonts: {
        files: [
          {expand: true, cwd: '<%= bowerConfig.directory %>/3.0.0-wip/fonts/', src: ['*'], dest: 'build/_compile/fonts', filter: 'isFile'},
        ]
      },
      dev: {
        files: [
          /* Move views to development build folder */
          /* Move to indevidual .js to development build folder */
          {expand: true, cwd: 'app', src: ['index.html'], dest: 'build/development'},
          {expand: true, cwd: 'app', src: ['views/**/*'], dest: 'build/development'},
          {expand: true, cwd: 'build/_compile/img', src: ['*'], dest: 'build/development/img'},
          {expand: true, cwd: 'build/_compile/js', src: ['*.js'], dest: 'build/development/js'},
          {expand: true, cwd: 'build/_compile/fonts', src: ['*'], dest: 'build/development/fonts'},
        ]
      },
      prod: {
        files: [
          /* Move views to production build folder */
          /* Move single concatted compressed app.js to production build folder */
          {expand: true, cwd: 'app', src: ['index.html'], dest: 'build/production'},
          {expand: true, cwd: 'app', src: ['views/**/*'], dest: 'build/production'},
          {expand: true, cwd: 'build/_compile/img', src: ['*'], dest: 'build/production/img'},
          {expand: true, cwd: 'build/_compile/js', src: ['*.js'], dest: 'build/production/js'},
          {expand: true, cwd: 'build/_compile/fonts', src: ['*'], dest: 'build/production/fonts'},
        ]
      },
    },
    htmlbuild: {
        dev: {
            src: 'app/index.html',
            dest: 'build/development',
            options: {
                prefix: '/',
                styles: {
                    bundle: [ 
                        'build/development/css/app.css',
                    ]
                },
                scripts: {
                    bundle: [
                        // Bundle order can be acheived with globbing patterns.
                        // See: https://github.com/gruntjs/grunt/wiki/Configuring-tasks#globbing-patterns
                        'build/development/js/jquery.js',
                        'build/development/js/angular.js',
                        'build/development/js/angular-resource.js',
                        'build/development/js/jquery.masonry.min.js',
                        'build/development/js/nginfinitescroll.js',
                        'build/development/js/ui-bootstrap.min.js',
                        'build/development/js/angular-cookies.js',
                        'build/development/js/imgur.js',
                        'build/development/js/masonry.js',
                        'build/development/js/angular-masonry.js',
                        'build/development/js/imagesloaded.js',
                        'build/development/js/*.js',            
                    ]
                },
            }
        },
        prod: {
            src: 'app/index.html',
            dest: 'build/production',
            prefix: '/',
            options: {
                styles: {
                    bundle: [ 
                        'build/production/css/a.css',
                    ]
                },
                scripts: {
                    bundle: [
                        'build/production/js/a.js',            
                    ]
                },
            }
        },
    },
    watch: {
      dev: {
        files: ['app/**'],
        tasks: ['clean:dev',
                'copy:img',
                'copy:fonts',
                'copy:less',
                'less:dev',
                'copy:js',
                'copy:dev',
                'htmlbuild:dev',
                'clean:compile']
      },
    },
  });
  
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-html-build');
  grunt.loadNpmTasks('grunt-contrib-watch');
  

  // Development Packaging
  grunt.registerTask('package:dev',['clean:dev',
                                    'copy:img',
                                    'copy:fonts',
                                    'copy:less',
                                    'less:dev',
                                    'copy:js',
                                    'copy:dev',
                                    'htmlbuild:dev',
                                    'clean:compile']);

  // There is no production "watch" ;)
  grunt.registerTask('package:dev:watch',['watch:dev']);  
  
  // Production Packaging
  grunt.registerTask('package:prod',['clean:prod',
                                     'copy:img',
                                     'copy:fonts',
                                     'copy:less',
                                     'less:prod',
                                     'copy:js',
                                     'uglify:prod',
                                     'copy:prod',
                                     'htmlbuild:prod',
                                     'clean:compile']); 
};