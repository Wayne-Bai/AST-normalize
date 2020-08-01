'use strict';

var AppDispatcher = require('../dispatcher/app-dispatcher');
var BlockConstants = require('../constants/block-constants');

module.exports = {
  addBlock: function(type) {
    AppDispatcher.handleViewAction({
      actionType: BlockConstants.actions.ADD_BLOCK,
      type: type
    });
  },
  removeBlock: function(index) {
    AppDispatcher.handleViewAction({
      actionType: BlockConstants.actions.REMOVE_BLOCK,
      index: index
    });
  },
  addText: function(index, text) {
    AppDispatcher.handleViewAction({
      actionType: BlockConstants.actions.ADD_TEXT,
      index: index,
      text: text
    });
  },
  removeText: function(index, removeRight) {
    AppDispatcher.handleViewAction({
      actionType: BlockConstants.actions.REMOVE_TEXT,
      index: index,
      removeRight: removeRight
    });
  },
  addTag: function(index, type, data) {
    AppDispatcher.handleViewAction({
      actionType: BlockConstants.actions.ADD_TAG,
      index: index,
      type: type,
      data: data
    });
  },
  removeTag: function(index, type) {
    AppDispatcher.handleViewAction({
      actionType: BlockConstants.actions.REMOVE_TAG,
      index: index,
      type: type
    });
  },
  changeAlignment: function(index, alignment) {
    AppDispatcher.handleViewAction({
      actionType: BlockConstants.actions.CHANGE_ALIGNMENT,
      index: index,
      alignment: alignment
    });
  }
};
