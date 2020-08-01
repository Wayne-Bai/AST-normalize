import RSVP from "rsvp";
import Logger from "oasis/logger";
import { assert, uniq, reverseMerge } from "oasis/util";
import { a_forEach, a_reduce, a_filter } from "oasis/shims";

import { OasisPort } from "oasis/message_channel";

var OasisSandbox = function(oasis, options) {
  options = reverseMerge(options || {}, {
    reconnect: oasis.configuration.reconnect
  });

  var reconnect = options.reconnect;
  assert( reconnect === "none" || reconnect === "verify" || reconnect === "any",
          "`reconnect` must be one of 'none', 'verify' or 'any'.  '" + reconnect + "' is invalid.");

  this.connections = {};
  this.wiretaps = [];

  this.oasis = oasis;

  // Generic capabilities code
  var pkg = oasis.packages[options.url];

  var capabilities = options.capabilities;
  if (!capabilities) {
    assert(pkg, "You are trying to create a sandbox from an unregistered URL without providing capabilities. Please use Oasis.register to register your package or pass a list of capabilities to createSandbox.");
    capabilities = pkg.capabilities;
  }

  pkg = pkg || {};

  this.adapter = options.adapter || Oasis.adapters.iframe;

  this._capabilitiesToConnect = this._filterCapabilities(capabilities);
  this.envPortDefereds = {};
  this.sandboxPortDefereds = {};
  this.channels = {};
  this.capabilities = {};
  this.options = options;
  this.firstLoad = true;

  var sandbox = this;
  this.promisePorts();
  this.adapter.initializeSandbox(this);
};

OasisSandbox.prototype = {
  waitForLoad: function () {
    return this._waitForLoadDeferred().promise;
  },

  wiretap: function(callback) {
    this.wiretaps.push(callback);
  },

  connect: function(capability) {
    var portPromise = this.envPortDefereds[capability].promise;

    assert(portPromise, "Connect was called on '" + capability + "' but no such capability was registered.");

    return portPromise;
  },

  createAndTransferCapabilities: function () {
    if (!this.firstLoad) { this.promisePorts(); }

    this.createChannels();
    this.connectPorts();

    // subsequent calls to `createAndTransferCapabilities` requires new port promises
    this.firstLoad = false;
  },

  promisePorts: function () {
    a_forEach.call(this._capabilitiesToConnect, function(capability) {
      this.envPortDefereds[capability] = RSVP.defer();
      this.sandboxPortDefereds[capability] = RSVP.defer();
    }, this);
  },

  createChannels: function () {
    var sandbox = this,
        services = this.options.services || {},
        channels = this.channels;
    a_forEach.call(this._capabilitiesToConnect, function (capability) {

      Logger.log("container: Will create port for '" + capability + "'");
      var service = services[capability],
          channel, port;

      // If an existing port is provided, just
      // pass it along to the new sandbox.

      // TODO: This should probably be an OasisPort if possible
      if (service instanceof OasisPort) {
        port = this.adapter.proxyPort(this, service);
        this.capabilities[capability] = service;
      } else {
        channel = channels[capability] = this.adapter.createChannel(sandbox.oasis);

        var environmentPort = this.adapter.environmentPort(this, channel),
            sandboxPort = this.adapter.sandboxPort(this, channel);

        Logger.log("container: Wiretapping '" + capability + "'");

        environmentPort.all(function(eventName, data) {
          a_forEach.call(this.wiretaps, function(wiretap) {
            wiretap(capability, {
              type: eventName,
              data: data,
              direction: 'received'
            });
          });
        }, this);

        a_forEach.call(this.wiretaps, function(wiretap) {
          var originalSend = environmentPort.send;

          environmentPort.send = function(eventName, data) {
            wiretap(capability, {
              type: eventName,
              data: data,
              direction: 'sent'
            });

            originalSend.apply(environmentPort, arguments);
          };
        });

        if (service) {
          Logger.log("container: Creating service for '" + capability + "'");
          /*jshint newcap:false*/
          // Generic
          service = new service(environmentPort, this);
          service.initialize(environmentPort, capability);
          sandbox.oasis.services.push(service);
          this.capabilities[capability] = service;
        }

        // Law of Demeter violation
        port = sandboxPort;

        this.envPortDefereds[capability].resolve(environmentPort);
      }

      Logger.log("container: Port created for '" + capability + "'");
      this.sandboxPortDefereds[capability].resolve(port);
    }, this);
  },

  destroyChannels: function() {
    for( var prop in this.channels ) {
      this.channels[prop].destroy();
      delete this.channels[prop];
    }
    this.channels = [];
  },

  connectPorts: function () {
    var sandbox = this;

    var allSandboxPortPromises = a_reduce.call(this._capabilitiesToConnect, function (accumulator, capability) {
      return accumulator.concat(sandbox.sandboxPortDefereds[capability].promise);
    }, []);

    RSVP.all(allSandboxPortPromises).then(function (ports) {
      Logger.log("container: All " + ports.length + " ports created.  Transferring them.");
      sandbox.adapter.connectPorts(sandbox, ports);
    })['catch'](RSVP.rethrow);
  },

  start: function(options) {
    this.adapter.startSandbox(this, options);
  },

  terminate: function() {
    var sandbox = this,
        channel,
        environmentPort;

    if( this.isTerminated ) { return; }
    this.isTerminated = true;

    this.adapter.terminateSandbox(this);

    this.destroyChannels();

    for( var index=0 ; index<sandbox.oasis.services.length ; index++) {
      sandbox.oasis.services[index].destroy();
      delete sandbox.oasis.services[index];
    }
    sandbox.oasis.services = [];
  },

  onerror: function(error) {
    throw error;
  },

  name: function() {
    return this.adapter.name(this);
  },

  // Oasis internal

  _filterCapabilities: function(capabilities) {
    return uniq.call(this.adapter.filterCapabilities(capabilities));
  },

  _waitForLoadDeferred: function () {
    if (!this._loadDeferred) {
      // the adapter will resolve this
      this._loadDeferred = RSVP.defer();
    }

    return this._loadDeferred;
  }
};

export default OasisSandbox;
