define([
  'backbone',
  'global',
  'utils/platform'
], function (Backbone, global, platform) {
  'use strict';

  var Notification = Backbone.Model.extend({

    _app: null,

    _unattendedNotifications: 0,

    _queue: [],

    send: function (title, body, conversationId) {
      var notification =
        { title: title, body: body, conversationId: conversationId };

      // We are in background and there is not unattended notifications
      if (document.mozHidden && this._unattendedNotifications === 0) {
        console.log('[notifications] No unattended notifications.');
        this._sendNow(notification);
      }

      // In background with unattended notifications
      else if (document.mozHidden && this._unattendedNotifications) {
        console.log('[notifications] Unattended notifications. Enqueing.');
        this._enqueue(notification);
      }

      // In foreground
      else {
        this.trigger('notification', notification);
      }
    },

    _enqueue: function (notification) {
      this._queue.push(notification);
    },

    _sendNow: function (notification) {

      var _this = this;

      if (document.mozHidden) {
        if (!('mozNotification' in navigator)) {
          console.log('Notification disabled');
          return;
        }

        navigator.mozApps.getSelf().onsuccess = function gotSelf(evt) {
          _this._app = evt.target.result;
          _this._createNotification(notification.title, notification.body);
        };
      }
      else {
        this.trigger('notification', notification);
      }

    },

    sendReport: function () {
      var pendingNotifications = this._queue.length;
      if (pendingNotifications === 0) {
        return;
      }

      // One notification pending, send just that
      var notification = {
        title: this._queue[0].title,
        body: this._queue[0].body
      };

      // More than one, make a report
      if (pendingNotifications > 1) {
        var interpolate = global.l10nUtils.interpolate;
        var l10n = global.localisation[global.language];
        var titleId = 'notificationReportTitle';
        var bodyId = 'notificationReportBody';
        var titleMsg = l10n[titleId];
        var bodyMsg = l10n[bodyId];

        var notificationsByConversations = {};
        this._queue.forEach(function (notification) {
          notificationsByConversations[notification.conversationId] = true;
        });

        notification.title = interpolate(titleMsg, {
          count: pendingNotifications
        });

        notification.body = interpolate(bodyMsg, {
          count: Object.keys(notificationsByConversations).length
        });
      }

      this._queue = [];
      this._sendNow(notification);
      console.log('[notifications] Report sent!');
    },

    _createNotification: function (title, body) {
      var _this = this;
      var icon = _this._getIconURI(_this._app);

      var notification =
        navigator.mozNotification.createNotification(title, body, icon);

      notification.onclick = function () {
        _this._app.launch();
        // TODO: to open the app in the conversation
        //  window.location.hash = '#conversation/' + phone;

        // Firefox OS 1.1 does not send the onclose event along with the
        // onclick, so we must rely on onclick only for 1.1
        if (platform.isFFOS11()) {
          _this._unattendedNotifications--;
        }
      };

      notification.onclose = function () {
        _this._unattendedNotifications--;
      };

      _this._unattendedNotifications++;
      notification.show();
    },

    /**
     * Return the URI of the icon
     */
    _getIconURI: function (app, entryPoint) {
      var icons = app.manifest.icons;

      if (entryPoint) {
        /*jshint camelcase: false */
        icons = app.manifest.entry_points[entryPoint].icons;
        /*jshint camelcase: true */
      }

      if (!icons) {
        return null;
      }

      var sizes = Object.keys(icons).map(function parse(str) {
        return parseInt(str, 10);
      });
      sizes.sort(function (x, y) { return y - x; });

      var HVGA = document.documentElement.clientWidth < 480;
      var index = sizes[HVGA ? sizes.length - 1 : 0];
      return app.installOrigin + icons[index];
    }

  });

  return Notification;
});
