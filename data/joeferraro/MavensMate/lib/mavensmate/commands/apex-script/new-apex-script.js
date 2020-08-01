/* execute-apex commander component
 * To use add require('../cmds/execute-apex.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

var BaseCommand       = require('../../command');
var inherits          = require('inherits');
var ApexScriptService = require('../../apex-script');

function Command() {
  Command.super_.call(this, Array.prototype.slice.call(arguments, 0));
}

inherits(Command, BaseCommand);

Command.prototype.execute = function() {
  var self = this;
  var apexScriptService = new ApexScriptService(self.getProject());
  apexScriptService.create(self.payload.name)
    .then(function(result) {
      self.respond(result);
    })
    .catch(function(error) {
      self.respond('Could not create apex script', false, error);
    })
    .done();
};

exports.command = Command;
exports.addSubCommand = function(client) {
  client.program
    .command('new-apex-script [scriptName]')
    .description('Creates a new apex script')
    .action(function(scriptName){
      if (scriptName) {
        client.executeCommand(this._name, { name: scriptName });        
      } else {
        console.error('Please specify a script name');
        process.exit(1);
      }
    });
};