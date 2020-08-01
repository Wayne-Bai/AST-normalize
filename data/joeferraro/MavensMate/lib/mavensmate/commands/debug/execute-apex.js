/* execute-apex commander component
 * To use add require('../cmds/execute-apex.js')(program) to your commander.js based node executable before program.parse
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
    editorService.launchUI('execute-apex');   
  } else {
    self.getProject().sfdcClient.executeApex(self.payload)
      .then(function(result) {
        self.respond(result);
      })
      .catch(function(error) {
        self.respond('Could not execute anonymous apex', false, error);
      })
      .done();
  }  
};

exports.command = Command;
exports.addSubCommand = function(client) {
  client.program
    .command('execute-apex')
    .option('--ui', 'Launches the Apex execute anonymous UI.')
    .description('Execute Apex code anonymously')
    .action(function(/* Args here */){
      if (this.ui) {
        client.executeCommand(this._name, { args: { ui: true } });    
      } else if (client.isHeadless()) {
        var self = this;
        util.getPayload()
          .then(function(payload) {
            client.executeCommand(self._name, payload); 
          });
      }  
    });
};