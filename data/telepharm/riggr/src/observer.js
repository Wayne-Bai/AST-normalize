// observer.js
// Establishes observer pattern (pub/sub) methods
// ---
// Part of the Riggr SPA framework <https://github.com/Fluidbyte/Riggr> and released
// under the MIT license. This notice must remain intact.
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.observer = factory();
  }
}(this, function () {

  var observer = {

    // Placeholder object for topics
    topics: {},

    // ID for incrementing
    topic_id: 0,

    // Publishes event to topic (string) with arguments
    publish: function (topic, args) {
      var self = this;
      if (!self.topics.hasOwnProperty(topic)) {
        return false;
      }
      setTimeout(function () {
        var subscribers = self.topics[topic];
        var len;

        if (subscribers.length) {
          len = subscribers.length;
        } else {
          return false;
        }

        while (len--) {
          subscribers[len].fn(args);
        }
      }, 0);
      return true;
    },

    // Creates new subscription by passing toping (string) and method
    subscribe: function (topic, fn) {
      var self = this;
      var id = ++this.topic_id;
      var max;
      var i;

      // Create new topic
      if (!self.topics[topic]) {
        self.topics[topic] = [];
      }

      // Prevent re-subscribe issues (common on route-reload)
      for (i = 0, max = self.topics[topic].length; i < max; i++) {
        if (self.topics[topic][i].fn.toString() === fn.toString()) {
          return self.topics[topic][i].id;
        }
      }

      // Push new subscription
      self.topics[topic].push({
        id: id,
        fn: fn
      });

      return id;
    },

    // Pass in token generated on subscription to remove entry
    unsubscribe: function (token) {
      var self = this;
      var topic;
      var i;
      var max;
      for (topic in self.topics) {
        if (self.topics.hasOwnProperty(topic)) {
          for (i = 0, max = self.topics[topic].length; i < max; i++) {
            if (self.topics[topic][i].id === token) {
              self.topics[topic].splice(i, 1);
              return token;
            }
          }
        }
      }
      // Mo match...
      return false;
    }
  };

  return observer;

}));
