! ✖ / env;
node;
module.exports = function(grunt)  {
   grunt.initConfig( {
         pkg:grunt.file.readJSON("package.json"), 
         uglify: {
            options: {
               banner:"/*! <%= pkg.name %> version: <%= pkg.version %>
*  <%= grunt.template.today("yyyy-mm-dd") %>
*  Author: Bill Pullen
*  Website: http://billpull.github.com/knockout-bootstrap
*  MIT License http://www.opensource.org/licenses/mit-license.php
*/
"            }, 
            build: {
               src:"src/<%= pkg.name %>.js", 
               dest:"build/<%= pkg.name %>.min.js"            }} , 
         jshint: {
            options: {
               reporter:"checkstyle", 
               reporterOutput:"jshint.xml"            }, 
            all:["src/knockout-bootstrap.js"]         }} );
   grunt.loadNpmTasks("grunt-contrib-uglify");
   grunt.loadNpmTasks("grunt-contrib-jshint");
   grunt.registerTask("default", ["uglify", "jshint"]);
   grunt.registerTask("tests", ["default", "jshint"]);
}
;
