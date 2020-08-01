/* This file was generated with PyCow - the Python to JavaScript translator */

/* 
 * PyGoWave Client Script a.k.a. Microwave
 * Copyright (C) 2009 by p2k
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 */

window.pygowave = $defined(window.pygowave) ? window.pygowave : {};

/**
 * Operations module.
 * @module pygowave.operations
 */
pygowave.operations = (function() {
	/* from pycow.decorators import Class, Implements */;

	/* from pycow.utils import Events, Array */;

	var DOCUMENT_INSERT = "DOCUMENT_INSERT";

	var DOCUMENT_DELETE = "DOCUMENT_DELETE";

	var DOCUMENT_ELEMENT_INSERT = "DOCUMENT_ELEMENT_INSERT";

	var DOCUMENT_ELEMENT_DELETE = "DOCUMENT_ELEMENT_DELETE";

	var WAVELET_ADD_PARTICIPANT = "WAVELET_ADD_PARTICIPANT";

	var WAVELET_REMOVE_PARTICIPANT = "WAVELET_REMOVE_PARTICIPANT";

	var WAVELET_APPEND_BLIP = "WAVELET_APPEND_BLIP";

	var BLIP_CREATE_CHILD = "BLIP_CREATE_CHILD";

	var BLIP_DELETE = "BLIP_DELETE";

	var DOCUMENT_ELEMENT_DELTA = "DOCUMENT_ELEMENT_DELTA";

	var DOCUMENT_ELEMENT_SETPREF = "DOCUMENT_ELEMENT_SETPREF";

	/**
	 * Represents a generic operation applied on the server.
	 *
	 * This operation class contains data that is filled in depending on the
	 * operation type.
	 *
	 * It can be used directly, but doing so will not result
	 * in local, transient reflection of state on the blips. In other words,
	 * creating a "delete blip" operation will not remove the blip from the local
	 * context for the duration of this session. It is better to use the OpBased
	 * model classes directly instead.
	 *
	 * @class {private} pygowave.operations.Operation
	 */
	var Operation = new Class({

		/**
		 * Initializes this operation with contextual data.
		 *
		 * @constructor {public} initialize
		 * @param {String} op_type Type of operation
		 * @param {String} waveId The id of the wave that this operation is to
		 * be applied.
		 * @param {String} waveletId The id of the wavelet that this operation is
		 * to be applied.
		 * @param {optional String} blipId The optional id of the blip that this
		 * operation is to be applied.
		 * @param {optional int} index Optional integer index for content-based
		 * operations.
		 * @param {optional Object} prop A weakly typed property object is based
		 * on the context of this operation.
		 */
		initialize: function (op_type, waveId, waveletId, blipId, index, prop) {
			if (!$defined(blipId)) blipId = "";
			if (!$defined(index)) index = -1;
			if (!$defined(prop)) prop = null;
			this.type = op_type;
			this.waveId = waveId;
			this.waveletId = waveletId;
			this.blipId = blipId;
			this.index = index;
			this.property = prop;
		},

		/**
		 * Create a copy of this operation.
		 *
		 * @function {public Boolean} clone
		 */
		clone: function () {
			return new Operation(this.type, this.waveId, this.waveletId, this.blipId, this.index, this.property);
		},

		/**
		 * Return weather this operation is a null operation i.e. it does not
		 * change anything.
		 *
		 * @function {public Boolean} isNull
		 */
		isNull: function () {
			if (this.type == DOCUMENT_INSERT)
				return len(this.property) == 0;
			else if (this.type == DOCUMENT_DELETE)
				return this.property == 0;
			return false;
		},

		/**
		 * Check if the operation can be influenced by `other_op` and vice-versa.
		 *
		 * @function {public Boolean} isCompatibleTo
		 * @param {Operation} other_op
		 */
		isCompatibleTo: function (other_op) {
			if (this.waveId != other_op.waveId || this.waveletId != other_op.waveletId || this.blipId != other_op.blipId)
				return false;
			return true;
		},

		/**
		 * Returns true, if this op is an insertion operation.
		 *
		 * @function {public Boolean} isInsert
		 */
		isInsert: function () {
			return this.type == DOCUMENT_INSERT || this.type == DOCUMENT_ELEMENT_INSERT;
		},

		/**
		 * Returns true, if this op is a deletion operation.
		 *
		 * @function {public Boolean} isDelete
		 */
		isDelete: function () {
			return this.type == DOCUMENT_DELETE || this.type == DOCUMENT_ELEMENT_DELETE;
		},

		/**
		 * Returns true, if this op is an (attribute) change operation.
		 *
		 * @function {public Boolean} isChange
		 */
		isChange: function () {
			return this.type == DOCUMENT_ELEMENT_DELTA || this.type == DOCUMENT_ELEMENT_SETPREF;
		},

		/**
		 * Returns the length of this operation.
		 * This can be interpreted as the distance a concurrent operation's index
		 * must be moved to include the effects of this operation.
		 *
		 * @function {public int} length
		 */
		length: function () {
			if (this.type == DOCUMENT_INSERT)
				return len(this.property);
			else if (this.type == DOCUMENT_DELETE)
				return this.property;
			else if (this.type == DOCUMENT_ELEMENT_INSERT || this.type == DOCUMENT_ELEMENT_DELETE)
				return 1;
			return 0;
		},

		/**
		 * Delete operations: Sets the amount of deleted characters/elements to
		 * `value`.
		 *
		 * Other operations: No effect.
		 *
		 * @function {public} resize
		 * @param {int} value
		 */
		resize: function (value) {
			if (this.type == DOCUMENT_DELETE) {
				if (value > 0)
					this.property = value;
				else
					this.property = 0;
			}
		},

		/**
		 * DOCUMENT_INSERT: Inserts the string into the property.
		 *
		 * Other operations: No effect.
		 *
		 * @function {public} insertString
		 * @param {int} pos Position to insert the string
		 * @param {String} s String to insert
		 */
		insertString: function (pos, s) {
			if (this.type == DOCUMENT_INSERT)
				this.property = this.property.slice(0, pos) + s + this.property.slice(pos);
		},

		/**
		 * DOCUMENT_INSERT: Deletes a substring from the property.
		 *
		 * Other operations: No effect.
		 * @function {public} deleteString
		 * @param {int} pos Position to delete the substring
		 * @param {int} length Amout of characters to remove
		 */
		deleteString: function (pos, length) {
			if (this.type == DOCUMENT_INSERT)
				this.property = this.property.slice(0, pos) + this.property.slice(pos + length);
		},

		/**
		 * Serialize this operation into a dictionary. Official robots API format.
		 *
		 * @function {public String} serialize
		 */
		serialize: function () {
			return {
				type: this.type,
				waveId: this.waveId,
				waveletId: this.waveletId,
				blipId: this.blipId,
				index: this.index,
				property: this.property
			};
		},

		__repr__: function () {
			return "%s(\"%s\",%d,%s)".sprintf(this.type.lower(), this.blipId, this.index, repr(this.property));
		}
	});
	/**
	 * Unserialize an operation from a dictionary.
	 *
	 * @function {public static Operation} unserialize
	 */
	Operation.unserialize = function (obj) {
		return new Operation(obj.type, obj.waveId, obj.waveletId, obj.blipId, obj.index, obj.property);
	};

	/**
	 * Manages operations: Creating, merging, transforming, serializing.
	 *
	 * The operation manager wraps single operations as functions and generates
	 * operations in-order. It keeps a list of operations and allows
	 * transformation, merging and serializing.
	 *
	 * An OpManager is always associated with exactly one wave/wavelet.
	 *
	 * @class {public} pygowave.operations.OpManager
	 */
	var OpManager = new Class({
		Implements: Events,
		/**
		 * Fired if an operation in this manager has been changed.
		 * @event onOperationChanged
		 * @param {int} index Index of the changed operation
		 */
		/**
		 * Fired if one or more operations are about to be removed.
		 * @event onBeforeOperationsRemoved
		 * @param {int} start Start index of the removal.
		 * @param {int} end End index of the removal.
		 */
		/**
		 * Fired if one or more operations have been removed.
		 * @event onAfterOperationsRemoved
		 * @param {int} start Start index of the removal.
		 * @param {int} end End index of the removal.
		 */
		/**
		 * Fired if one or more operations are about to be inserted.
		 * @event onBeforeOperationsInserted
		 * @param {int} start Start index of the insertion.
		 * @param {int} end End index of the insertion.
		 */
		/**
		 * Fired if one or more operations have been inserted.
		 * @event onAfterOperationsInserted
		 * @param {int} start Start index of the insertion.
		 * @param {int} end End index of the insertion.
		 */

		/**
		 * Initializes the op manager with a wave and wavelet ID.
		 *
		 * @constructor {public} initialize
		 * @param {String} waveId The ID of the wave
		 * @param {String} waveletId The ID of the wavelet
		 * @param {String} contributorId The ID of the contributor (= creator of the Delta)
		 */
		initialize: function (waveId, waveletId, contributorId) {
			this.waveId = waveId;
			this.waveletId = waveletId;
			this.operations = new Array();
			this.lockedBlips = new Array();
			this.contributorId = contributorId;
		},

		/**
		 * Return true if this manager is not holding operations.
		 *
		 * @function {public Boolean} isEmpty
		 */
		isEmpty: function () {
			return len(this.operations) == 0;
		},

		/**
		 * Returns if the manager holds fetchable operations i.e. that are not
		 * locked.
		 *
		 * @function {public Boolean} canFetch
		 */
		canFetch: function () {
			for (var __iter0_ = new _Iterator(this.operations); __iter0_.hasNext();) {
				var op = __iter0_.next();
				if (!this.lockedBlips.contains(op.blipId))
					return true;
			}
			delete __iter0_;
			return false;
		},

		/**
		 * Transform the input operation on behalf of the manager's operations
		 * list. This will simultaneously transform the operations list on behalf
		 * of the input operation.
		 * This method returns a list of applicable operations. This list may be
		 * empty or it may contain any number of new operations (according to
		 * results of deletion, modification and splitting; i.e. the input
		 * operation is not modified by itself).
		 *
		 * @function {public Operation[]} transform
		 * @param {Operation} input_op
		 */
		transform: function (input_op) {
			var new_op = null;
			var op_lst = [input_op.clone()];
			var i = 0;
			while (i < len(this.operations)) {
				var myop = this.operations[i];
				var j = 0;
				while (j < len(op_lst)) {
					var op = op_lst[j];
					if (!op.isCompatibleTo(myop))
						continue;
					var end = null;
					if (op.isDelete() && myop.isDelete()) {
						if (op.index < myop.index) {
							end = op.index + op.length();
							if (end <= myop.index) {
								myop.index -= op.length();
								this.fireEvent("operationChanged", i);
							}
							else if (end < (myop.index + myop.length())) {
								op.resize(myop.index - op.index);
								myop.resize(myop.length() - (end - myop.index));
								myop.index = op.index;
								this.fireEvent("operationChanged", i);
							}
							else {
								op.resize(op.length() - myop.length());
								this.removeOperation(i);
								i--;
								break;
							}
						}
						else {
							end = myop.index + myop.length();
							if (op.index >= end)
								op.index -= myop.length();
							else if (op.index + op.length() <= end) {
								myop.resize(myop.length() - op.length());
								op_lst.pop(j);
								j--;
								if (myop.isNull()) {
									this.removeOperation(i);
									i--;
									break;
								}
								else
									this.fireEvent("operationChanged", i);
							}
							else {
								myop.resize(myop.length() - (end - op.index));
								this.fireEvent("operationChanged", i);
								op.resize(op.length() - (end - op.index));
								op.index = myop.index;
							}
						}
					}
					else if (op.isDelete() && myop.isInsert()) {
						if (op.index < myop.index) {
							if (op.index + op.length() <= myop.index) {
								myop.index -= op.length();
								this.fireEvent("operationChanged", i);
							}
							else {
								new_op = op.clone();
								op.resize(myop.index - op.index);
								new_op.resize(new_op.length() - op.length());
								op_lst.insert(j + 1, new_op);
								myop.index -= op.length();
								this.fireEvent("operationChanged", i);
							}
						}
						else
							op.index += myop.length();
					}
					else if (op.isInsert() && myop.isDelete()) {
						if (op.index <= myop.index) {
							myop.index += op.length();
							this.fireEvent("operationChanged", i);
						}
						else if (op.index >= (myop.index + myop.length()))
							op.index -= myop.length();
						else {
							new_op = myop.clone();
							myop.resize(op.index - myop.index);
							this.fireEvent("operationChanged", i);
							new_op.resize(new_op.length() - myop.length());
							this.insertOperation(i + 1, new_op);
							op.index = myop.index;
						}
					}
					else if (op.isInsert() && myop.isInsert()) {
						if (op.index <= myop.index) {
							myop.index += op.length();
							this.fireEvent("operationChanged", i);
						}
						else
							op.index += myop.length();
					}
					else if (op.isChange() && myop.isDelete()) {
						if (op.index > myop.index) {
							if (op.index <= (myop.index + myop.length()))
								op.index = myop.index;
							else
								op.index -= myop.length();
						}
					}
					else if (op.isChange() && myop.isInsert()) {
						if (op.index >= myop.index)
							op.index += myop.length();
					}
					else if (op.isDelete() && myop.isChange()) {
						if (op.index < myop.index) {
							if (myop.index <= (op.index + op.length())) {
								myop.index = op.index;
								this.fireEvent("operationChanged", i);
							}
							else {
								myop.index -= op.length();
								this.fireEvent("operationChanged", i);
							}
						}
					}
					else if (op.isInsert() && myop.isChange()) {
						if (op.index <= myop.index) {
							myop.index += op.length();
							this.fireEvent("operationChanged", i);
						}
					}
					else if (op.type == WAVELET_ADD_PARTICIPANT && myop.type == WAVELET_ADD_PARTICIPANT || op.type == WAVELET_REMOVE_PARTICIPANT && myop.type == WAVELET_REMOVE_PARTICIPANT) {
						if (op.property == myop.property) {
							this.removeOperation(i);
							i--;
							break;
						}
					}
					else if (op.type == BLIP_DELETE && op.blipId != "" && myop.blipId != "") {
						this.removeOperation(i);
						i--;
						break;
					}
					j++;
				}
				i++;
			}
			return op_lst;
		},

		/**
		 * Returns the pending operations and removes them from this manager.
		 *
		 * @function {public Operation[]} fetch
		 */
		fetch: function () {
			var ops = new Array();
			var i = 0;
			var s = 0;
			while (i < len(this.operations)) {
				var op = this.operations[i];
				if (this.lockedBlips.contains(op.blipId)) {
					if (i - s > 0) {
						this.removeOperations(s, i - 1);
						i -= s + 1;
					}
					s = i + 1;
				}
				else
					ops.append(op);
				i++;
			}
			if (i - s > 0)
				this.removeOperations(s, i - 1);
			return ops;
		},

		/**
		 * Opposite of fetch. Inserts all given operations into this manager.
		 *
		 * @function {public} put
		 * @param {Operation[]} ops
		 */
		put: function (ops) {
			if (len(ops) == 0)
				return;
			var start = len(this.operations);
			var end = start + len(ops) - 1;
			this.fireEvent("beforeOperationsInserted", [start, end]);
			this.operations.extend(ops);
			this.fireEvent("afterOperationsInserted", [start, end]);
		},

		/**
		 * Serialize this manager's operations into a list of dictionaries.
		 * Set fetch to true to also clear this manager.
		 *
		 * @function {public Object[]} serialize
		 * @param {optional Boolean} fetch
		 */
		serialize: function (fetch) {
			if (!$defined(fetch)) fetch = false;
			if (fetch)
				var ops = this.fetch();
			else
				ops = this.operations;
			var out = new Array();
			for (var __iter0_ = new _Iterator(ops); __iter0_.hasNext();) {
				var op = __iter0_.next();
				out.append(op.serialize());
			}
			delete __iter0_;
			return out;
		},

		/**
		 * Unserialize a list of dictionaries to operations and add them to this
		 * manager.
		 *
		 * @function {public} unserialize
		 * @param {Object[]} serial_ops
		 */
		unserialize: function (serial_ops) {
			var ops = new Array();
			for (var __iter0_ = new _Iterator(serial_ops); __iter0_.hasNext();) {
				var op = __iter0_.next();
				ops.append(Operation.unserialize(op));
			}
			delete __iter0_;
			this.put(ops);
		},

		/**
		 * Inserts and probably merges an operation into the manager's
		 * operation list.
		 *
		 * @function {private} mergeInsert
		 * @param {Operation} newop
		 */
		mergeInsert: function (newop) {
			var op = null;
			var i = 0;
			if (newop.type == DOCUMENT_ELEMENT_DELTA) {
				for (var __iter0_ = new XRange(len(this.operations)); __iter0_.hasNext();) {
					i = __iter0_.next();
					op = this.operations[i];
					if (op.type == DOCUMENT_ELEMENT_DELTA && newop.property.id == op.property.id) {
						op.property.delta.update(newop.property.delta);
						this.fireEvent("operationChanged", i);
						return;
					}
				}
				delete __iter0_;
			}
			i = len(this.operations) - 1;
			if (i >= 0) {
				op = this.operations[i];
				if (newop.type == DOCUMENT_INSERT && op.type == DOCUMENT_INSERT) {
					if (newop.index >= op.index && newop.index <= (op.index + op.length())) {
						op.insertString(newop.index - op.index, newop.property);
						this.fireEvent("operationChanged", i);
						return;
					}
				}
				else if (newop.type == DOCUMENT_DELETE && op.type == DOCUMENT_INSERT) {
					if (newop.index >= op.index && newop.index < (op.index + op.length())) {
						var remain = op.length() - (newop.index - op.index);
						if (remain > newop.length()) {
							op.deleteString(newop.index - op.index, newop.length());
							newop.resize(0);
						}
						else {
							op.deleteString(newop.index - op.index, remain);
							newop.resize(newop.length() - remain);
						}
						if (op.isNull()) {
							this.removeOperation(i);
							i--;
						}
						else
							this.fireEvent("operationChanged", i);
						if (newop.isNull())
							return;
					}
					else if (newop.index < op.index && newop.index + newop.length() > op.index) {
						if (newop.index + newop.length() >= (op.index + op.length())) {
							newop.resize(newop.length() - op.length());
							this.removeOperation(i);
							i--;
						}
						else {
							var dlength = newop.index + newop.length() - op.index;
							newop.resize(newop.length() - dlength);
							op.deleteString(0, dlength);
							this.fireEvent("operationChanged", i);
						}
					}
				}
				else if (newop.type == DOCUMENT_DELETE && op.type == DOCUMENT_DELETE) {
					if (newop.index == op.index) {
						op.resize(op.length() + newop.length());
						this.fireEvent("operationChanged", i);
						return;
					}
					if (newop.index == (op.index - newop.length())) {
						op.index -= newop.length();
						op.resize(op.length() + newop.length());
						this.fireEvent("operationChanged", i);
						return;
					}
				}
				else if (newop.type == WAVELET_ADD_PARTICIPANT && op.type == WAVELET_ADD_PARTICIPANT || newop.type == WAVELET_REMOVE_PARTICIPANT && op.type == WAVELET_REMOVE_PARTICIPANT) {
					if (newop.property == op.property)
						return;
				}
			}
			this.insertOperation(i + 1, newop);
		},

		/**
		 * Inserts an operation at the specified index.
		 * Fires signals appropriately.
		 *
		 * @function {public} insertOperation
		 * @param {int} index Position in operations list
		 * @param {Operation} op Operation object to insert
		 */
		insertOperation: function (index, op) {
			if (index > len(this.operations) || index < 0)
				return;
			this.fireEvent("beforeOperationsInserted", [index, index]);
			this.operations.insert(index, op);
			this.fireEvent("afterOperationsInserted", [index, index]);
		},

		/**
		 * Removes an operation at the specified index.
		 * Fires signals appropriately.
		 *
		 * @function {public} removeOperation
		 * @param {int} index Position in operations list
		 */
		removeOperation: function (index) {
			if (index < 0 || index >= len(this.operations))
				return;
			this.fireEvent("beforeOperationsRemoved", [index, index]);
			this.operations.pop(index);
			this.fireEvent("afterOperationsRemoved", [index, index]);
		},

		/**
		 * Removes operations between and including the given start and end
		 * indexes. Fires signals appropriately.
		 *
		 * @function {public} removeOperations
		 * @param {int} start
		 * @param {int} end
		 */
		removeOperations: function (start, end) {
			if (start < 0 || end < 0 || start > end || start >= len(this.operations) || end >= len(this.operations))
				return;
			this.fireEvent("beforeOperationsRemoved", [start, end]);
			if (start == 0 && end == (len(this.operations) - 1))
				this.operations = new Array();
			else {
				for (var __iter0_ = new XRange(start, end + 1); __iter0_.hasNext();) {
					var i = __iter0_.next();
					this.operations.pop(start);
				}
				delete __iter0_;
			}
			this.fireEvent("afterOperationsRemoved", [start, end]);
		},

		/**
		 * Updates the ID of operations on temporary Blips.
		 *
		 * @function {public} updateBlipId
		 * @param {String} tempId Old temporary ID
		 * @param {String} blipId New persistent ID
		 */
		updateBlipId: function (tempId, blipId) {
			var i = 0;
			while (i < len(this.operations)) {
				var op = this.operations[i];
				if (op.blipId == tempId) {
					op.blipId = blipId;
					this.fireEvent("operationChanged", i);
				}
				i++;
			}
		},

		/**
		 * Prevents the Operations on the Blip with the given ID from being
		 * handed over via fetch().
		 *
		 * @function {public} lockBlipOps
		 * @param blipId
		 */
		lockBlipOps: function (blipId) {
			if (!this.lockedBlips.contains(blipId))
				this.lockedBlips.push(blipId);
		},

		/**
		 * Allows the Operations on the Blip with the given ID from being
		 * handed over via fetch().
		 *
		 * @function {public} unlockBlipOps
		 * @param blipId
		 */
		unlockBlipOps: function (blipId) {
			this.lockedBlips.erase(blipId);
		},

		/**
		 * Requests to insert content into a document at a specific location.
		 *
		 * @function {public} documentInsert
		 * @param {String} blipId The Blip id that this operation is applied to
		 * @param {int} index The position insert the content at in ths document
		 * @param {String} content The content to insert
		 */
		documentInsert: function (blipId, index, content) {
			this.mergeInsert(new Operation(DOCUMENT_INSERT, this.waveId, this.waveletId, blipId, index, content));
		},

		/**
		 * Requests to delete content in a given range.
		 *
		 * @function {public} documentDelete
		 * @param {String} blipId The Blip id that this operation is applied to
		 * @param {int} start Start of the range
		 * @param {int} end End of the range
		 */
		documentDelete: function (blipId, start, end) {
			this.mergeInsert(new Operation(DOCUMENT_DELETE, this.waveId, this.waveletId, blipId, start, end - start));
		},

		/**
		 * Requests to insert an element at the given position.
		 *
		 * @function {public} documentElementInsert
		 * @param {String} blipId The Blip id that this operation is applied to
		 * @param {int} index Position of the new element
		 * @param {String} type Element type
		 * @param {Object} properties Element properties
		 */
		documentElementInsert: function (blipId, index, type, properties) {
			this.mergeInsert(new Operation(DOCUMENT_ELEMENT_INSERT, this.waveId, this.waveletId, blipId, index, {
				type: type,
				properties: properties
			}));
		},

		/**
		 * Requests to delete an element from the given position.
		 *
		 * @function {public} documentElementDelete
		 * @param {String} blipId The Blip id that this operation is applied to
		 * @param {int} index Position of the element to delete
		 */
		documentElementDelete: function (blipId, index) {
			this.mergeInsert(new Operation(DOCUMENT_ELEMENT_DELETE, this.waveId, this.waveletId, blipId, index, null));
		},

		/**
		 * Requests to apply a delta to the element at the given position.
		 *
		 * @function {public} documentElementDelta
		 * @param {String} blipId The Blip id that this operation is applied to
		 * @param {int} index Position of the element
		 * @param {Object} delta Delta to apply to the element
		 */
		documentElementDelta: function (blipId, index, delta) {
			this.mergeInsert(new Operation(DOCUMENT_ELEMENT_DELTA, this.waveId, this.waveletId, blipId, index, delta));
		},

		/**
		 * Requests to set a UserPref of the element at the given position.
		 *
		 * @function {public} documentElementSetpref
		 * @param {String} blipId The Blip id that this operation is applied to
		 * @param {int} index Position of the element
		 * @param {Object} key Name of the UserPref
		 * @param {Object} value Value of the UserPref
		 */
		documentElementSetpref: function (blipId, index, key, value) {
			this.mergeInsert(new Operation(DOCUMENT_ELEMENT_SETPREF, this.waveId, this.waveletId, blipId, index, {
				key: key,
				value: value
			}));
		},

		/**
		 * Requests to add a Participant to the Wavelet.
		 *
		 * @function {public} waveletAddParticipant
		 * @param {String} id ID of the Participant to add
		 */
		waveletAddParticipant: function (id) {
			this.mergeInsert(new Operation(WAVELET_ADD_PARTICIPANT, this.waveId, this.waveletId, "", -1, id));
		},

		/**
		 * Requests to remove a Participant to the Wavelet.
		 *
		 * @function {public} waveletRemoveParticipant
		 * @param {String} id ID of the Participant to remove
		 */
		waveletRemoveParticipant: function (id) {
			this.mergeInsert(new Operation(WAVELET_REMOVE_PARTICIPANT, this.waveId, this.waveletId, "", -1, id));
		},

		/**
		 * Requests to append a new Blip to the Wavelet.
		 *
		 * @function {public} waveletAppendBlip
		 * @param {String} tempId Temporary Blip ID
		 */
		waveletAppendBlip: function (tempId) {
			this.mergeInsert(new Operation(WAVELET_APPEND_BLIP, this.waveId, this.waveletId, "", -1, {
				waveId: this.waveId,
				waveletId: this.waveletId,
				blipId: tempId
			}));
		},

		/**
		 * Requests to delete a Blip.
		 *
		 * @function {public} blipDelete
		 * @param {String} blipId The Blip id that this operation is applied to
		 */
		blipDelete: function (blipId) {
			this.mergeInsert(new Operation(BLIP_DELETE, this.waveId, this.waveletId, blipId));
		},

		/**
		 * Requests to create a clild Blip.
		 *
		 * @function {public} blipCreateChild
		 * @param {String} blipId The parent Blip
		 * @param {String} tempId Temporary Blip ID
		 */
		blipCreateChild: function (blipId, tempId) {
			this.mergeInsert(new Operation(BLIP_CREATE_CHILD, this.waveId, this.waveletId, blipId, -1, {
				waveId: this.waveId,
				waveletId: this.waveletId,
				blipId: tempId
			}));
		}
	});

	return {
		OpManager: OpManager,
		DOCUMENT_INSERT: DOCUMENT_INSERT,
		DOCUMENT_DELETE: DOCUMENT_DELETE,
		DOCUMENT_ELEMENT_INSERT: DOCUMENT_ELEMENT_INSERT,
		DOCUMENT_ELEMENT_DELETE: DOCUMENT_ELEMENT_DELETE,
		DOCUMENT_ELEMENT_DELTA: DOCUMENT_ELEMENT_DELTA,
		DOCUMENT_ELEMENT_SETPREF: DOCUMENT_ELEMENT_SETPREF,
		WAVELET_ADD_PARTICIPANT: WAVELET_ADD_PARTICIPANT,
		WAVELET_REMOVE_PARTICIPANT: WAVELET_REMOVE_PARTICIPANT,
		WAVELET_APPEND_BLIP: WAVELET_APPEND_BLIP,
		BLIP_CREATE_CHILD: BLIP_CREATE_CHILD,
		BLIP_DELETE: BLIP_DELETE
	};
})();
