"use strict";

var Substance = require('substance');
var Document = Substance.Document;
var Selection = Document.Selection;

// Writer Controller
// ----------------
//
// An common interface for all writer modules

var WriterController = function(opts) {
  Substance.EventEmitter.call(this);

  this.config = opts.config;
  this.doc = opts.doc;
  this.writerComponent = opts.writerComponent;
  this.surfaces = {};

  this.doc.connect(this, {
    'transaction:started': this.transactionStarted,
    'document:changed': this.onDocumentChanged
  });

};

WriterController.Prototype = function() {

  // API method used by writer modules to modify the writer state
  this.replaceState = function(newState) {
    this.writerComponent.replaceState(newState);
  };

  this.transactionStarted = function(tx) {
    // store the state so that it can be recovered when undo/redo
    tx.before.state = this.writerComponent.state;
    tx.before.selection = this.getSelection();
    if (this.activeSurface) {
      tx.before.surfaceName = this.activeSurface.name;
    }
  };

  this.registerSurface = function(surface, name) {
    name = name || Substance.uuid();
    this.surfaces[name] = surface;
    if (surface.name) {
      throw new Error("Surface has already been attached");
    }
    // HACK! we store a name on the surface for later decision making
    surface.name = name;
    surface.connect(this, {
      'selection:changed': function(sel) {
        this.updateSurface(surface);
        this.onSelectionChanged(sel);
        this.emit('selection:changed', sel);
      }
    });
  };

  this.onSelectionChanged = function(sel) {
    var modules = this.getModules();
    var handled = false;
    for (var i = 0; i < modules.length && !handled; i++) {
      var stateHandlers = modules[i].stateHandlers;
      if (stateHandlers && stateHandlers.handleSelectionChange) {
        handled = stateHandlers.handleSelectionChange(this, sel);
      }
    }
  };

  this.onDocumentChanged = function(change, info) {
    this.doc.__dirty = true;
    var notifications = this.writerComponent.context.notifications;

    notifications.addMessage({
      type: "info",
      message: "Unsaved changes"
    });

    if (info.replay) {
      this.replaceState(change.after.state);
      var self = this;
      window.setTimeout(function() {
        if (change.after.surfaceName) {
          var surface = self.surfaces[change.after.surfaceName];
          surface.setSelection(change.after.selection);
        }
      });
    }
  };

  this.updateSurface = function(surface) {
    this.activeSurface = surface;
  };

  this.getSurface = function() {
    return this.activeSurface;
  };

  this.getSelection = function() {
    if (!this.activeSurface) return Document.nullSelection;
    return this.activeSurface.getSelection();
  };

  this.unregisterSurface = function(surface) {
    Substance.each(this.surfaces, function(s, name) {
      if (surface === s) {
        delete this.surfaces[name];
      }
    }, this);

    surface.disconnect(this);
  };

  // Remove since we have a property getter already?
  this.getState = function() {
    return this.writerComponent.state;
  };

  this.getModules = function() {
    return this.config.modules;
  };

  this.getNodeComponentClass = function(nodeType) {
    var modules = this.config.modules;
    var NodeClass;

    for (var i = 0; i < modules.length; i++) {
      var ext = modules[i];
      if (ext.components && ext.components[nodeType]) {
        NodeClass = ext.components[nodeType];
      }
    }

    if (!NodeClass) throw new Error("No component found for "+nodeType);
    return NodeClass;
  };

  this.getPanels = function() {
    var modules = this.config.modules;
    var panels = [];

    for (var i = 0; i < modules.length; i++) {
      var ext = modules[i];
      panels = panels.concat(ext.panels);
    }
    return panels;
  };

  // Get all available tools from modules
  this.getTools = function() {
    var modules = this.config.modules;
    var tools = [];

    for (var i = 0; i < modules.length; i++) {
      var ext = modules[i];
      if (ext.tools) {
        tools = tools.concat(ext.tools);
      }
    }
    return tools;
  };

  // Based on a certain writer state, determine what should be
  // highlighted in the scrollbar. Maybe we need to create custom
  // handlers for highlights in modules, since there's no
  // general way of determining the highlights

  this.getHighlightedNodes = function() {
    var modules = this.getModules();
    var highlightedNodes = null;
    for (var i = 0; i < modules.length && !highlightedNodes; i++) {
      var stateHandlers = modules[i].stateHandlers;
      if (stateHandlers && stateHandlers.getHighlightedNodes) {
        highlightedNodes = stateHandlers.getHighlightedNodes(this);
      }
    }
    return highlightedNodes || [];
  };

  this.getActiveContainerAnnotations = function() {
    var modules = this.getModules();
    var activeContainerAnnotations = null;
    for (var i = 0; i < modules.length && !activeContainerAnnotations; i++) {
      var stateHandlers = modules[i].stateHandlers;
      if (stateHandlers && stateHandlers.getActiveContainerAnnotations) {
        activeContainerAnnotations = stateHandlers.getActiveContainerAnnotations(this);
      }
    }
    return activeContainerAnnotations || [];
  };

  this.deleteAnnotation = function(annotationId) {
    var anno = this.doc.get(annotationId);
    var tx = this.doc.startTransaction({ selection: this.getSelection() });
    tx.delete(annotationId);
    tx.save({ selection: Selection.create(anno.path, anno.range[0], anno.range[1]) });
  };

  this.annotate = function(annoSpec) {
    var sel = this.getSelection();

    var range = annoSpec.range;
    var path = annoSpec.path;

    // Use active selection for retrieving path and range
    if (!path || !range) {
      if (sel.isNull()) throw new Error("Selection is null");
      if (!sel.isPropertySelection()) throw new Error("Selection is not a PropertySelection");
      path = sel.getPath();
      range = sel.getTextRange();
    }

    var annotation = Substance.extend({}, annoSpec);
    annotation.id = annoSpec.id || annoSpec.type+"_" + Substance.uuid();
    annotation.path = path;
    annotation.range = range;

    // start the transaction with an initial selection
    var tx = this.doc.startTransaction({ selection: this.getSelection() });
    annotation = tx.create(annotation);
    tx.save({ selection: Selection.create(path, range[0], range[1]) });

    return annotation;
  };

};


Substance.inherit(WriterController, Substance.EventEmitter);

Object.defineProperty(WriterController.prototype, 'state', {
  get: function() {
    return this.writerComponent.state;
  },
  set: function() {
    throw new Error("Immutable property. Use replaceState");
  }
});


module.exports = WriterController;