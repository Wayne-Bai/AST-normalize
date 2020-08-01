var Message = require('./message');

/**
 * The CommandManager object provides infrastructure for command processing within Nitrogen. Commands are messages that are issued
 * with the intent of changing the state of a principal in the system. The CommandManager's role is to watch that principal's message
 * stream and effect state changes on the device it is managing based on these commands and their context in the stream. The CommandManager
 * is always subclassed into a class that handles a specific type of command. This subclass is responsible for providing a set of functions
 * that define how the message stream should be interpreted and acted on: executeActiveCommands, isRelevant, isCommand, obsoletes. See each
 * function in this class for more information on what an implementation of these functions should provide.
 *
 * An example of how a SwitchManager subclass is used to control a light in a device application looks like this:
 *
 * service.connect(light, function(err, session, light) {
 *     if (err) return console.log('failed to connect light: ' + err);
 *
 *     var switchManager = new nitrogen.SwitchManager(light);
 *     switchManager.start(session, { $or: [ { to: light.id }, { from: light.id } ] }, function(err) {
 *        if (err) return console.log('switchManager failed to start: ' + err);
 *     });
 * });
 *
 * @class CommandManager
 * @namespace nitrogen
 */

function CommandManager(device) {
    this.device = device;
    this.executing = false;
    this.messageQueue = [];
}

/**
 * Returns the array of commands that are currently active for this manager.  This is typically used to execute them during executeQueue.
 *
 * @method activeCommands
 * @returns {Array of Messages} Array of active command messages.
 **/

CommandManager.prototype.activeCommands = function() {
    var filtered = [];
    this.messageQueue.forEach(function(message) {
        if (message.millisToTimestamp() <= 0) {
            filtered.push(message);
        }
    });

    return filtered;
};

CommandManager.prototype.commandFilter = function() {
    return {
        tags: CommandManager.commandTag(this.device.id)
    };
};

CommandManager.commandTag = function(principalId) {
    return "command:" + principalId;
};

/**
 * Reduce the current message queue to the set of active commands by obsoleting completed and
 * expired commands.
 *
 * @method collapse
 **/

CommandManager.prototype.collapse = function() {
    var collapsedMessages = [];
    var upstreamMessage;
    var self = this;

    this.sortQueue();

    // first, strip all non relevant messages.
    var relevantMessages = [];
    this.messageQueue.forEach(function(message) {
        if (self.isRelevant(message)) {
            relevantMessages.push(message);
        }
    });

    // dequeue the first message in the message queue leaving only the downstream messages...
    while ((upstreamMessage = relevantMessages.shift())) {
        if (self.isCommand(upstreamMessage)) {
            var idx;
            var obsoleted = false;
            for (idx=0; idx < relevantMessages.length && !obsoleted; idx++) {
                var downstreamMessage = relevantMessages[idx];
                obsoleted = this.obsoletes(downstreamMessage, upstreamMessage);
            }

            if (!obsoleted) {
                collapsedMessages.push(upstreamMessage);
                // console.log('collapse: message: ' + upstreamMessage.from + '->' + upstreamMessage.to + ' not obsolete, ');
            } else {
                // console.log('collapse: message: ' + upstreamMessage.from + '->' + upstreamMessage.to + ' has been obsoleted, removing.');
            }
        } else {
            // console.log('collapse: message: ' + upstreamMessage.from + '->' + upstreamMessage.to + ' is type: ' + upstreamMessage.type + ': removing.');
        }
    }

    this.messageQueue = collapsedMessages;
};

/**
 * Executes the currently active command queue.  If the next command's timestamp occurs in the future,
 * setup a timeout to retry then.
 *
 * @method execute
 * @private
 **/

