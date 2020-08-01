/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at:
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozilla Raindrop Code.
 *
 * The Initial Developer of the Original Code is
 *   The Mozilla Foundation
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Andrew Sutherland <asutherland@asutherland.org>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * IndexedDB implementation of our database abstraction.  For now, all the
 *  generic documentation lives on the `redis.js` implementation.  Specifics
 *  about the IndexedDB mapping do live in here.  Note that we are targeting
 *  an IndexedDB backed by LevelDB; our performance when using
 *  IndexedDB-on-SQLite is likely to be worse and we are fine with that.
 **/

define(
  [
    'q',
    'rdcommon/gendb-logdef',
    'module',
    'exports'
  ],
  function(
    $Q,
    $_logdef,
    $module,
    exports
  ) {
const when = $Q.when;

const LOGFAB = exports.LOGFAB = $_logdef.LOGFAB;

/*
 * We are assuming that mozIndexedDB and the various IDB* interfaces are
 *  available in our global context by virtue of us having been loaded into
 *  a content page using RequireJS rather than using the Jetpack loader.
 *  Accordingly, we also explode if we cannot find our beloved constant.
 */

if (!mozIndexedDB) {
  console.error("No mozIndexedDB!");
  throw new Error("I need mozIndexedDB; load me in a content page universe!");
}

var IndexedDB = mozIndexedDB;

/**
 * The version to use for now; not a proper version, as we perform no upgrading,
 *  etc. at this time.
 */
const DB_ONLY_VERSION = 1;

const CELL_DELIM = '@', CELL_DELIM_LEN = CELL_DELIM.length,
      INDEX_DELIM = '_', INDEX_PARAM_DELIM = '@';

function IndexedDbConn(nsprefix, _logger) {
  this._nsprefix = nsprefix;
  this._db = null;

  this._log = LOGFAB.gendbConn(this, _logger, [nsprefix]);

  var self = this;

  self._log.connecting();
}
IndexedDbConn.prototype = {
  toString: function() {
    return '[IndexedDbConn]';
  },
  toJSON: function() {
    return {
      type: 'IndexedDbConn',
    };
  },

  /**
   * One-shot schema definition; no migration support at the current time.
   *
   * @return[Promise]{
   *   Returns a promise that is resolved once the schema has been baked into
   *   the database.
   * }
   */
  defineSchema: function(schema) {
    var dbDeferred = $Q.defer(), self = this, nsprefix = this._nsprefix,
        dbOpenRequest = IndexedDB.open("deuxdrop-" + nsprefix, DB_ONLY_VERSION);
    dbOpenRequest.onerror = function(event) {
      self._log.dbErr(dbOpenRequest.error.name);
      dbDeferred.reject(dbOpenRequest.error);
    };
    dbOpenRequest.onsuccess = function(event) {
      self._log.connected();
      self._db = dbOpenRequest.result;
      dbDeferred.resolve(self._db);
    };
    dbOpenRequest.onupgradeneeded = function(event) {
      var db = dbOpenRequest.result;

      // XXX if we supported more than one version, we would want to potentially
      //  perform migration logic here.
      for (var iTable = 0; iTable < schema.tables.length; iTable++) {
        var tableDef = schema.tables[iTable],
            tableName = tableDef.name;
        db.createObjectStore(tableName);

        for (var iIndex = 0; iIndex < tableDef.indices.length; iIndex++) {
          var indexName = tableDef.indices[iIndex];
          var aggrName = tableName + INDEX_DELIM + indexName;
          db.createObjectStore(aggrName);
        }
      }
      for (var iQueue = 0; iQueue < schema.queues.length; iQueue++) {
        var queueDef = schema.queues[iQueue],
            queueName = queueDef.name;

        db.createObjectStore(queueName);
      }
    };
    return (this._db = dbDeferred.promise);
  },

  //////////////////////////////////////////////////////////////////////////////
  // Hbase model
  //
  // IndexedDB is a straight-up key/value store where the keys are
  //  lexicographically ordered keys (like in LevelDB).  We can map the hbase
  //  model onto the IndexedDB model by just concatenating the column names onto
  //  the row identifiers.  We then perform a scan to get all the cells in the
  //  row.
  // Column family-wise, we are pretending they don't exist, although we could
  //  implement them hbase-style by putting them in different object stores.
  //
  // It's worth debating whether we actually need to be storing the cells in
  //  separate key/value pairs rather than just cramming them into an object
  //  that we store in a single key/value pair.  The main argument in favor of
  //  the big blob is that it would avoid data being smeared across multiple
  //  log files at the expense of increased (highly localized) memory/disk
  //  traffic.
  // The hygienic argument against is that there is much greater risk for
  //  atomic replacement causing data to be lost.  The counterpoint is that
  //  we're already trying quite hard to ensure that all logic is serialized
  //  so that shouldn't be a notable risk (although one that exists at a higher
  //  abstraction level than us.)
  //
  // There is no need for us to box our data because IndexedDB handles that
  //  for us because it's intimately aware of the JS object system.

  getRowCell: function(tableName, rowId, columnName) {
    var deferred = $Q.defer();
    this._log.getRowCell(tableName, rowId, columnName);
    var transaction = this._db.transaction([tableName],
                                           IDBTransaction.READ_ONLY);
    transaction.onerror = function() {
      deferred.reject(transaction.errorCode);
    };
    var store = transaction.objectStore(tableName);
    store.get(rowId + CELL_DELIM + columnName).onsuccess = function(event) {
      var result = event.target.result;
      if (result === undefined)
        result = null;
      deferred.resolve(result);
    };
    return deferred.promise;
  },

  boolcheckRowCell: function(tableName, rowId, columnName) {
    var deferred = $Q.defer();
    this._log.getRowCell(tableName, rowId, columnName);
    var transaction = this._db.transaction([tableName],
                                           IDBTransaction.READ_ONLY);
    transaction.onerror = function() {
      deferred.reject(transaction.errorCode);
    };
    var store = transaction.objectStore(tableName);
    store.get(rowId + CELL_DELIM + columnName).onsuccess = function(event) {
      deferred.resolve(Boolean(event.target.result));
    };
    return deferred.promise;
  },

  assertBoolcheckRowCell: function(tableName, rowId, columnName, exClass) {
    var deferred = $Q.defer();
    this._log.getRowCell(tableName, rowId, columnName);
    var transaction = this._db.transaction([tableName],
                                           IDBTransaction.READ_ONLY);
    transaction.onerror = function() {
      deferred.reject(transaction.errorCode);
    };
    var store = transaction.objectStore(tableName);
    store.get(rowId + CELL_DELIM + columnName).onsuccess = function(event) {
      var val = Boolean(event.target.result);
      if (!val)
        deferred.reject(new (exClass || Error)(columnName + " was falsy"));
      else
        deferred.resolve(val);
    };
    return deferred.promise;
  },

  getRow: function(tableName, rowId, columnFamilies) {
    var deferred = $Q.defer();
    this._log.getRow(tableName, rowId, columnFamilies);
    var transaction = this._db.transaction([tableName],
                                           IDBTransaction.READ_WRITE);
    var odict = {};
    transaction.oncomplete = function() {
      deferred.resolve(odict);
    };
    transaction.onerror = function() {
      deferred.reject(transaction.errorCode);
    };
    var store = transaction.objectStore(tableName);

    // we need to open a cursor to spin over all possible cells
    var range = IDBKeyRange.bound(rowId, rowId + '\ufff0', true, false);
    const cellNameOffset = rowId.length + CELL_DELIM_LEN;
    store.openCursor(range).onsuccess = function(event) {
      var cursor = event.target.result;
      if (cursor) {
        odict[cursor.key.substring(cellNameOffset)] = cursor.value;
        cursor.continue();
      }
    };
    return deferred.promise;
  },

  putCells: function(tableName, rowId, cells) {
    var deferred = $Q.defer();
    this._log.putCells(tableName, rowId, cells);

    var transaction = this._db.transaction([tableName],
                                           IDBTransaction.READ_WRITE);
    transaction.oncomplete = function() {
      deferred.resolve();
    };
    transaction.onerror = function() {
      deferred.reject(transaction.errorCode);
    };
    var store = transaction.objectStore(tableName);
    for (var key in cells) {
      store.put(cells[key], rowId + CELL_DELIM + key);
    }
    return deferred.promise;
  },

  deleteRow: function(tableName, rowId) {
    var deferred = $Q.defer();
    this._log.deleteRow(tableName, rowId);
    var transaction = this._db.transaction([tableName],
                                           IDBTransaction.READ_WRITE);
    transaction.oncomplete = function() {
      deferred.resolve();
    };
    transaction.onerror = function() {
      deferred.reject(transaction.errorCode);
    };
    var store = transaction.objectStore(tableName);
    // we need to open a cursor to spin over all possible cells
    var range = IDBKeyRange.bound(rowId, rowId + '\ufff0', true, false);
    store.openCursor(range).onsuccess = function(event) {
      var cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    return deferred.promise;
  },

  deleteRowCell: function(tableName, rowId, columnName) {
    var deferred = $Q.defer();
    this._log.deleteRowCell(tableName, rowId, columnName);
    var transaction = this._db.transaction([tableName],
                                           IDBTransaction.READ_WRITE);
    transaction.oncomplete = function() {
      deferred.resolve();
    };
    transaction.onerror = function() {
      deferred.reject(transaction.errorCode);
    };
    var store = transaction.objectStore(tableName);
    store.delete(rowId + CELL_DELIM + columnName);
    return deferred.promise;
  },

  incrementCell: function(tableName, rowId, columnName, delta) {
    var deferred = $Q.defer();
    this._log.incrementCell(tableName, rowId, columnName, delta);
    var transaction = this._db.transaction([tableName],
                                           IDBTransaction.READ_WRITE);
    var newVal;
    transaction.oncomplete = function() {
      deferred.resolve(newVal);
    };
    transaction.onerror = function() {
      deferred.reject(transaction.errorCode);
    };
    var store = transaction.objectStore(tableName);
    var cellName = rowId + CELL_DELIM + columnName;
    store.get(cellName).onsuccess = function(event) {
      var result = event.target.result;
      if (result === undefined)
        store.add((newVal = 1), cellName);
      else
        store.put((newVal = result + 1), cellName);
    };
    return deferred.promise;
  },

  raceCreateRow: function(tableName, rowId, probeCellName, cells) {
    // note: we are just reusing the implementation from our redis impl since
    //  this is already posed in terms of other operations.  For efficiency
    //  we may want to specialize this at some point.
    var self = this;
    this._log.raceCreateRow(tableName, rowId, probeCellName, cells);
    return when(this.incrementCell(tableName, rowId, probeCellName, 1),
      function(valAfterIncr) {
        // - win
        if (valAfterIncr === 1) {
          return self.putCells(tableName, rowId, cells);
        }
        // - lose
        else {
          // XXX we should perhaps return a boolean as to whether we won to the
          //  caller and leave it up to them to generate a more appropriate
          //  exception, if any.
          throw new Error("lost race");
        }
      }
      // rejection pass-through is fine, although is ambiguous versus the above
    );
  },

  //////////////////////////////////////////////////////////////////////////////
  // Reorderable collection index model
  //
  // IndexedDB has built-in support for indices, but our semantics don't line
  //  up, so we don't use them.  Specifically:
  // - we are currently modeling cells as distinct key/value pairs, so index
  //    references won't line up correctly.
  // - some indices are only populated based on filters (ex: pinned)
  // - we may update indices without actually issuing a write against the things
  //   the indices are referencing.
  //
  // In terms of how to handle the "delete the old index value" case, there are
  //  broadly five strategies that can be used:
  // 1) Ordered keys, require the caller to always know the old value so we can
  //    issue a delete.  This is potentially annoying to calling code.
  // 2) Ordered keys, issue a read request to another location if the old value
  //    is not provided/known to find the old value for deletion purposes.
  // 3) Ordered keys, blind writes with 'scan deletion' nuking the old value.
  //    This would be assuming the cost of the scan is cheaper than the cost of
  //    the random I/O.
  // 4) Ordered keys, blindly issue writes that include metadata so that on
  //    reads we can perform a 'compaction' pass where we notice out-of-date
  //    values and ignore and possibly issue deletes against the moot values.
  //    This is only viable at large-scale if we assume that values only can
  //    migrate towards the 'front' and that we always start our scans from the
  //    'front' moving towards the back so our mooting algorithm always makes
  //    the correct choice.  (Whereas if we seek to the middle we might see
  //    a mooted value and not know it is mooted.)  A mechanism by which the
  //    'dirtiness' of indices could be tracked might be helpful, but unlikely
  //    to pay for itself.
  // 5) "Amortized dirty bucket" that overflows to ordered keys.  Whenever we
  //    issue an index change, we issue it directly into the "dirty bucket".
  //    In the simple case where the index is small, we only ever load the
  //    contents of the dirty bucket and we just perform an in-memory sort and
  //    use that.  When the bucket gets too large, we do the sort again but
  //    now persist all of the keys beyond a certain value horizon into an
  //    ordered keyspace and make note of that in the dirty bucket.  Whenever
  //    we have a query that just wants "recent" data, we can just grab it
  //    from the dirty bucket.  When we have a query that wants "older" data,
  //    it grabs the contents of the dirty bucket and issues a value range
  //    query against the ordered older data, then apply any changes from the
  //    dirty bucket to the ordered data.
  //
  // We are currently implementing a variant on #5, "infinitely big unordered
  //  bucket" with the expectation that the overflow case is a good idea and
  //  we will eventually get around to it.  Ideally we will also do a literature
  //  search and figure out what the name for that general strategy is and
  //  if there are any fundamental issues with impementing it on top of a
  //  log-structured-merge datastore.

  scanIndex: function(tableName, indexName, indexParam, desiredDir,
                      lowValue, lowObjectName, lowInclusive,
                      highValue, highObjectName, highInclusive) {
    const dir = desiredDir;
    var deferred = $Q.defer();
    var minValStr = (lowValue == null) ? '-inf' : lowValue,
        maxValStr = (highValue == null) ? '+inf' : highValue;
    this._log.scanIndex(tableName, indexName, indexParam, maxValStr, minValStr);
    var aggrName = tableName + INDEX_DELIM + indexName;
    var transaction = this._db.transaction([aggrName],
                                           IDBTransaction.READ_ONLY);
    var olist = [];
    transaction.oncomplete = function() {
      deferred.resolve(olist);
    };
    transaction.onerror = function() {
      deferred.reject(transaction.errorCode);
    };
    var store = transaction.objectStore(aggrName);

    // we need to open a cursor to spin over all possible cells
    var range = IDBKeyRange.bound(
                  indexParam + INDEX_PARAM_DELIM,
                  indexParam + INDEX_PARAM_DELIM + '\ufff0',
                  true, false);
    const cellNameOffset = indexParam.length + INDEX_PARAM_DELIM.length;
    var sortie = [];
    store.openCursor(range).onsuccess = function(event) {
      var cursor = event.target.result;
      if (cursor) {
        sortie.push({obj: cursor.key.substring(cellNameOffset),
                     val: cursor.value});
        cursor.continue();
      }
      else {
        sortie.sort(function(a, b) {
          if (a.val < b.val)
            return -dir;
          else if (a.val > b.val)
            return dir;
          else
            return 0;
        });
        for (var i = 0; i < sortie.length; i++) {
          olist.push(sortie[i].obj);
          olist.push(sortie[i].val);
        }
      }
    };
    return deferred.promise;
  },

  /**
   * Add/update the numeric value associated with an objectName for the given
   *  index for the given (index) table.
   */
  updateIndexValue: function(tableName, indexName, indexParam,
                             objectName, newValue) {
    var deferred = $Q.defer();
    this._log.updateIndexValue(tableName, indexName, indexParam,
                               objectName, newValue);
    var aggrName = tableName + INDEX_DELIM + indexName;
    var transaction = this._db.transaction([aggrName],
                                           IDBTransaction.READ_WRITE);
    transaction.oncomplete = function() {
      deferred.resolve();
    };
    transaction.onerror = function() {
      deferred.reject(transaction.errorCode);
    };
    var store = transaction.objectStore(aggrName);
    var cellName = indexParam + INDEX_PARAM_DELIM + objectName;
    store.put(newValue, cellName);
    return deferred.promise;
  },

  /**
   * Update multiple indices in a single batch.
   * 
   * @args[
   *   @param[tableName]{
   *     The name of the associated table we are performing updates on.
   *   }
   *   @param[updates IndexValues]
   * ]
   */
  updateMultipleIndexValues: function(tableName, updates) {
    // there is nothing to do if there are no updates to perform
    if (updates.length === 0)
      return null;
    var deferred = $Q.defer();

    var aggrNames = [], iUpdate, update;

    for (iUpdate = 0; iUpdate < updates.length; iUpdate++) {
      update = updates[iUpdate];

      var aggrName = tableName + INDEX_DELIM + update[0];
      if (aggrNames.indexOf(aggrName) === -1)
        aggrNames.push(aggrName);
    }
    var transaction = this._db.transaction(aggrNames,
                                           IDBTransaction.READ_WRITE);
    transaction.oncomplete = function() {
      deferred.resolve(updates);
    };
    transaction.onerror = function() {
      deferred.reject(transaction.errorCode);
    };

    for (iUpdate = 0; iUpdate < updates.length; iUpdate++) {
      update = updates[iUpdate];
      var indexName = update[0], indexParam = update[1],
          objectName = update[2], newValue = update[3];
      this._log.updateIndexValue(tableName, indexName, indexParam,
                                 objectName, newValue);

      var aggrName = tableName + INDEX_DELIM + indexName;
      var store = transaction.objectStore(aggrName);
      var cellName = indexParam + INDEX_PARAM_DELIM + objectName;
      store.put(newValue, cellName);
    }

    return deferred.promise;
  },

  /**
   * Delete one or more index entries.  We currently do not require the caller
   *  to provide the previous index value, although we might end up doing that.
   *
   * @args[
   *   @param[tableName]{
   *     The name of the associated table we are performing updates on.
   *   }
   *   @param[nukes IndexValues]
   * ]
   */
  deleteMultipleIndexValues: function(tableName, nukes) {
    var deferred = $Q.defer();

    var aggrNames = [], iNuke, nuke;

    for (iNuke = 0; iNuke < nukes.length; iNuke++) {
      nuke = nukes[iNuke];

      var aggrName = tableName + INDEX_DELIM + nuke[0];
      if (aggrNames.indexOf(aggrName) === -1)
        aggrNames.push(aggrName);
    }
    var transaction = this._db.transaction(aggrNames,
                                           IDBTransaction.READ_WRITE);
    transaction.oncomplete = function() {
      deferred.resolve(nukes);
    };
    transaction.onerror = function() {
      deferred.reject(transaction.errorCode);
    };

    for (iNuke = 0; iNuke < nukes.length; iNuke++) {
      nuke = nukes[iNuke];
      var indexName = nuke[0], indexParam = nuke[1],
          objectName = nuke[2], prevValue = nuke[3];
      this._log.deleteIndexValue(tableName, indexName, indexParam, objectName);

      var aggrName = tableName + INDEX_DELIM + indexName;
      var store = transaction.objectStore(aggrName);
      var cellName = indexParam + INDEX_PARAM_DELIM + objectName;
      store.delete(cellName);
    }

    return deferred.promise;
  },


  /**
   * Set the numeric value associated with an objectName for the given index to
   *  the maximum of its current value and the value we are providing.
   */
  maximizeIndexValue: function(tableName, indexName, indexParam,
                               objectName, newValue) {
    var deferred = $Q.defer();
    this._log.maximizeIndexValue(tableName, indexName, indexParam,
                                 objectName, newValue);
    var aggrName = tableName + INDEX_DELIM + indexName;
    var transaction = this._db.transaction([aggrName],
                                           IDBTransaction.READ_WRITE);
    transaction.oncomplete = function() {
      deferred.resolve(newValue);
    };
    transaction.onerror = function() {
      deferred.reject(transaction.errorCode);
    };
    var store = transaction.objectStore(aggrName);
    var cellName = indexParam + INDEX_PARAM_DELIM + objectName;
    store.get(cellName).onsuccess = function(event) {
      var existing = event.target.result;
      if (existing === undefined) {
        store.add(newValue, cellName);
      }
      else {
        if (existing < newValue)
          store.put(newValue, cellName);
      }
    };
    return deferred.promise;
  },

  /**
   * Maximize multiple indices in a single batch.  Consumes `IndexValue`
   *  representations like `updateMultipleIndexValues` with the notable
   *  side-effect of updating the representation to be consistent with the
   *  database representation.  Specifically, if the value in the database
   *  is larger than the provided value, it is updated.
   */
  maximizeMultipleIndexValues: function(tableName, maxdates) {
    // there is nothing to do if there are no maximizations to perform
    if (maxdates.length === 0)
      return null;

    var deferred = $Q.defer();

    var aggrNames = [], iMaxdate, maxdate;

    for (iMaxdate = 0; iMaxdate < maxdates.length; iMaxdate++) {
      maxdate = maxdates[iMaxdate];

      // - build list of all the index aggregate tables we will touch
      var aggrName = tableName + INDEX_DELIM + maxdate[0];
      if (aggrNames.indexOf(aggrName) === -1)
        aggrNames.push(aggrName);
    }
    var transaction = this._db.transaction(aggrNames,
                                           IDBTransaction.READ_WRITE);
    transaction.oncomplete = function() {
      deferred.resolve(maxdates);
    };
    transaction.onerror = function() {
      deferred.reject(transaction.errorCode);
    };

    // Because we expect our index values to both be scattered around a bit,
    //  rather than engage a cursor, we just spin up a number of parallel get
    //  requests and issue separate add/put requests if the need arises.
    // It's possible the cursor might be a better idea given that the likelihood
    //  of the value actually increasing is better than 50%.  We are assuming
    //  the cursor implementation has non-trivial setup cost/overhead and that
    //  the impact of the separate write will be trivial in a LevelDB impl
    //  because of the LSM rep anyways.  SQLite should be okay because the
    //  page will be cached and its update op is completely orthogonal.
    var logger = this._log;
    function maxify(maxdate) { // need to latch vars; can't require "let"
      var indexName = maxdate[0], indexParam = maxdate[1],
          objectName = maxdate[2], newValue = maxdate[3];
      logger.maximizeIndexValue(tableName, indexName, indexParam,
                                objectName, newValue);

      var aggrName = tableName + INDEX_DELIM + indexName;
      var store = transaction.objectStore(aggrName);
      var cellName = indexParam + INDEX_PARAM_DELIM + objectName;
      store.get(cellName).onsuccess = function(event) {
        var existing = event.target.result;
        if (existing === undefined) {
          store.add(newValue, cellName);
        }
        else {
          // update db if our new value is bigger
          if (existing < newValue)
            store.put(newValue, cellName);
          // update memory rep if existing value is bigger
          else
            maxdate[3] = existing;
        }
      };
    }

    for (iMaxdate = 0; iMaxdate < maxdates.length; iMaxdate++) {
      maxify(maxdates[iMaxdate]);
    }

    return deferred.promise;
  },

  //////////////////////////////////////////////////////////////////////////////
  // String-Value Indices
  //
  // Same as the numeric-value indices; these only exist because of our redis
  //  impl.  We copy the references for the general implementation across below.

  updateStringIndexValue: null,
  scanStringIndex: null,

  //////////////////////////////////////////////////////////////////////////////
  // Queue Abstraction
  //
  // XXX not yet implemented; not required for client logic

  queueAppend: null,
  queuePeek: null,
  queueConsume: null,
  queueConsumeandPeek: null,

  //////////////////////////////////////////////////////////////////////////////
  // Session Management

  close: function() {
    if (this._db && (this._db instanceof IDBDatabase))
      this._db.close();
  },

  //////////////////////////////////////////////////////////////////////////////
};
IndexedDbConn.prototype.updateStringIndexValue =
  IndexedDbConn.prototype.updateIndexValue;
IndexedDbConn.prototype.scanStringIndex =
  IndexedDbConn.prototype.scanIndex;

exports.makeProductionDBConnection = function(uniqueName, host, port, _logger) {
  return new IndexedDbConn(uniqueName, _logger);
};
exports.nukeProductionDatabase = function(conn) {
  throw new Error("not implemented!");
};
exports.closeProductionDBConnection = function(conn) {
  conn.close();
};

exports.makeTestDBConnection = function(uniqueName, _logger) {
  return new IndexedDbConn(uniqueName, _logger);
};

exports.cleanupTestDBConnection = function(conn) {
  conn.close();
};

}); // end define
