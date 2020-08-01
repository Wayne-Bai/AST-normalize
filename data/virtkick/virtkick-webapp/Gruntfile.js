var fs = require('fs');
var YAML = require('js-yaml');
var merge = require('recursive-merge');
module.exports = function(grunt) {

  var requirejsConfig = YAML.safeLoad(fs.readFileSync('./config/requirejs.yml', 'utf8'));

  var engines = [];
  try {
    engines = fs.readdirSync('./engines/');
  } catch(err) {
  }

  engines.forEach(function(engine) {
    var requirejsConfigExtension = '{}';
    try {
      requirejsConfigExtension = fs.readFileSync('./engines/' + engine + '/config/requirejs.yml');
    } catch(err) {
    }
    requirejsConfig = merge(requirejsConfig, YAML.safeLoad(requirejsConfigExtension));
  });

  var options = merge(requirejsConfig, {
    appDir: './tmp/requirejs',
    baseUrl: '.',
    paths: {
      app: './',
    },
    dir: './public/javascripts',
    onBuildRead: function (moduleName, path, contents) {
      return require('ng-annotate')(contents, {
        add: true
      }).src;
    },
    pragmasOnSave: {
      excludeJade: true
    }
  });

  if(grunt.option("debug")) {
    options.optimize = "none";
    options.optimizeCss = "none";
  }

//  console.log(JSON.stringify(options, null, 2));
  var files = [
    {
      cwd: './app/javascripts',
      src: '**',
      dest: 'tmp/requirejs',
      expand: true
    }
  ];

  engines.forEach(function(engine) {
    files.push({
      cwd: './engines/' + engine + '/app/javascripts',
      src: '**',
      dest: 'tmp/requirejs',
      expand: true
    });
  });

  // Project configuration.
  grunt.initConfig({
    copy: {
      app: {
        files: files
      }
    },
    shell: {
      startRailsServer: {
        command: 'rails server',
        options: {
          async: true
        }
      }
    },
    watch: {
      rubies: {
        files: ['**/*.rb', '!**/*_controller.rb'],
        tasks: ['shell:startRailsServer']
      }
    },
    requirejs: {
      options: {
        logLevel: 1
      },
      std: {
        options: options
      }
    }
  });


  grunt.loadNpmTasks("grunt-shell-spawn");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-requirejs");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.registerTask('build', ['copy:app', 'requirejs:std']);
  grunt.registerTask('run', ['shell:startRailsServer', 'watch:rubies']);
};