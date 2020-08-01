var SVGO = require('svgo'),
    svgo = new SVGO();

module.exports = function(grunt) {

    // register grunt multitask
    grunt.registerMultiTask('svgo', 'Minification task with SVGO.', function() {

        grunt.log.subhead('Optimizing with SVGO...');

        var files = grunt.file.expand(this.data.files);

        // async loop over files from task
        grunt.util.async.forEach(files, function(file, nextFile) {

            // optimize SVG from current file
            svgo.fromFile(file)
                // ok
                .then(function(result) {

                    var inBytes = result.info.inBytes,
                        outBytes = result.info.outBytes,
                        profitPercents = 100 - outBytes * 100 / inBytes;

                    // rewrite original file
                    grunt.file.write(file, result.data);

                    // and print profit info
                    grunt.log.writeln('File "' + file + '":');
                    grunt.log.ok(
                        (Math.round((inBytes / 1024) * 1000) / 1000) + ' KiB - ' +
                        ((Math.round(profitPercents * 10) / 10) + '%').green + ' = ' +
                        (Math.round((outBytes / 1024) * 1000) / 1000) + ' KiB'
                    );

                    // call the next file
                    nextFile();

                })
                // fail
                .fail(function(e) {

                    // print error info
                    grunt.log.writeln('File "' + file + '":');
                    grunt.log.error(e.message.red);

                    // call the next file
                    nextFile();

                })
                // end promises chain
                .done();

        }, this.async());

    });

};
