/* edit_project commander component
 * To use add require('../cmds/edit-project.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

var util              = require('../../util').instance;
var BaseCommand       = require('../../command');
var inherits          = require('inherits');
var EditorService     = require('../../editor');

function Command() {
  Command.super_.call(this, Array.prototype.slice.call(arguments, 0));
}

inherits(Command, BaseCommand);

Command.prototype.execute = function() {
  var self = this;

  if (self.isUICommand() && self.client.editor === 'sublime') {
    var editorService = new EditorService(self.client);
    editorService.launchUI('edit-project');   
  } else if (self.client.isHeadless()) {   
    self.getProject().edit(self.payload.package)
      .then(function() {
        self.respond('Project updated successfully!');
      })
      .catch(function(error) {
        self.respond('Could not compile metadata', false, error);
      })
      .done();  
  } else if (util.isInteractive()) {  
    self.respond('This command does not support interactive shell', false, new Error('command not supported'));
  }   
};

exports.command = Command;
exports.addSubCommand = function(client) {
  client.program
    .command('edit-project')
    .alias('edit')
    .option('--ui', 'Launches the default UI for the selected command.')
    .description('Edits an existing project')
    .action(function(){ 
      if (this.ui) {
        client.executeCommand(this._name, { args: { ui: true } });    
      } else {
        var self = this;
        util.getPayload()
          .then(function(payload) {
            client.executeCommand(self._name, payload); 
          });
      }         
    }); 
};
