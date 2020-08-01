/* start-logging commander component
 * To use add require('../cmds/start-logging.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

var inherits          = require('inherits');
var BaseCommand       = require('../../command');
var CheckpointService = require('../../checkpoint');

function Command() {
  Command.super_.call(this, Array.prototype.slice.call(arguments, 0));
}

inherits(Command, BaseCommand);

Command.prototype.execute = function() {
  var self = this;
  var project = self.getProject();
  var checkpointService = new CheckpointService(project);
  checkpointService.listCheckpoints(self.payload.path)
    .then(function(res) {
      self.respond(res);
    })
    .catch(function(error) {
      self.respond('Could not list checkpoints', false, error);
    })
    .done();
};

exports.command = Command;
exports.addSubCommand = function(client) {
  client.program
    .command('new-checkpoint [filePath]')
    .description('List Apex checkpoints for filepath')
    .action(function(filePath){
      client.executeCommand(this._name, {
        path: filePath
      });  
    });
};