'use strict';


module.exports = function jshint(grunt) {

    return {
        coverage: {
            src: 'test',
            options: {
                mask: '**/*.js',
                check: {
                    lines: 60
                }
            }
        }
    };

};