CommandManager.prototype.execute = function() {
    var self = this;

    if (this.device.id !== this.session.principal.id) return self.session.log.debug('CommandManager::execute: not in session of device, skipping execution.');
    if (this.executing) return; // self.session.log.debug('CommandManager::execute: already executing command, skipping execute. current queue: ' + JSON.stringify(this.messageQueue));
    if (!this.messageQueue || this.messageQueue.length === 0) return self.session.log.debug('CommandManager::execute: empty command queue.');

    var msToExecute = this.messageQueue[0].millisToTimestamp();
    if (msToExecute > 0) {
        self.session.log.debug('CommandManager::execute: top message occurs in the future, setting timeout for ' + msToExecute + 'ms.');
        return setTimeout(function() { self.execute(); }, msToExecute);
    }

    this.executing = true;
    this.executeQueue(function(err) {
        self.executing = false;
        if (err) self.session.log.error('CommandManager::execute: execution error: ' + err);

        // set up a new execution pass on the command queue.
        setTimeout(function() { self.execute(); }, 0);
    });
};

/**
 * Executes the active commands in the message queue. Should be implemented by subclasses of CommandManager.
 *
 * Commands that have reached this point have been passed the start filter (see the CommandManager.start() method details),
 * had a "true" result out of the CommandManager.isRelevant and CommandManager.isCommand methods and finally has recieved a "false"
 * to the CommandManager.obsoletes method.
 *
 * An example use of this from the Simple Device guide:
 *
 * SimpleLEDManager.prototype.executeQueue = function(callback) {
 *     var self = this;
 *
 *     // If you don't have a device, throw an error.
 *     if (!this.device) return callback(new Error('no device attached to control manager.'));
 *
 *     var activeCommands = this.activeCommands();
 *     if (activeCommands.length === 0) {
 *         this.session.log.warn('SimpleLEDManager::executeQueue: no active commands to execute.');
 *         return callback();
 *     }
 *
 *     // We will take all of the activeCommand's ids and use pass them to the "response_to".
 *     // This is important for the "obsoletes" method.
 *     var commandIds = [];
 *     activeCommands.forEach(function(activeCommand) {
 *        commandIds.push(activeCommand.id);
 *     });
 *
 *     // Create the status response
 *     var message = new nitrogen.Message({
 *         type: '_myStatusResponse',
 *         tags: nitrogen.CommandManager.commandTag(self.device.id),
 *         body: {
 *             command: {
 *                 message: "My status is good"
 *             }
 *         },
 *         response_to: commandIds
 *     });
 *
 *     message.send(_session, function(err, message) {
 *         if (err) return callback(err);
 *
 *         // Let the command manager know we processed this _lightOn message by passing it the _isOn message.
 *         self.process(new nitrogen.Message(message));
 *
 *         // Need to callback if there aren't any issues so commandManager can proceed.
 *         return callback();
 *      });
 *    }
 *
 * @method executeQueue
 **/

/**
 * Return true if this message is relevant to the CommandManager. Should be implemented by subclasses of CommandManager.
 *
 * This works in concert with the filter passed into the server in the start method. It enables more intricate processing and
 * filtering than the simple filter. It is also possible that you could just return true on the method if your filter is correct and you
 * don't want to filter out additional messages. For example:
 *
 * MyCommandManager.prototype.isRelevant = function(message) {
 *    return (message.body.property === "value I'm looking for");
 * };
 *
 * @method isRelevant
 * @param {Object} message The message to test for relevance.
 **/

/**
 * Return true if this message is a command that this CommandManager can process. Should be implemented by subclasses of CommandManager.
 *
 * For example:
 *
 * MyCommandManager.prototype.isCommand = function(message) {
 *    return message.is('_myCommandName');
 * };
 *
 * @method isCommand
 * @param {Object} message The message to test to see if it is a relevant command.
 **/

/**
 * Return the last active command in the message queue as ordered by timestamp.
 *
 * @method lastActiveCommand
 **/

CommandManager.prototype.lastActiveCommand = function() {
    var activeCommands = this.activeCommands();
    return activeCommands.length > 0 ? activeCommands[activeCommands.length - 1] : null;
};

