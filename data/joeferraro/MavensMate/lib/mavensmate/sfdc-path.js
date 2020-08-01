'use strict';

var _               = require('lodash');
var fs              = require('fs-extra');
var path            = require('path');
var MetadataHelper  = require('./metadata').MetadataHelper;
var util            = require('./util').instance;

var types = {
    TOP_LEVEL_METADATA_DIRECTORY: 'TOP_LEVEL_METADATA_DIRECTORY',
    TOP_LEVEL_METADATA_FILE: 'TOP_LEVEL_METADATA_FILE',
    METADATA_FOLDER: 'METADATA_FOLDER',
    METADATA_FOLDER_ITEM: 'METADATA_FOLDER_ITEM',
    LIGHTNING_BUNDLE: 'LIGHTNING_BUNDLE',
    LIGHTNING_BUNDLE_ITEM: 'LIGHTNING_BUNDLE_ITEM'
};
Object.freeze(types);

var lightningTypes = {
    STYLE: 'STYLE',
    APPLICATION: 'APPLICATION',
    DOCUMENTATION: 'DOCUMENTATION',
    COMPONENT: 'COMPONENT',
    EVENT: 'EVENT',
    INTERFACE: 'INTERFACE',
    CONTROLLER: 'CONTROLLER',
    HELPER: 'HELPER',
    RENDERER: 'RENDERER'
};
Object.freeze(lightningTypes);

var SalesforcePath = function(p) {
  this.path = p;
  this.metadataHelper = new MetadataHelper();
  this.type = this.metadataHelper.getTypeByPath(this.path);
};

/**
 * whether the path represents a directory
 */
Object.defineProperty(SalesforcePath.prototype, 'isDirectory', {
  get: function() {
    if (this.type.xmlName === 'Document') {
      return path.extname(this.path) === ''; //TODO: some documents may not have an extension!
    } else {
      return path.extname(this.path) === '';      
    }
  }
});

/**
 * basename of path
 */
Object.defineProperty(SalesforcePath.prototype, 'basename', {
  get: function() {
    return path.basename(this.path);
  }
});

/**
 * basename of path without extension
 */
Object.defineProperty(SalesforcePath.prototype, 'name', {
  get: function() {
    return this.basename.split('.')[0]; 
  }
});

/**
 * basename of path without extension
 */
Object.defineProperty(SalesforcePath.prototype, 'folderName', {
  get: function() {
    return path.basename(path.dirname(this.path));
  }
});

/**
 * basename of path without extension
 */
Object.defineProperty(SalesforcePath.prototype, 'extension', {
  get: function() {
    return path.extname(this.path).replace(/./, '');
  }
});

/**
 * name when referenced via package.xml
 */
Object.defineProperty(SalesforcePath.prototype, 'packageName', {
  get: function() {
    if (this.classification === types.METADATA_FOLDER_ITEM) {
      return this.folderName + '/' + this.name;
    } else {
      return this.name;
    }
  }
});

Object.defineProperty(SalesforcePath.prototype, 'isToolingType', {
  get: function() {
    var supportedExtensions = ['cls', 'trigger', 'page', 'component'];
    return supportedExtensions.indexOf(this.extension) >= 0;
  }
});

Object.defineProperty(SalesforcePath.prototype, 'lightningType', {
  get: function() {
    if (this.extension === 'css') {
      return 'STYLE';
    } else if (this.extension === 'app') {
      return 'APPLICATION';
    } else if (this.extension === 'auradoc') {
      return 'DOCUMENTATION';
    } else if (this.extension === 'cmp') {
      return 'COMPONENT';
    } else if (this.extension === 'evt') {
      return 'EVENT';
    } else if (this.extension === 'intf') {
      return 'INTERFACE';
    } else if (this.extension === 'js') {
      if (util.endsWith(this.name, 'Controller')) {
        return 'CONTROLLER';
      } else if (util.endsWith(this.name, 'Helper')) {
        return 'HELPER';
      }  else if (util.endsWith(this.name, 'Renderer')) {
        return 'RENDERER';
      }
    } 
  }
});

