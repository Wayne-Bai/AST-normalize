/* index-metadata commander component
 * To use add require('../cmds/index-metadata.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

var inherits       = require('inherits');
var BaseCommand    = require('../../command');

function Command() {
  Command.super_.call(this, Array.prototype.slice.call(arguments, 0));
}

inherits(Command, BaseCommand);

Command.prototype.execute = function() {
  var self = this;
  var project = self.getProject();
  project.indexMetadata()
    .then(function() {
      self.respond('Metadata successfully indexed');
    })
    .catch(function(error) {
      self.respond('Could not index metadata', false, error);
    })
    .done();
};

exports.command = Command;
exports.addSubCommand = function(client) {
  client.program
    .command('index-metadata')
    .description('Indexes project\'s metadata')
    .action(function(/* Args here */){
      client.executeCommand(this._name);  
    });
};