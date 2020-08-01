var path = require('path');
var config = require('../util/config');

module.exports = {
    demohtml: {
        options: {
            process: function () {
                // this function intentionally left blank (gets replaced by build task)
            }
        },
        files: [{
            expand: true,
            src: ['**/*.html', '*.js'],
            cwd: 'demo/',
            dest: '<%= config.docs %>'
        }]
    },
    demoassets: {
        files: [{
            expand: true,
            //Don't re-copy html files, we process those
            src: ['**/**/*', '!**/*.html', '!*.js'],
            cwd: 'demo/',
            dest: '<%= config.docs %>'
        }]
    },
    demoreadme: {
        files: [{
            src: 'README.md',
            dest: 'demo/readme.html'
        }],
        options: {
            process: function (content) {
                var markdown = require('marked');

                // Replace the [![Build Status...]] line with an empty string
                // (note that /m makes $ match newlines
                content = content.replace(/\[\!\[Build Status(.*)$/m, '');

                // The README contains a link to the demo app, which leads the user off
                // this page and to the github demo app. Let's remove that. Strip out "# Demo App",
                // and everything that follows it until the next section header "#"
                // (Note that .* won't work because . doesn't match newlines. [\s\S] is equivalent
                content = content.replace(/# Demo App[\s\S]*?(#[\s\S]*)/mg, '$1');

                // Our README.md has a bunch of relative URLs for use on github, for example,
                // [Roadmap](./guides/roadmap.md)
                // They all start with "(./", so replace all occurrences of that with the full path
                // The \(\.\( matches (./
                // The (.*?) then grabs 'guides/roadmap.md'
                // The final \) matches the closing round bracket for the markdown link
                var githubPath = 'https://github.com/rackerlabs/encore-ui/blob/master/$1';
                content = content.replace(/\(\.\/(.*?)\)/g, '(' + githubPath + ')');
                return markdown(content);
            }

        }
    },
    font: {
        files: [{
            expand: true,
            src: ['*'],
            cwd: 'build/bower_components/font-awesome/fonts',
            dest: '<%= config.font %>'
        }]
    },
    coverage: {
        files: [{
            expand: true,
            src: ['Phantom*/**/*'],
            cwd: 'coverage/',
            dest: '<%= config.docs %>/coverage/',
            // remove 'Phantom' from path
            rename: function (dest, src) {
                // convert src to array
                var templatePath = src.split(path.sep);

                // remove the first directory ('Phantom ...')
                templatePath.shift();

                // return dest + the rest of the path as a string
                return dest + templatePath.join(path.sep);
            }
        }]
    },
    rxPageObjects: {
        expand: true,
        flatten: true,
        src: 'utils/rx-page-objects/*.tgz',
        dest: '<%= config.dist %>/'
    },
    bower: {
        files: [{
            expand: true,
            cwd: '<%= config.dist %>/',
            src: '**/*',
            dest: '<%= config.bower %>/',
            // remove version number from file names
            rename: function (dest, src) {
                // will catch the following
                // -0.10.11.min.js
                // -0.9.22.css
                // -0.1.1.js
                // -10.11.11.min.js
                var strippedVersion = src.replace(config.versionRegEx, '');

                return dest + strippedVersion;
            }
        }, {
            src: 'bower.json',
            dest: '<%= config.bower %>/bower.json'
        }]
    }
};
