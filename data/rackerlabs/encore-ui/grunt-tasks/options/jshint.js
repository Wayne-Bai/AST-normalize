module.exports = {
    options: {
        jshintrc: '.jshintrc'
    },
    all: [
        'Gruntfile.js',
        'src/*/*.js',
        'grunt-tasks/**/*.js',
        '!grunt-tasks/component-template/**/*.js'
    ],
    scripts: [
        'src/*/*.js',
    ],
    specs: [
        'src/*/*.spec.js'
    ]
};