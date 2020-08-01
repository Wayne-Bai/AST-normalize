/* 
 * Usage: 
 * 
 * var perfectapi = require('perfectapi');  
 * var path = require('path');
 * 
 * var configPath = path.resolve(__dirname, 'perfectapi.json');
 * var parser = new perfectapi.Parser();
 * 
 * //handle the commands
 * parser.on("mycommand", function(config, callback) {
 *   //do mycommand code, putting results into "result" object
 * 
 *   //after done
 *   callback(err, result);
 * });
 * 
 * parser.on("anothercommand", function(config, callback) {
 *   //do anothercommand code, putting results into "result" object
 * 
 *   //after done
 *   callback(err, result);
 * });
 * 
 * //expose the api
 * module.exports = parser.parse(configPath);
*/

var cli=require("./lib/cligen.js");
var proxy=require("./lib/proxy.js");

exports.Parser = cli.Parser;
exports.proxy = proxy.proxy;