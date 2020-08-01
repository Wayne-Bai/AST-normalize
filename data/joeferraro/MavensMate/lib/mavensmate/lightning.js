'use strict';

var Promise = require('bluebird');
var _       = require('lodash');
var path    = require('path');
var logger  = require('winston');
var util    = require('./util').instance;

// TODO: move source strings to swig templates

var LightningService = function(project){
  this.project = project;
  this.sfdcClient = project.sfdcClient;
};

LightningService.prototype.getAll = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.sfdcClient.conn.tooling.query('Select Id, AuraDefinitionBundleId,AuraDefinitionBundle.DeveloperName,DefType,Format FROM AuraDefinition', function(err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res.records);
      }
    });
  });
};

LightningService.prototype.createBundle = function(apiName, description) {
  var self = this;
  logger.debug('Creating lightning bundle: '+apiName);
  return new Promise(function(resolve, reject) {
    self.sfdcClient.conn.tooling.sobject('AuraDefinitionBundle').create({
      Description: description, // my description
      DeveloperName: apiName, // cool_bro
      MasterLabel: apiName, // cool bro
      ApiVersion: self.sfdcClient.apiVersion || '32.0'
    }, function(err, res) {
      if (err) { 
        reject(err);
      } else {
        logger.debug('Lightning bundle creation result: ');
        logger.debug(res);
        resolve(res);
      }
    });
  });
};

LightningService.prototype.deleteBundle = function(bundleId) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.sfdcClient.conn.tooling.sobject('AuraDefinitionBundle').delete(bundleId, function(err, res) {
      if (err) { 
        reject(new Error('Could not delete AuraBundle: '+err.message));
      } else {
        resolve(res);
      }
    });
  });
};

LightningService.prototype.deleteBundleItems = function(mavensmateFiles) {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (mavensmateFiles.length === 0) {
      return resolve();
    } else {
      self.project.getLightningIndex()
        .then(function(lightningIndex) {
          logger.debug(lightningIndex);
          var deleteIds = [];
          _.each(mavensmateFiles, function(mmf) {
            var lightningBundleName = mmf.folderName; //mybundle
            var lightningType = mmf.lightningType;
            logger.debug('deleting lightning type: '+lightningType);
            logger.debug('deleting lightningBundleName: '+lightningBundleName);
            deleteIds.push(_.find(lightningIndex, { AuraDefinitionBundle : { DeveloperName: lightningBundleName }, DefType: lightningType }).Id);
          });
          logger.debug('deleting lightning components!!');
          logger.debug(mavensmateFiles);
          logger.debug(deleteIds);
          self.sfdcClient.conn.tooling.sobject('AuraDefinition').delete(deleteIds, function(err, res) {
            if (err) { 
              reject(new Error('Could not delete AuraBundle item: '+err.message));
            } else {
              resolve(res);
            }
          });
        })
        .catch(function(err) {
          reject(new Error('Could not get delete bundle items: '+err.message));
        });
    }
  });
};

LightningService.prototype.getBundle = function(bundleId) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.sfdcClient.conn.tooling.query('Select Id, AuraDefinitionBundleId,AuraDefinitionBundle.DeveloperName,DefType,Format FROM AuraDefinition WHERE AuraDefinitionBundleId = \''+bundleId+'\'', function(err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

LightningService.prototype.getBundleItems = function(mavensmateFiles) {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (mavensmateFiles.length === 0) {
      return resolve();
    } else {
      logger.debug('attempting to get index');
      self.project.getLightningIndex()
        .then(function(lightningIndex) {
          logger.debug('got lightning index');
          logger.debug(lightningIndex);
          var itemIds = [];
          _.each(mavensmateFiles, function(mmf) {
            var lightningBundleName = mmf.folderName; //mybundle
            var lightningType = mmf.lightningType;
            logger.debug('getting lightning type: '+lightningType);
            logger.debug('getting lightningBundleName: '+lightningBundleName);
            itemIds.push(_.find(lightningIndex, { AuraDefinitionBundle : { DeveloperName: lightningBundleName }, DefType: lightningType }).Id);
          });
          logger.debug('getting lightning components!!');
          logger.debug(itemIds);
          self.sfdcClient.conn.tooling.query('Select Id,AuraDefinitionBundleId,AuraDefinitionBundle.DeveloperName,DefType,Format,Source FROM AuraDefinition WHERE Id IN ('+util.joinForQuery(itemIds)+')', function(err, res) {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
        })
        .catch(function(err) {
          reject(new Error('Could not get bundle items: '+err.message));
        });
    }
  });
};

/**
 * Updates one or more lightning components
 * @param  {Array} - array of File instances
 * @return {Promise}          
 */
LightningService.prototype.update = function(files) {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (files.length === 0) {
      resolve();
    } else {
      self.project.getLightningIndex()
        .then(function(lightningIndex) {
          logger.debug(lightningIndex);
          var updatePayload = [];
          _.each(files, function(f) {
            var lightningBundleName = path.basename(path.dirname(f.path)); //mybundle
            var lightningType = f.lightningType;
            logger.debug('lightning type: '+lightningType);
            logger.debug('lightningBundleName: '+lightningBundleName);
            var payloadItem = {
              Source: f.body,
              Id: _.find(lightningIndex, { AuraDefinitionBundle : { DeveloperName: lightningBundleName }, DefType: lightningType }).Id
            };
            updatePayload.push(payloadItem);
          });
          logger.debug('updating lightning components!!');
          logger.debug(updatePayload);
          self.sfdcClient.conn.tooling.sobject('AuraDefinition').update(updatePayload, function(err, res) {
            if (err) { 
              reject(err);
            } else {
              resolve(res);
            }
          });
        })
        .catch(function(err) {
          reject(new Error('Could not update lightning components: '+err.message));
        });
    }
  });
};

