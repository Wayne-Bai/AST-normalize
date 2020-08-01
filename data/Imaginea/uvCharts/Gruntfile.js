/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),      
    ban: grunt.file.readJSON('banner.json'),      
    
    concat: {
    	options : {
    		banner: '/*! \n<%= pkg.name %> <%= pkg.version %><%= ban.copyright %> <%= ban.license %>\n*/\n'
      },
      
      dist: {
        src: ['src/gfx/graph.js', 'src/util/utility.js', 'src/util/config.js', 'src/util/constants.js', 'src/util/register.js', 'src/util/effects.js', 'src/util/palette.js', 'src/gfx/area.js', 'src/gfx/bar.js',
              'src/gfx/donut.js', 'src/gfx/line.js', 'src/gfx/percent_area.js', 'src/gfx/percent_bar.js', 'src/gfx/pie.js', 'src/gfx/polar_area.js', 'src/gfx/stacked_area.js', 'src/gfx/stacked_bar.js', 'src/gfx/stepup_bar.js', 'src/gfx/waterfall.js', 
              'src/gfx/table.js', 'src/gfx/tablegraph.js'],
        dest: 'build/uv.js'
      },
      
      gfx : {
        src: ['src/module/module_begin.js','src/gfx/graph.js', 'src/util/utility.js', 'src/util/config.js', 'src/util/constants.js', 'src/util/register.js', 'src/util/effects.js', 'src/util/palette.js', 'src/gfx/area.js', 'src/gfx/bar.js', 'src/gfx/donut.js', 'src/gfx/line.js', 'src/gfx/percent_area.js', 'src/gfx/percent_bar.js', 'src/gfx/pie.js', 'src/gfx/polar_area.js', 'src/gfx/stacked_area.js', 'src/gfx/stacked_bar.js', 'src/gfx/stepup_bar.js',  'src/gfx/waterfall.js', 'src/gfx/table.js', 'src/gfx/tablegraph.js','src/module/module_end.js'],
        dest: 'build/uvcharts.js'
      },

      test : {
        src : ['src/util/test.js'],
        dest : 'build/lvTest.js'
      }
    },
   
    watch: {
      scripts: {
        files: ['src/gfx/*.js','src/util/*.js','src/css/*.css'],
        tasks: ['concat'],
        options: {
          interrupt: true,
        }
      }
    },

    uglify : {
      options : {
        mangle : true
      },

      gfx : {
        files : {
          'build/uvcharts.min.js' : ['<%= concat.gfx.dest %>']
        }
      }
    },

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        eqnull: true,
        browser: true,
        camelcase : true,
        //indent: 2,
        latedef : true,
        newcap : true,
        undef : true,
        //trailing : true,
        //unused : true,
        globals: {
          d3: true,
          console: true,
          saveAs: true
        },
      },
      uses_defaults: ['lib/*.js'],
      
      gfx: {
        files: {
          src: ['<%= concat.gfx.dest %>']
        }
      }
    },

    compress : {
      lib : {
        options : {
          archive : 'build/uvcharts.zip'
        },

        files : [
          { expand: 'true', cwd: 'build/', src : ['uvcharts*'], dest : 'dist/' }
        ]
      }
    },

    copy : {
      release : {
        files : [
          { expand: 'true', cwd: 'build/', src : ['uvcharts*'], dest : 'dist/' }
        ]
      }
    }
    
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-compress');

  // Default task.
  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['build_gfx', 'build_tst']);
  grunt.registerTask('build_gfx', ['concat:gfx', 'uglify:gfx', 'jshint:gfx']);
  grunt.registerTask('build_tst', ['concat:test'])
  grunt.registerTask('release', ['build_gfx', 'compress', 'copy:release']);
};
