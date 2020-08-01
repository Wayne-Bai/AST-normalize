'use strict';

var StructuredTextManager = require('../../services/manager/structured-text-manager');
var SelectionStore = require('../../stores/selection-store');

var Range = require('../../../lib/math/range');
var clone = require('lodash/lang/clone');

/**
 * @constructor
 */
function AddTagCommand() {}

/**
 * Execute add bold command
 *
 * @param args
 * @returns {*}
 */
AddTagCommand.prototype.execute = function AddTagCommand$execute(args) {
  var block, type, data, selection, updatedBlock, offset;

  selection = SelectionStore.getSelection();

  if (null === selection) {
    return args.block;
  }

  block = clone(args.block, true);
  type = args.type;
  data = args.data;

  switch (block.type) {
    case 'paragraph':
      if (selection.collapsed) {
        return args.block;
      }

      var range = new Range(selection.start, selection.end);

      updatedBlock = StructuredTextManager.addTag(block, type, range, data);

      return updatedBlock;
    default:
      return block;
  }
};

module.exports = new AddTagCommand();

