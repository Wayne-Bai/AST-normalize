/* open-metadata commander component
 * To use add require('../cmds/open-metadata.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

var Promise             = require('bluebird');
var util                = require('../../util').instance;
var inherits            = require('inherits');
var BaseCommand         = require('../../command');
var _                   = require('lodash');
var EditorService       = require('../../editor');
var MavensMateFile      = require('../../file').MavensMateFile;
var mavensMateFileTypes = require('../../file').types;
var logger              = require('winston');

function Command() {
  Command.super_.call(this, Array.prototype.slice.call(arguments, 0));
}

inherits(Command, BaseCommand);

Command.prototype.execute = function() {
  var self = this;
  var paths = self.payload.paths;
  var project = self.getProject();
  var editorService = new EditorService(self.client);
  var frontdoorUrl = project.sfdcClient.getInstanceUrl() + '/secur/frontdoor.jsp?sid=' + project.sfdcClient.getAccessToken() + '&retURL=';
  var openUrlPromises = [];
  var urls = {};
  _.each(paths, function(p) {
    var mmFile = new MavensMateFile({ project: project, path: p });
    var retUrl = '';
    if (mmFile.type.xmlName === 'ApexPage' && self.payload.preview) {
      retUrl = '/apex/' + mmFile.name;
    } else if (mmFile.isLightningType && self.payload.preview) {
      var bundleName;
      if (mmFile.classification === mavensMateFileTypes.LIGHTNING_BUNDLE_ITEM) {
        bundleName = mmFile.folderBaseName;
      } else {
        bundleName = mmFile.name;
      }
      // retUrl = project.sfdcClient.getInstanceUrl() + '/' + project.sfdcClient.getNamespace() + '/' + bundleName + '.app'; // TODO: non app lightning will not work
      retUrl = '/' + project.sfdcClient.getNamespace() + '/' + bundleName + '.app'; // TODO: non app lightning will not work
    } else {
      if (mmFile.type.xmlName === 'CustomObject') {
        retUrl = '/p/setup/layout/LayoutFieldList?type=' + mmFile.name + '%23CustomFieldRelatedList_target';
      } else {
        retUrl = '/' + mmFile.id;
      }
    }
    logger.debug('url generated : '+frontdoorUrl+retUrl);
    if (self.payload.callThrough) {
      openUrlPromises.push( editorService.openUrl(frontdoorUrl+retUrl) );      
    } else {
      urls[mmFile.basename] = frontdoorUrl+retUrl;  
    }
  });

  if (self.payload.callThrough) {
    Promise.all(openUrlPromises)
      .then(function() {
        self.respond('Success');
      })
      .catch(function(err) {
        self.respond('Could not open urls', false, err);
      });
  } else {
    self.respond(urls);  
  }
};

exports.command = Command;
exports.addSubCommand = function(client) {
  client.program
    .command('open-metadata [path]')
    .description('Opens metadata in the browser')
    .action(function(path){
      if (path) {
        client.executeCommand(this._name, {
          paths : util.getAbsolutePaths( [ path ] )
        });
      } else {
        var self = this;
        util.getPayload()
          .then(function(payload) {
            client.executeCommand(self._name, payload); 
          });
      }
    });
};