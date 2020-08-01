/**
 *  Copyright 2013 Rackspace
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

var async = require('async');
var getOne = require('../../lib/db/ops/utils').getOne;
var Metadata = require('../../lib/db/models/metadata').Metadata;
var account = require('../../lib/db/ops/account');
var metadata = require('../../lib/db/ops/metadata');
var context = require('../../lib/db/context');
var common = require('../common');
var apiInit = require('../../lib/init').initialize;
var uuidFromString = require('rackspace-shared-utils/lib/uuid').uuidFromString;

exports.initialize = function(test, assert) {
  async.waterfall([
    common.initializeCassandra,
    common.truncateColumnFamilies,
    apiInit
  ],
  function(err) {
    assert.ifError(err);
    test.finish();
  });
};

// we can't set this as the teardown because it interferes with what gets started in apiInit. So we wait until the end.
exports.finalize = common.tearDown;

exports.setUp = function(test, assert) {
  async.waterfall([
    common.initializeCassandra,
    common.truncateColumnFamilies
  ],
  function(err) {
    assert.ifError(err);
    test.finish();
  });
};

exports['test_new_account_creates_metadata'] = function(test, assert) {
  var ctx = context.create(null, 'new_account_creates', false),
      key = 'acNewCreat';
  async.waterfall([
    account.create.bind(null, ctx, {_key: key}),
    function getMetadataExternally(objDoesNotMatter, callback) {
      getOne(Metadata)(ctx, key, key, {'includeChildren': false}, function(err, me) {
        assert.ifError(err);
        assert.strictEqual(key, me.getKey());
        uuidFromString(me.last_rectification);
        callback(null);
      });
    }
  ],
  function(err) {
    assert.ifError(err);
    test.finish();
  });
};

exports['test_metadata_gets_created_automatically_for_old_accounts'] = function(test, assert) {
  var ctx = context.create(null, 'existing_account_creates', false),
      key = 'acOldCreat';
  async.waterfall([
    metadata.getOne.bind(null, ctx, key),
    function getMetadataExternally(objDoesNotMatter, callback) {
      getOne(Metadata)(ctx, key, key, {'includeChildren': false}, function(err, me) {
        assert.ifError(err);
        assert.strictEqual(key, me.getKey());
        uuidFromString(me.last_rectification);
        callback(null);
      });
    }
  ],
  function(err) {
    assert.ifError(err);
    test.finish();
  });
};

exports['test_metadata_gets_removed_on_account_deletion'] = function(test, assert) {
  var ctx = context.create(null, 'md_removed_on_account_del', false),
      key = 'acDelMetad';
  async.waterfall([
    function verifyMetadataIsNotPresent(callback) {
      getOne(Metadata)(ctx, key, key, {'includeChildren': false}, function(err, me) {
        // this test passes with the expected error when there is no account or metadata.
        assert.ok(err !== null);
        assert.ok(!me);
        callback(null);
      });
    },
    // create then delete an account. metadata should get deleted as well.
    account.create.bind(null, ctx, {_key: key}),
    function checkForMetadata(acct, callback) {
      getOne(Metadata)(ctx, key, key, {'includeChildren': false}, function(err, me) {
        assert.ifError(err);
        assert.strictEqual(key, me.getKey());
        callback(null);
      });
    },
    account.remove.bind(null, ctx, key),
    function verifyMetadataIsDeleted(acct, callback) {
      getOne(Metadata)(ctx, key, key, {'includeChildren': false}, function(err, me) {
        assert.ok(err);
        assert.ok(!me);
        callback(null);
      });
    }
  ],
  function(err) {
    assert.ifError(err);
    test.finish();
  });
};
