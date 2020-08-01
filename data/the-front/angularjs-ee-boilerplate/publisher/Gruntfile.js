module.exports = function(grunt) {
  'use strict';

  require('time-grunt')(grunt);
  require('jit-grunt')(grunt, {
    gitclone: 'grunt-git'
  })({
    customTasksDir: 'helpers/grunt/tasks'
  });

  var path = require('path'),
      cwd =  process.cwd();

  // Initialize config
  grunt.initConfig({
    pkg: require('./package.json'),
    mainPkg: require(path.join(cwd, '../package.json'))
  });

  // load tasks config per file
  grunt.loadTasks('helpers/grunt/config');

  //--- grunt tasks

  grunt.registerTask('default', ['jshint']);

  grunt.registerTask('init', [
    'jshint',
    'clean:branch_dir',
    'gitclone:target'
  ]);

  grunt.registerTask('publish',  function(target) { // default: prod workflow
    var message = 'publish ',
        tasks = [
          'jshint',
          'clean:branch_dir_content',
          'copy:gitignore'
        ];

    if(target === 'dev') {
      message += 'dev code';
      tasks = tasks.concat([
        'shell:projectBuildDev',
        'copy:projectDev',
        'shell:projectClean',
        'githubPages:devCode'
      ]);
    } else { // prod
      message += 'prod code';
      tasks = tasks.concat([
        'shell:projectBuildProd',
        'copy:projectProd',
        'shell:projectClean',
        'githubPages:prodCode'
      ]);
    }

    grunt.log.writeln(message);
    //console.log(tasks);
    return grunt.task.run(tasks);
  });

};
