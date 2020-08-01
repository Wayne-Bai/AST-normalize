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

var log = require('logmagic').local('api.handlers.event');
var sprintf = require('sprintf').sprintf;
var validators = require('swiz/lib/validators');
var highUUIDFromTimestamp = require('rackspace-shared-utils/lib/uuid').highUUIDFromTimestamp;
var lowUUIDFromTimestamp = require('rackspace-shared-utils/lib/uuid').lowUUIDFromTimestamp;
var uuidFromString = require('rackspace-shared-utils/lib/uuid').uuidFromString;

var eventOps = require('../../db/ops/event');
var common = require('./common');
var ValidationError = require('../../util/errors').ValidationError;

/**
 * Default offset which is used for retrieving events if user doesn't provide
 * a marker.
 * @type {Number}
 * @const
 */
var DEFAULT_EVENTS_FROM = 1 * 3600 * 1000;

/**
 * Valid event types.
 * @type {Array}
 * @const
 */
var VALID_EVENT_TYPES = [
  'service.join',
  'service.remove',
  'service.timeout',
  'configuration_value.update',
  'configuration_value.remove'
];

exports.list = function(req, res) {
  var callback = common.swizListResponseCallback(req, res),
      now = Date.now(),
      from = req.query.marker,
      to = highUUIDFromTimestamp(now),
      type = req.query.type,
      acCreationTs = req.ctx.account.created_at,
      fromTs;

  log.debug('list', {request: req});
  req.time('event.list.http');

  if (from === null || from === undefined) {
    fromTs = (now - DEFAULT_EVENTS_FROM);

    if (fromTs < acCreationTs) {
      fromTs = acCreationTs;
    }

    from = lowUUIDFromTimestamp(fromTs);
  }

  try {
    validators.isV1UUID(from.toString());
  }
  catch (e) {
    callback(new ValidationError(e.message));
    return;
  }

  fromTs = uuidFromString(from.toString()).getTimestamp();

  if (fromTs > now) {
    callback(new ValidationError('from parameter must be smaller than the current time'));
    return;
  }

  if (fromTs < acCreationTs) {
    // TODO: As soon as we decide on actual guarantees we can scope this even
    // further (e.g. only last 7 days of data)
    callback(new ValidationError('from parameter must be greater than or equal to the account creation date'));
    return;
  }

  if (type && (VALID_EVENT_TYPES.indexOf(type) === -1)) {
    callback(new ValidationError(sprintf('Invalid type: %s. Valid types are: %s', type,
                                         VALID_EVENT_TYPES.join(','))));
    return;
  }

  eventOps.getTimeSlice(req.ctx, from, to, type, {}, callback);
};
