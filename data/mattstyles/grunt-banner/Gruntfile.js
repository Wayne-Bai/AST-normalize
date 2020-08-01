/*
 * grunt-banner
 * https://github.com/mattstyles/grunt-banner
 *
 * Copyright (c) 2014 Matt Styles
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function ( grunt ) {

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= nodeunit.tests %>'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['test/tmp']
        },

        copy: {
            tests: {
                expand: true,
                cwd: 'test/fixtures/',
                src: '**',
                dest: 'test/tmp/'
            }
        },

        appConfig: {
            def: 'STRING'
        },

        // Configuration to be run (and then tested).
        usebanner: {
            bannerTop: {
                options: {
                    position: 'top',
                    banner: '// the banner'
                },
                files: {
                    src: [ 'test/tmp/some.js' ]
                }
            },

            bannerBottom: {
                options: {
                    position: 'bottom',
                    banner: '// the banner'
                },
                files: {
                    src: [ 'test/tmp/someBottom.js' ]
                }
            },

            bannerNoLineBreak: {
                options: {
                    banner: 'console.log("loaded"); ',
                    linebreak: false
                },
                files: {
                    src: [ 'test/tmp/someNoLineBreak.js' ]
                }
            },

            bannerProcess: {
                options: {
                    process: function ( filepath ) {
                        return grunt.template.process(
                            '// banner for file: <%= filename %>',
                            {
                                data: {
                                    filename: filepath.match(/\/([^/]*)$/)[1]
                                }
                            }
                        );
                    }
                },
                files: {
                    src: [ 'test/tmp/someProcess.js' ]
                }
            },

            bannerMatchPatternTop: {
                options: {
                    position: 'top',
                    banner: '// the banner',
                    pattern: 'var variable',
                    linebreak: true

                },
                files: {
                    src: [
                        'test/tmp/someMatchingPatternTop.js',
                        'test/tmp/someNotMatchingPattern.js'
                    ]
                }
            },

            bannerMatchPatternBottom: {
                options: {
                    position: 'bottom',
                    banner: '// the banner',
                    pattern: 'var variable'
                },
                files: {
                    src: [
                        'test/tmp/someMatchingPatternBottom.js'
                    ]
                }
            }
        },

        // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js']
        }

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['jshint', 'clean', 'copy', 'usebanner', 'nodeunit']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['test']);

};
