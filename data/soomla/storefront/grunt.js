/*global module:false*/
require('shelljs/global');


module.exports = function (grunt) {

    // Define folders
    var distFolder      = "./dist",
        deployFolder    = "./deploy",
        srcFolder       = "./src",
        themesFolder    = "storefront-themes/themes",
        lessFiles       = {};

    lessFiles[distFolder + "/css/store.css"] = srcFolder + "/css/store.less";

    // Project configuration.
    var config = {
        meta : {
            version : '0.1.0',
            banner : '/*! PROJECT_NAME - v<%= meta.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '* http://PROJECT_WEBSITE/\n' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
                'YOUR_NAME; Licensed MIT */'
        },
        less : {
            store : {
                files: lessFiles,
                options : {
                    compress : true
                }
            }
        },
        requirejs : {
            baseUrl         : srcFolder + '/js',
            mainConfigFile  : srcFolder + '/js/main.js',
            name            : "main",
            out             : distFolder + "/js/main.js"
        }
    };

    // Uncomment to prevent code obfuscation
    // config.requirejs.optimize = "none";


    grunt.initConfig(config);

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-requirejs');


    // Register helper tasks

    grunt.registerTask('copy', 'Copies more necessary resources to the distribution folder', function() {

        // Copy Javascript
        mkdir("-p", distFolder + "/js/libs", distFolder + "/css/mixins");
        cp(srcFolder + "/js/libs/require.js", distFolder + "/js/libs/");

        // Copy HTML + Less
        cp("-R", srcFolder + "/store.html", srcFolder + "/css.handlebars", distFolder + "/");
        cp("-R", srcFolder + "/css/mixins/bootstrap", distFolder + "/css/mixins/");
        cp("-R", srcFolder + "/css/mixins/layout.less", distFolder + "/css/mixins/");
        cp("-R", srcFolder + "/css/img", distFolder + "/css/");

        // Uncomment this block for deploying with mobile-preview.html.
        // This is helpful when you want to build your theme and test it
        // in a browser after it was built
        // ===================================================================
        // mkdir("-p", distFolder + "/js/libs/jquery");
        // cp("js/libs/jquery/jquery-1.9.1.min.js", distFolder + "/js/libs/jquery");
        // cp("mobile-preview.html", distFolder + "/");
    });

    grunt.registerTask('clean', 'Cleans the distribution folder', function() {
        rm("-rf", deployFolder);
    });


    //
    // Prepares the source and distribution files in a deployment folder
    //
    grunt.registerTask('prepareDeploy', 'Cleans the distribution folder', function() {
        mkdir("-p", deployFolder + "/src");
        cp("-R", srcFolder + "/*", deployFolder + "/src");
        mv(distFolder, deployFolder);
        cp("store.html.erb", deployFolder);
    });

    grunt.registerTask('production', function() {

        // Add an external local copy of jquery
        mkdir("-p", distFolder + "/js/libs/jquery");
        cp(srcFolder + "/js/libs/jquery/jquery-1.*.min.js", distFolder + "/js/libs/jquery");

        // Add mobile preview HTML
        cp("./mobile-preview.html", distFolder);

        // Add symlink to themes
        exec("ln -s ../../" + themesFolder +  " " + distFolder + "/themes")
    });



    // Default task.
    grunt.registerTask('default', 'clean copy less requirejs prepareDeploy');
};
