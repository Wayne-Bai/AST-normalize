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

var account = require('../../../lib/db/ops/account');
var service = require('../../../lib/db/ops/service');
var configuration = require('../../../lib/db/ops/configuration');

exports.list = function(req, res) {
  account.getAll({}, function(err, acctArr) {
    if (err) {
      res.render('error.jade', {err: err});
    } else {
      res.render('accounts-list.jade', {
        title: 'List accounts',
        acctArr: acctArr
      });
    }
  });
};

function lookupByAccount(acctId, req, res) {
  var ctx = {
    account: {
      getKey: function() { return acctId; }
    },
    pagination: {
      limit: 10
    }
  };

  // todo: paging for services, and configuration values.
  // todo: even better, use ajax.
  async.parallel([
    function fetchAccount(callback) {
      account.getOne(ctx, acctId, callback);
    },

    function getServices(callback) {
      service.getAll(ctx, {}, callback);
    },

    function getConfigurations(callback) {
      configuration.getAll(ctx, {}, callback);
    }
  ],
  function(err, results) {
    if (err) {
      res.render('error.jade', {err: err});
    } else {
      res.render('accounts-lookup.jade', {
        title: 'Account details',
        acct: results[0],
        services: results[1][0],
        nextService: results[1][1].nextKey,
        configuration: results[2][0],
        nextConfiguration: results[2][1].nextKey
      });
    }
  });
}

exports.lookup = function(req, res) {
  var acctId = req.params['acctId'];
  if (!acctId) {
    acctId = req.query.acctId;
  }
  if (acctId) {
    lookupByAccount(acctId, req, res);
  } else {
    res.render('accounts-lookup-form.jade');
  }
};
