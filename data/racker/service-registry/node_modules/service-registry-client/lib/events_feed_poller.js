var util = require('util');
var EventEmitter = require('events').EventEmitter;

var log = require('logmagic').local('service-registry-client.events_feed_poller');
var async = require('async');

/**
 * Default poll interval in ms.
 * @type {Number}
 */
var DEFAULT_INTERVAL = 10 * 1000;

/**
 * A higher level client which polls events feed for changes and emits an event
 * every time a new entry is detected in the feed.
 *
 * It emits the following events:
 *
 * - service.join
 * - service.timeout
 *
 * - configuration_value.update
 * - configuration_value.remove
 */
function EventsFeedPoller(eventsClient, options) {
  options = options || {};

  this._eventsClient = eventsClient;
  this._pollInterval = options.pollInterval || DEFAULT_INTERVAL;
  this._timeoutId = null;
  this._started = false;
  this._nextMarker = null;
}

util.inherits(EventsFeedPoller, EventEmitter);

EventsFeedPoller.prototype.start = function() {
  if (this._started) {
    return;
  }

  log.debug('Events feed poller started');

  this._started = true;
  this._schedulePolling();
};

EventsFeedPoller.prototype.stop = function() {
  log.debug('Events feed poller stopped');

  this._started = false;

  if (this._timeoutId) {
    clearTimeout(this._timeoutId);
    this._timeoutId = null;
  }
};

EventsFeedPoller.prototype._schedulePolling = function() {
  var self = this, interval = this._pollInterval;

  if (!this._started) {
    return;
  }

  log.debugf('Scheduling next polling for ${interval}ms in future', {'interval': interval});

  this._timeoutId = setTimeout(function() {
    self._run(function(err) {
      // Error is not fatal so the processing is not stopped and we just
      // propagate it to the user.
      if (err) {
        log.debug('Error while polling events feed', {'err': err});
        self.emit('error', err);
      }

      self._schedulePolling();
    });
  }, interval);
};

EventsFeedPoller.prototype._pollFeed = function(callback) {
  log.debug('Polling events feed', {'marker': this._nextMarker});

  this._eventsClient.list(this._nextMarker, {}, function(err, entries) {
    if (err) {
      log.error('Failed to retrieve events', {'err': err});
      callback(err);
      return;
    }

    log.debugf('Received ${count} events', {'count': entries.length});
    callback(null, entries);
  });
};

EventsFeedPoller.prototype._processEntries = function(entries, callback) {
  if (entries.length >= 1) {
    if (this._nextMarker && (entries[0].id === this._nextMarker)) {
      // If marker is provided events equal to and greater than marker are
      // returned. This means we have already seen the first event so we
      // discard it.
      entries.splice(0, 1);
    }

    if (entries.length >= 1) {
      // Set next marker to the last event id (if available)
      this._nextMarker = entries[entries.length - 1].id;
    }
  }

  log.debugf('Got ${count} new events', {'count': entries.length,
                                         'nextMarker': this._nextMarker});

  callback(null, entries);
};

EventsFeedPoller.prototype._run = function(callback) {
  async.waterfall([
    this._pollFeed.bind(this),
    this._processEntries.bind(this),
    this._processEntriesAndEmitEvents.bind(this)
  ], callback);
};

/**
 * Process entries in the event feed and emit new events.
 */
EventsFeedPoller.prototype._processEntriesAndEmitEvents = function(entries, callback) {
  var self = this;

  entries.forEach(function(entry) {
    var item;

    switch (entry.type) {
      case 'service.join':
      case 'service.timeout':
      case 'service.remove':
      case 'configuration_value.update':
      case 'configuration_value.remove':
        item = {'id': entry.id, 'timestamp': entry.timestamp,
                'payload': entry.payload};
        self._emit(entry.type, item);
        break;

      default:
        log.errorf('Unrecognized event type: ${type}', {'type': entry.type});
        break;
    }
  });

  callback();
};

EventsFeedPoller.prototype._emit = function(type, payload) {
  log.trace('Emitting event', {'type': type});

  this.emit(type, payload);
};

exports.EventsFeedPoller = EventsFeedPoller;
