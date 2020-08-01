'use strict';

var StructuredTextManager = require('../../services/manager/structured-text-manager');

var clone = require('lodash/lang/clone');

/**
 * @constructor
 */
function ChangeAlignmentCommand() {}

/**
 * Execute change alignment command
 *
 * @param args
 * @returns {*}
 */
ChangeAlignmentCommand.prototype.execute = function ChangeAlignmentCommand$execute(args) {
  var block, alignment, updatedBlock;

  block = clone(args.block, true);
  alignment = args.alignment;

  switch (block.type) {
    case 'paragraph':
      updatedBlock = StructuredTextManager.changeAlignment(block, alignment);
      return updatedBlock;
    default:
      return block;
  }
};

module.exports = new ChangeAlignmentCommand();

