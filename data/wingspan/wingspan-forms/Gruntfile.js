/*global module:false*/
module.exports = function (grunt) {
    'use strict';

    var requireConfig = {

        optimize: 'none',
        inlineText: true,
        useStrict: true,
        skipPragmas: true,
        preserveLicenseComments: true,

        wrap: {
            startFile: 'almond-begin.txt',
            endFile: 'almond-end.txt'
        },

        baseUrl: 'js-built',

        paths: {
            underscore: '../bower_components/underscore/underscore',
            jquery: '../bower_components/jquery/jquery',
            kendo: '../bower_components/kendo-ui/src/js/kendo.web',
            react: '../bower_components/react/react-with-addons',
            almond: '../bower_components/almond/almond'
        },

        shim: {
            'underscore': { deps: [], exports: '_' },
            'jquery': { deps: [], exports: '$' },
            'kendo': { deps: [], exports: 'kendo' },
            'react': { deps: [], exports: 'React'}
        },

        uglify: {
            toplevel: true,
            ascii_only: true,
            beautify: true,
            max_line_length: 1000,
            defines: { DEBUG: ['name', 'false'] },
            no_mangle: true
        }
    };

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

        bower: {
            install: {
                options: {
                    copy: false,
                    install: true,
                    verbose: false,
                    cleanTargetDir: false,
                    cleanBowerDir: false,
                    bowerOptions: {}
                }
            }
        },

        react: {
            lib: {
                files: [{ expand: true, cwd: 'js', src: ['**/*.js'], dest: 'js-built', ext: '.js' }]
            },
            spec: {
                files: [{ expand: true, cwd: 'spec', src: ['**/*.js'], dest: 'spec-built', ext: '.js' }]
            }
        },

        requirejs: {
            options: requireConfig,
            compile: {
                options: {
                    out: 'dist/wingspan-forms.js',
                    include: ['almond', 'wingspan-forms'],
                    exclude: ['jquery', 'underscore', 'react', 'require', 'kendo']
                }
            },
            compileQuickStart: {
                options: {
                    out: 'dist/wingspan-forms-quickstart.js',
                    include: ['almond', 'wingspan-forms'],
                    exclude: ['react', 'kendo', 'jquery']
                }
            }
        },

        less: {
            options: {
                paths: ['styles'],
                ieCompat: true,
                yuicompress: true,
                report: 'min'
            },
            'wingspan-forms.css': {
                files: {
                    'dist/wingspan-forms.css': 'styles/app.less'
                }
            },
            'wingspan-forms-checkbox': {
                files: {
                    'dist/wingspan-forms-checkbox.css': 'styles/checkbox.less'
                }
            }
        },

        copy: {
            main: {
                files: [
                    {expand: true, src: ['styles/assets/**'],       dest: 'dist/assets/',      flatten: true, filter: 'isFile'},
                    {expand: true, src: ['styles/assets/icons/**'], dest: 'dist/assets/icons', flatten: true, filter: 'isFile'}
                ]
            }
        },

        subgrunt: {
            options: {},
            examples: [
                'examples/controlled-grid',
                'examples/faceted-search',
                'examples/form-dynamic',
                'examples/form-master-detail',
                'examples/form-simple',
                'examples/form-simple-2',
                'examples/form-twins',
                'examples/helloworld',
                'examples/helloworld-requirejs',
                'examples/live-code-starter',
                'examples/sandbox',
                'examples/state-at-top'
            ]
        },

        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },

        clean: ['bower_components', 'js-built', 'spec-built', 'dist']
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-subgrunt');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-react');

    grunt.registerTask('default', ['bower:install', 'react:lib', 'less', 'copy', 'requirejs:compile']);
    grunt.registerTask('devel', ['bower:install', 'react:lib', 'less', 'copy']);
    grunt.registerTask('test', ['default', 'react:spec', 'karma']);

    // Before building examples, build the wingspan-forms.js distribution
    grunt.registerTask('examples', ['default', 'subgrunt']);
};
