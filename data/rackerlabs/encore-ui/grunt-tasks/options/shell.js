/*jshint node:true*/
module.exports = function (grunt) {
    return {
        rxPageObjects: {
            command: 'npm pack',
            options: {
                stdout: true,
                execOptions: {
                    cwd: 'utils/rx-page-objects'
                }
            }
        },

        wraith: {
            command: 'wraith capture config',
            options: {
                stdout: true,
                execOptions: {
                    cwd: '<%= config.wraith %>'
                }
            }
        },

        npmPublish: {
            command: 'npm publish ./rx-page-objects',
            options: {
                stdout: true,
                execOptions: {
                    cwd: 'utils/'
                }
            }
        },
        
        // When publishing a fix to an older version, we have to explicitly pass `--tag`
        // and a tagname, otherwise npm will automatically set this version as the `latest`,
        // even though "newer" versions exist
        npmPublishHotFix: {
            command: 'npm publish ./rx-page-objects --tag bugfix-<%= pkg.version %>',
            options: {
                stdout: true,
                execOptions: {
                    cwd: 'utils/'
                }
            }
        },

        latestTag: {
            command: 'git describe --abbrev=0',
            options: {
                callback: function (err, stdout, stderr, cb) {
                    // Replace '\n' to ensure clean output from `git describe`
                    grunt.config('config.latestTag', stdout.replace('\n', ''));
                    cb();
                }
            }
        }
    };
};