/**
 * Returns true if the given message upstream in time of the given downstream message is obsoleted by
 * the downstream message. Should be overridden by subclasses to provide command type specific
 * obsoletion logic.  Overrides should start their implementation by calling this function for base
 * functionality.
 *
 * For example:
 *
 * MyCommandManager.prototype.obsoletes = function(downstreamMsg, upstreamMsg) {
 *     if (nitrogen.CommandManager.obsoletes(downstreamMsg, upstreamMsg))
 *         return true;
 *
 *     var value = downstreamMsg.is("_myStatusResponse") &&
 *                 downstreamMsg.isResponseTo(upstreamMsg) &&
 *                 upstreamMsg.is("_myStatusRequest");
 *
 *     return value;
 * };
 *
 * @method obsoletes
 * @param {Object} downstreamMsg The downstream message that potentially obsoletes the upstream message.
 * @param {Object} upstreamMsg The upstream message that is potentially obsoleted by the downstream message.
 **/

CommandManager.obsoletes = function(downstreamMsg, upstreamMsg) {
    if (downstreamMsg.ts < upstreamMsg.ts) return false;
    if (downstreamMsg.expired()) return false;
    if (upstreamMsg.expired()) return true;

    return false;
};

/**
 * Process new message in this principal's message stream:  adds it to the messageQueue, collapses the
 * current message stream, and sets up timeout to handle expiration of this message and the subsequent
 * collapse that should occur.
 *
 * @method process
 * @param {Object} message The new message to process.
 * @private
 **/

CommandManager.prototype.process = function(message) {
    if (!this.isRelevant(message)) return;

    this.messageQueue.push(message);
    this.collapse();

    var self = this;

    if (message.expires) {
        var nextExpiration = Math.max(message.millisToExpiration(), 0);

        setTimeout(function() { self.collapse(); }, nextExpiration);
    }
};

CommandManager.prototype.sortQueue = function() {
    this.messageQueue.sort(function(a,b) {
        return a.ts - b.ts;
    });
};

/**
 * Starts command processing on the message stream using the principal's session. It fetches all the
 * current messages, processes them, and then starts execution. It also establishes a subscription to
 * handle new messages and automatically executes them as they are received.
 *
 * The filter specified is passed to the service as both a query and subscription and should specify a bound on the messages you'd like
 * to receive.  By default, it uses a commandFilter (as defined in commandFilter) which is a tag applied to messages that are "command relevant"
 * for this device. and is an opt in model for messages that you want to recieve. You can further filter out messages if you like but this can handle
 * nearly all cases. In the case that you can't specify a perfect filter, you can further filter the message stream by subclassing the
 * "isRelevant" function.
 *
 * In the most common case, your implementation of start in your CommandManager subclass should look like this:
 *
 * MyCommandManager.prototype.start = function(session, callback) {
 *    return nitrogen.CommandManager.prototype.start.call(this, session, null, callback);
 * };
 *
 * @method start
 * @param {Object} session Session this CommandManager should operate under.
 * @param {Object} filter Filter for relevant messages for this CommandManager.  This is usually specified by the CommandManager subclass.
 * @param {Object} callback Callback of the form f(err, message).  Called after each new message received.
 **/

CommandManager.prototype.start = function(session, filter, callback) {
    this.session = session;

    // if no custom filter is passed, use a command query.
    if (!filter) {
        filter = this.commandFilter();
    }

    var self = this;
    Message.find(session, filter, { sort: { ts: -1 }, limit: 1000 }, function(err, reversedMessages) {
        if (err) return callback(err);

        var messages = reversedMessages.reverse();

        // collapse the message stream down to the just the active commands.
        messages.forEach(function(message) { self.process(message); });

        self.execute();

        session.onMessage(filter, function(message) {
            self.process(message);
            callback(null, message);

            // if we aren't currently executing anything, kickstart execution.
            if (!self.executing) {
                self.execute();
            }
        });

        session.log.info('commandManager: started.');
        callback();
    });
};

module.exports = CommandManager;