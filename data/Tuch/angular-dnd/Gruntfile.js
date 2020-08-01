module.exports = function (grunt) {
    grunt.initConfig({
        concat: {
            options: {
                separator: ';\n\n',
            },
            dist: {
                src: [
                    'src/core.js',
                    'src/directives/dndDraggable.js',
                    'src/directives/dndDroppable.js',
                    'src/directives/dndRotatable.js',
                    'src/directives/dndResizable.js',
                    'src/directives/dndSortable.js',
                    'src/directives/dndSelectable.js',
                    'src/directives/dndRect.js',
                    'src/directives/dndModel.js',
                    'src/directives/dndLassoArea.js',
                    'src/directives/dndFittext.js',
                    'src/directives/dndKeyModel.js',
                    'src/directives/dndContainer.js',
                    'src/services/dndKey.js',
                    'src/services/dndLasso.js',
                    'src/services/EventEmitter.js'
                ],
                dest: 'dist/angular-dnd.js',
            },
        },
        wrap: {
            basic: {
                src: ['dist/angular-dnd.js'],
                dest: 'dist/angular-dnd.js',
                options: {
                    wrapper: [
                        ';(function(angular, undefined, window, document){\n',
                        '\n})(angular, undefined, window, document);'
                    ]
                }
            }
        },
        uglify: {
            build: {
                src: 'dist/angular-dnd.js',
                dest: 'dist/angular-dnd.min.js'
            }
        },
        watch: {
            files: [
                'src/core.js',
                'src/directives/dndDraggable.js',
                'src/directives/dndDroppable.js',
                'src/directives/dndRotatable.js',
                'src/directives/dndResizable.js',
                'src/directives/dndSortable.js',
                'src/directives/dndSelectable.js',
                'src/directives/dndRect.js',
                'src/directives/dndModel.js',
                'src/directives/dndLassoArea.js',
                'src/directives/dndFittext.js',
                'src/directives/dndKeyModel.js',
                'src/directives/dndContainer.js',
                'src/services/dndKey.js',
                'src/services/dndLasso.js',
                'src/services/EventEmitter.js'
            ],
            tasks: [
                "concat",
                "wrap",
                "uglify"
            ]
        }
    });

    function loadNpmTasks(tasks) {
        tasks.forEach(function (task, i) {
            grunt.loadNpmTasks(task);
        });
    }

    loadNpmTasks([
        'grunt-contrib-uglify',
        'grunt-wrap',
        'grunt-contrib-concat',
        'grunt-contrib-watch'
    ]);

    grunt.registerTask('default', [
        "concat",
        "wrap",
        "uglify",
        'watch'
    ]);
};