/**
 * classification of the path
 */
Object.defineProperty(SalesforcePath.prototype, 'classification', {
  get: function() {
    if (this.type.inFolder) {
      var inFolderTypeDirectoryNames = this.metadataHelper.inFolderDirectoryNames;
      if (this.isDirectory) {
        if (inFolderTypeDirectoryNames.indexOf(path.basename(path.dirname(this.path))) >= 0) {
          return types.TOP_LEVEL_METADATA_DIRECTORY;
        } else {
          return types.METADATA_FOLDER;
        }
      } else {
        return types.METADATA_FOLDER_ITEM;
      }
    } else if (this.type.xmlName === 'AuraDefinitionBundle') {
      if (this.isDirectory) {
        return types.LIGHTNING_BUNDLE;
      } else {
        return types.LIGHTNING_BUNDLE_ITEM;
      }
    } else {
      if (this.isDirectory) {
        return types.TOP_LEVEL_METADATA_DIRECTORY;
      } else {
        return types.TOP_LEVEL_METADATA_FILE;
      }
    }
  }
});

/**
 * Returns whether this path type requires a corresponding meta file
 * @return {String}
 */
Object.defineProperty(SalesforcePath.prototype, 'hasMetaFile', {
  get: function() {
    return this.type.metaFile === true;
  }
});

/**
* Whether the instance exists on the disk (or virtual disk (future))
* @return {Boolean}
*/
Object.defineProperty(SalesforcePath.prototype, 'existsOnFileSystem', {
  get: function() {
    return this.path ? fs.existsSync(this.path) : false;
  }
});

SalesforcePath.prototype.deleteLocally = function() {
  if (this.hasMetaFile && fs.existsSync(this.path+'-meta.xml')) {
    fs.remove(this.path+'-meta.xml');
  }
  if (this.existsOnFileSystem) {
    fs.remove(this.path);    
  }
};

module.exports.createProjectFiles = function(paths) {
  var salesforcePaths = [];
  _.each(paths, function(p) {
    salesforcePaths.push(new SalesforcePath(p));
  });
  return salesforcePaths;
};

module.exports.getLightningBundleItems = function(sfdcPaths) {
  var lbips = [];
  _.each(sfdcPaths, function(p) {
    if (p.classification === types.LIGHTNING_BUNDLE_ITEM) {
      lbips.push(p);
    }
  });
  return lbips;
};

module.exports.createPackageSubscription = function(sfdcPaths, projectPackageXml, exludeToolingMetadata) {
  var subscription = {};
  var projectSubscription = projectPackageXml.subscription;
  _.each(sfdcPaths, function(p) {
    if (p.isToolingType && exludeToolingMetadata) {
      return; // (continue)
    }
    if (p.classification === types.TOP_LEVEL_METADATA_DIRECTORY) {
      // classes, ApexClass
      subscription[p.type.xmlName] = projectSubscription[p.type.xmlName];
    } else if (p.classification === types.TOP_LEVEL_METADATA_FILE) {
      if (subscription[p.type.xmlName]) {
        if (subscription[p.type.xmlName] !== '*') {
          subscription[p.type.xmlName].push(p.packageName);
        }
      } else {
        subscription[p.type.xmlName] = [ p.packageName ];          
      }
    } else if (p.classification === types.METADATA_FOLDER || p.classification === types.METADATA_FOLDER_ITEM) {
      if (subscription[p.type.xmlName]) {
        subscription[p.type.xmlName].push(p.packageName);
      } else {
        subscription[p.type.xmlName] = [ p.packageName ];          
      }  
    } else if (p.classification === types.LIGHTNING_BUNDLE) {
      if (subscription[p.type.xmlName]) {
        subscription[p.type.xmlName].push(p.packageName);
      } else {
        subscription[p.type.xmlName] = [ p.packageName ];          
      }   
    }
  });
  return subscription;
};

module.exports.types = types;
module.exports.SalesforcePath = SalesforcePath;
