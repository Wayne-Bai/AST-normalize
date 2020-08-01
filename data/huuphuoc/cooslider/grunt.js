// See https://github.com/gruntjs/grunt/blob/0.3-stable/docs/getting_started.md
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: '<json:package.json>',
        dirs: {
            dest: 'release/<%= pkg.version %>',
            name: '<%= pkg.name %>'
        },

        copy: {
            dist: {
                files: {
                    '<%= dirs.dest %>': ['src/coo/css', 'src/coo/img']
                }
            }
        },

        concat: {
            dist: {
                src: [
                    'src/coo/js/class.js',
                    'src/coo/js/slider.js',
                    'src/coo/js/browser.js',
                    'src/coo/js/effect.js',
                    'src/coo/js/effect/*.js'
                ],
                dest: '<%= dirs.dest %>/js/<%= pkg.name %>.js'
            }
        },

        min: {
            dist: {
                src: ['<%= dirs.dest %>/js/<%= pkg.name %>.js'],
                dest: '<%= dirs.dest %>/js/<%= pkg.name %>.min.js'
            }
        }
    });

    //grunt.loadNpmTasks('grunt-contrib');
};