LightningService.prototype.updateComponent = function(id, source) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.sfdcClient.conn.tooling.sobject('AuraDefinition').update({
      Id : id,
      Source : source
    }, function(err, res) {
      if (err) { 
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

LightningService.prototype.createComponent = function(bundleId) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.sfdcClient.conn.tooling.sobject('AuraDefinition').create({
      AuraDefinitionBundleId: bundleId,
      DefType: 'COMPONENT',
      Format: 'XML', 
      Source: '<aura:component></aura:component>'
    }, function(err, res) {
      if (err) { 
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

LightningService.prototype.createApplication = function(bundleId) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.sfdcClient.conn.tooling.sobject('AuraDefinition').create({
      AuraDefinitionBundleId: bundleId,
      DefType: 'APPLICATION',
      Format: 'XML', 
      Source: '<aura:application></aura:application>'
    }, function(err, res) {
      if (err) { 
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

LightningService.prototype.createInterface = function(bundleId) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.sfdcClient.conn.tooling.sobject('AuraDefinition').create({
      AuraDefinitionBundleId: bundleId,
      DefType: 'INTERFACE',
      Format: 'XML', 
      Source: '<aura:interface description="Interface template">\n\t<aura:attribute name="example" type="String" default="" description="An example attribute."/>\n</aura:interface>'
    }, function(err, res) {
      if (err) { 
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

LightningService.prototype.createDocumentation = function(bundleId) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.sfdcClient.conn.tooling.sobject('AuraDefinition').create({
      AuraDefinitionBundleId: bundleId,
      DefType: 'DOCUMENTATION',
      Format: 'XML', 
      Source: '<aura:documentation>\n\t<aura:description>Documentation</aura:description>\n\t<aura:example name="ExampleName" ref="exampleComponentName" label="Label">\n\t\tExample Description\n\t</aura:example>\n</aura:documentation>'
    }, function(err, res) {
      if (err) { 
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

LightningService.prototype.createController = function(bundleId) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.sfdcClient.conn.tooling.sobject('AuraDefinition').create({
      AuraDefinitionBundleId: bundleId,
      DefType: 'CONTROLLER',
      Format: 'JS', 
      Source: '({\n\tmyAction : function(component, event, helper) {\n\t}\n})'
    }, function(err, res) {
      if (err) { 
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

LightningService.prototype.createRenderer = function(bundleId) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.sfdcClient.conn.tooling.sobject('AuraDefinition').create({
      AuraDefinitionBundleId: bundleId,
      DefType: 'RENDERER',
      Format: 'JS', 
      Source: '({\n\t// Your renderer method overrides go here\n})'
    }, function(err, res) {
      if (err) { 
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

LightningService.prototype.createHelper = function(bundleId) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.sfdcClient.conn.tooling.sobject('AuraDefinition').create({
      AuraDefinitionBundleId: bundleId,
      DefType: 'HELPER',
      Format: 'JS', 
      Source: '({\n\thelperMethod : function() {\n\t}\n})'
    }, function(err, res) {
      if (err) { 
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

LightningService.prototype.createStyle = function(bundleId) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.sfdcClient.conn.tooling.sobject('AuraDefinition').create({
      AuraDefinitionBundleId: bundleId,
      DefType: 'STYLE',
      Format: 'CSS', 
      Source: '.THIS {\n}'
    }, function(err, res) {
      if (err) { 
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

LightningService.prototype.createEvent = function(bundleId) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.sfdcClient.conn.tooling.sobject('AuraDefinition').create({
      AuraDefinitionBundleId: bundleId,
      DefType: 'EVENT',
      Format: 'XML', 
      Source: '<aura:event type="APPLICATION" description="Event template" />'
    }, function(err, res) {
      if (err) { 
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

module.exports = LightningService;