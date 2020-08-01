'use strict';


function trim(str) {
    return str.replace(/(^\s+|\s+$)/g, '').replace(/(\r\n|\n|\r)/g, '');
}


module.exports = function css(grunt) {

    var src = 'dist/button.js';

    function processCss(str) {
        var styles = trim(grunt.file.read('src/theme/css/index.css'));

        return str.replace('$STYLES$', styles);
    }

    grunt.registerTask('css', 'Injects css into the JavaScript', function () {
        var out = grunt.file.read(src);

        out = processCss(out);

        grunt.file.write(src, out);
    });

};
