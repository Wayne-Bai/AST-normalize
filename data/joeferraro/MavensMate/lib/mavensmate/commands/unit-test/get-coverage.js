/* compile-metadata commander component
 * To use add require('../cmds/compile-metadata.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

var inherits              = require('inherits');
var BaseCommand           = require('../../command');
var ApexTest              = require('../../test');
var MavensMateFile        = require('../../file').MavensMateFile;

function Command() {
  Command.super_.call(this, Array.prototype.slice.call(arguments, 0));
}

inherits(Command, BaseCommand);

Command.prototype.execute = function() {
  var self = this;
  var test = new ApexTest({
    project: self.getProject()
  });
  var commandPromise;
  if (self.payload.global) {
    commandPromise = test.getOrgWideCoverage();
  } else {
    var mmFile = new MavensMateFile({ project: self.getProject(), path: self.payload.paths[0] });
    test.apexClassOrTriggerIdToName[mmFile.id] = mmFile.basename;
    commandPromise = test.getCoverage([ mmFile.id ]);
  }
  commandPromise
    .then(function(res) {
        self.respond(res);
    })
    .catch(function(error) {
      self.respond('Could not get coverage', false, error);
    })
    .done(); 
};

exports.command = Command;
exports.addSubCommand = function(client) {
	client.program
		.command('get-coverage [apexClassOrTriggerPath]')
    .option('-g, --global', 'Org-wide coverage')
		.description('Gets coverage for a specified class')
		.action(function(apexClassOrTriggerPath){
      if (this.global) {
        client.executeCommand(this._name, {
          global: true
        });
      } else {
        client.executeCommand(this._name, {
          paths: [ apexClassOrTriggerPath ]
        }); 
      }
		});
};