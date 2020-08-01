var path = require("path");
var exec = require("child_process").exec;

module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-gitbook');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.initConfig({
    'gitbook': {
      development: {
        output: path.join(__dirname, ".grunt/gitbook"),
        input: "./",
        title: "Javascript Challenges",
        description: "Challenge your self to learn and understand the most obscure and tricky parts of Javascript.",
        github: "tcorral/javascript-challenges-book"
      }
    },
    'gh-pages': {
      options: {
        base: '.grunt/gitbook'
      },
      src: ['**']
    },
    'clean': {
      files: '.grunt'
    }
  });

  grunt.registerTask('publish', [
    'gitbook',
    'gh-pages',
    'clean'
  ]);
  grunt.registerTask('pdf', function (grunt){
    var done = this.async();
    exec('gitbook pdf ./', function (err, stdout, stderr) {
      if(err){
        console.log('exec error:' + error);
      }
      console.log('stderr:', stderr);
      console.log('stdout:', stdout);
      done();
    })
  });
  grunt.registerTask('epub', function (grunt){
    var done = this.async();
    exec('gitbook ebook ./', function (err, stdout, stderr) {
      if(err){
        console.log('exec error:' + error);
      }
      console.log('stderr:', stderr);
      console.log('stdout:', stdout);
      done();
    })
  });
  grunt.registerTask('default', ['gitbook', 'pdf', 'epub']);
};