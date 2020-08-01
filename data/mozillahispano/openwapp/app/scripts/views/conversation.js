define([
  'backbone',
  'handlebars',
  'zeptojs',
  'global',
  'templates',
  'models/conversation',
  'models/message',
  'views/text-message',
  'views/multimedia-message',
  'views/location-message',
  'views/notification-message',
  'views/compose-message',
  'views/compose-location',
  'views/compose-image',
  'templates/helpers'
], function (Backbone, Handlebars, $, global, templates, ConversationModel,
  MessageModel, TextMessageView, MultiMediaMessageView, LocationMessageView,
  NotificationView, ComposeMessageView, ComposeLocationView,
  ComposeImageView, Helpers) {
  'use strict';

  // In seconds
  var TYPING_EVENTS_TIMEOUT = 5;

  var Conversation = Backbone.View.extend({

    el: '#main-page',

    template: templates.conversation,

    model: ConversationModel,

    contact: null,

    events: {
      'click a.location': 'showComposeLocation',
      'click a.multimedia': 'showComposeImage',
      'click form#conversation-compose button.back': 'hideComposeText',
      'keyup input#message-text-input': 'sendTypingActive',
      'click li.location img': 'goToImageViewer',
      'click header > a': 'goToInbox',
      'contextmenu .messages': '_showContextMenu',
      'contextmenu .page-wrapper': '_chooseWallpaper'
    },

    initialize: function (options) {
      this.scrollTop = options.scrollTop;

      // Array of MessageViews for clearing and removing
      this.messageViews = [];

      this.listenTo(this.model, 'message:added', this._onAddMessage);
      this.listenTo(this.model, 'dirty:participants', this._updateParticipants);
      this.listenTo(this.model.get('messages'), 'remove',
        this._onRemoveMessage);
      this.listenTo(this.model.get('messages'), 'reset', this.render);

      this.composeMessageView = new ComposeMessageView({
        model: new MessageModel()
      });

      this.listenTo(this.composeMessageView, 'compose:message:text',
        this._onComposeMessage);

      this.listenTo(global.rtc, 'typing:active',
        this._setContactTypingActive);

      this.listenTo(global.rtc, 'typing:idle',
        this._setContactTypingIdle);

      this.listenTo(global.rtc, 'delivered', function (from, commId) {
        this.model.get('messages').setStatusReceived(commId);
      });

      this.contact = global.contacts.get(this.model.get('id'));
      this.contact.syncAllAndSave();
      this.listenTo(this.contact, 'change:displayName', function (contact) {
        this._updateTitle(contact.get('displayName'));
      });
      this.listenTo(this.contact, 'change:subject', function (contact) {
        this._updateTitle(contact.get('subject'));
      });
      this.listenTo(this.contact, 'change:availability',
        this._updateConnectionStatus);

      global.rtc.subscribe(this.contact.get('phone'));
    },

    clear: function () {
      clearTimeout(this.participantsTimeout);
      this.stopListening();
      this.sendTypingIdle();
      if (this.imageCompose) { this.imageCompose.clear(); }
    },

    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      this._scrollView = this.$el.find('.page-wrapper').get(0);
      $(this._scrollView).on('scroll', this._onScroll.bind(this));

      if (this.model.get('isGroup')) {
        this.$el.find('#conversation').addClass('group');
      }

      this.composeMessageView.render();
      this.$el.find('#conversation').append(this.composeMessageView.$el);

      this.$footer = this.$el.find('footer').first();
      this.$el.find('ul.messages').empty().append(this._renderMessages());

      this.scrollToMessage();
      if (!this.model.get('isGroup')) {
        this._updateConnectionStatus();
      }
      else {
        Helpers.revealEmoji(this.$el.find('h1 a'));
        this._updateParticipants();
      }

      this.listenTo(
        global.notifications, 'notification', this._handleNotification);

      this._setWallpaper(this.model.get('wallpaper'));
    },

    _showContextMenu: function (evt) {
      if (evt) {
        evt.preventDefault();
        evt.stopImmediatePropagation();
      }


      var listitem = $(evt.target).closest('li').get(0);
      if (!listitem) {
        return;
      }

      var messageId = listitem.dataset.messageId;
      var msg = navigator.mozL10n.get('removeMessage');
      if (window.confirm(msg)) {
        console.log('Going to remove messageId', messageId);
        this.model.removeMessage(messageId);
        listitem.parentNode.removeChild(listitem);
      }
    },

    _chooseWallpaper: function () {
      var activity = new window.MozActivity({
        name: 'pick',
        data: {
          type: 'image/*'
        }
      });
      activity.onsuccess = function () {
        this._setWallpaper(activity.result.blob);
      }.bind(this);
    },

    _setWallpaper: function (blob) {
      if (!blob) { return; }
      this.model.set('wallpaper', blob);
      this.model.saveToStorage();
      var background = this.$el.find('#conversation');
      var url = window.URL.createObjectURL(blob);
      background.css('background-image', 'url(' + url  + ')');
    },

    _handleNotification: function (notification) {
      if (notification.conversationId !== this.model.get('id')) {
        this.$el.find('span.icon-back').addClass('new-messages');
        this._enqueueInAppNotification(notification);
      }
    },

    _inAppNotifications: [],

    TIME_TO_DISPLAY_NOTIFICATION: 3000, // 3s

    TIME_TO_HIDE_NOTIFICATION: 5000, // 5s

    _enqueueInAppNotification: function (notification) {
      var _this = this;

      // Show notification area
      _this.$el.find('h2.in-app-notification').removeClass('hide');
      clearTimeout(_this._timeoutToHideNotifications);

      // Add notification task
      this._inAppNotifications.push(function (next) {
        var interpolate = global.l10nUtils.interpolate;
        var l10n = global.localisation[global.language];
        var message = interpolate(l10n.inAppNotification, {
          title: notification.title,
          body: notification.body
        });
        var inAppNotificationArea = _this.$el.find('h2.in-app-notification');
        inAppNotificationArea.text(message);
        Helpers.revealEmoji(inAppNotificationArea);

        setTimeout(function () {
          next();
        }, _this.TIME_TO_DISPLAY_NOTIFICATION);
      });

      function next() {
        if (_this._inAppNotifications.length > 0) {
          var task = _this._inAppNotifications[0];
          task(function () {
            _this._inAppNotifications.shift();
            next();
          });
        }
        else {
          _this._timeoutToHideNotifications = setTimeout(function () {
            _this.$el.find('h2.in-app-notification').addClass('hide');
          }, _this.TIME_TO_HIDE_NOTIFICATION);
        }
      }

      if (_this._inAppNotifications.length === 1) {
        next();
      }
    },

    _updateTitle: function (title) {
      this.model.set('title', title);
      this.$el.find('h1 a').text(title);
      Helpers.revealEmoji(this.$el.find('h1 a'));
    },

    _updateConnectionStatus: function () {
      var _this = this;
      if (this.contact.get('availability') !== 'available') {
        this._hideIsOnline();
        global.rtc.getLastSeen(this.contact.get('phone'),
          function (err, lastSeen) {
            _this._updateLastSeen(lastSeen);
          }
        );
      }
      else {
        this._showIsOnline();
      }
    },

    _updateLastSeen: function (lastSeenInSeconds) {
      var date = new Date(Date.now() - lastSeenInSeconds * 1000);
      this.$el.find('.last-seen time')
        .attr('datetime', date.toISOString())
        .text(Helpers._formattedMessageDate(date));
    },

    _updateParticipants: function () {
      var _this = this;
      this.$el.find('.last-seen').addClass('hide');
      this.$el.find('.is-online').addClass('hide');
      global.client.getGroupParticipants(this.model.get('id'),
        function _showPhones(err, list) {
          var phoneList = list.map(
            function (item) { return item.split('@')[0]; }
          );

          // Delete our own name, so it is not shown.
          phoneList.splice(phoneList.indexOf(global.auth.get('msisdn')), 1);

          var names = [];
          phoneList.forEach(function (phone, index) {
            global.contacts.findOrCreate(phone, undefined,
              function (err, result) {
                var contact = result.contact;
                if (result.isNew) {
                  //Make the sync in different times
                  var wait = 300 * index + 200;
                  setTimeout(function () {
                    contact.syncAllAndSave();
                    contact.once('synchronized:webcontacts', function () {
                      names.push(contact.get('displayName'));
                    });
                  }, wait);
                }
                else {
                  names.push(contact.get('displayName'));
                }
              }
            );
          });

          // Let's fill with participants once we have some loaded
          _this.participantsTimeout = setTimeout(function () {
            _this.$el.find('.participants')
              .text(names.join(', '));
          }, 1500);
        }
      );
    },

    _showIsOnline: function () {
      this.$el.find('.last-seen').addClass('hide');
      this.$el.find('.is-online').removeClass('hide');
    },

    _hideIsOnline: function () {
      this.$el.find('.last-seen').removeClass('hide');
      this.$el.find('.is-online').addClass('hide');
    },

    hideComposeText: function () {
      this.$footer.removeClass('typing');
      this.sendTypingIdle();
    },

    showComposeLocation: function (evt) {
      if (evt) { evt.preventDefault(); }
      global.router.navigate('conversation/' + this.model.get('id') +
        '/sendlocation', {trigger: true});
    },

    scrollToLastMessage: function () {
      var scrollView = this._scrollView;
      if (scrollView) {
        scrollView.scrollTop =
          scrollView.scrollHeight - scrollView.clientHeight;
      }
    },

    scrollToMessage: function () {
      var wrapper = this.$el.find('.page-wrapper')[0];
      if (wrapper && this.scrollTop) {
        wrapper.scrollTop = this.scrollTop;
      } else {
        this.scrollToLastMessage();
      }
    },

    _onComposeMessage: function (message) {
      message.mine = true;
      this.model.get('messages').push(message);
      this._sendMessage(message);
    },

    _sendMessage: function (message) {
      var _this = this;

      // Clear typing timeout
      this.sendTypingIdle();

      global.rtc.sendMessage(
        {
          to: this.contact.get('phone'),
          id: message.cid,
          message: message.get('contents')
        },
        function (error, commId) {
          _this._handleSentMessage(message, error, commId);
        }
      );
    },

    _resendMessage: function (message) {
      message.set('status', 'pending');
      var meta = message.get('meta');
      var destination = this.contact.get('phone');
      meta.date = new Date();
      message.set('meta', meta);
      this.model.get('messages').sort();
      this._updateMessagePosition(message);

      switch (message.get('type')) {
      case 'text':
        this._sendMessage(message);
        break;
      // TODO: Add resend for video and audio
      // (notice there is no preview for them)
      case 'image':
        this.imageCompose = new ComposeImageView({conversation: this.model,
                                              model: message});
        this.imageCompose._uploadImage(destination, message.get('contents'));
        break;
      case 'location':
        var locationView = new ComposeLocationView({
          conversation: this.model,
          model: message
        });
        locationView.sendMessage();
        break;
      }
    },

    _updateMessagePosition: function (message) {
      if (!global.router.currentView ||
        global.router.currentView.model !== this.model) {
        return;
      }

      var foundView = null;
      var foundIndex = -1;

      for (var i = 0; i < this.messageViews.length; i++) {
        if (this.messageViews[i].model === message) {
          foundView = this.messageViews[i];
          foundIndex = i;
          break;
        }
      }

      if (foundView) {
        // remove backbone view (clear events, dettach from DOM)
        foundView.remove();
        // remove view from our list, so _onAddMessage works properly
        this.messageViews.splice(foundIndex, 1);
        // create a new view and position it at the end of our list
        this._onAddMessage(message);
      }
    },

    _handleSentMessage: function (message, error, commId) {
      if (error) { // error sending message
        message.set('status', 'unsent');
      }
      else { // message was sent successfully
        var meta = message.get('meta') || {};
        meta.commId = commId;
        message.set({
          status: 'sent',
          meta: meta
        });
      }

      message.saveToStorage();
    },

    _renderMessages: function () {
      var _this = this;

      this.messageViews = this.model.get('messages').map(function (message) {
        var view = _this._createViewForMessage(message);
        view.render();
        _this.listenTo(view, 'message:resend', _this._resendMessage);
        _this.messageViews.push(view);
        return view;
      });

      return this.messageViews.map(function (view) { return view.$el[0]; });
    },

    _createViewForMessage: function (message) {
      var view = null;
      switch (message.get('type')) {
      case 'text':
        view = new TextMessageView({model: message});
        break;
      case 'image':
      case 'video':
      case 'audio':
        view = new MultiMediaMessageView({model: message});
        break;
      case 'location':
        view = new LocationMessageView({model: message});
        break;
      case 'notification':
        view = new NotificationView({model: message});
        break;
      }

      return view;
    },

    // Finds the position of the next message for an incoming message
    // - returns the index, 0...length   (length = add one at end)
    _findNextMessageIndex: function (message) {
      if (!this.messageViews.length) {
        return 0;
      }
      var messageDate = message.get('meta') ? message.get('meta').date : null;
      for (var i = this.messageViews.length - 1; i >= 0; i--) {
        var v = this.messageViews[i];
        var vdate = v.model.get('meta') ? v.model.get('meta').date : null;
        if (!messageDate || messageDate > vdate) {
          return i + 1;
        }
      }
      return 0;
    },

    _onAddMessage: function (message) {
      var isAtBottom = this._isAtBottom();
      var isNotFirstChunk =
        this._scrollView.scrollHeight > this._scrollView.clientHeight * 1.5;

      // Create and hide view
      var view = this._createViewForMessage(message);
      view.render();
      this.listenTo(view, 'message:resend', this._resendMessage);

      // Make sure the view is added in the right position
      var found = this._findNextMessageIndex(message);
      if (!message.fromRemote && isNotFirstChunk) {
        var messageTimestamp = message.get('meta').date.getTime();
        // This is because the message can come in any order so we force
        // elements after _nextToShow to be visible. Not optimal but working
        // as this happens only from time to time, mainly after resending
        // a old not send message.
        // TODO: Add a combined index with a string timestamp (padded with 0s
        // to big enough positions) as [date, conversationId]. conversationId
        // need to be padded as well. Damn IDB!
        if (this._nextToShow === null ||
            messageTimestamp <=
              parseInt(this._nextToShow.dataset.timestamp, 10)) {
          this._nextToShow = this._nextToShow || view.$el.get(0);
          view.$el.hide();
        }
      }
      if (found === this.messageViews.length) {
        this.$el.find('ul.messages').append(view.$el);
      } else if (found === 0) {
        this.$el.find('ul.messages').prepend(view.$el);
      } else {
        this.messageViews[found].$el.before(view.$el);
      }
      this.messageViews.splice(found, 0, view);

      if (isAtBottom || message.mine) {
        this.scrollToLastMessage();
      }
    },

    _onScroll: function () {
      var scrollHeight = this._scrollView.scrollHeight;
      var scrollTop = this._scrollView.scrollTop;
      if (scrollTop < 60) {
        this._showNextChunk();
        this._scrollView.scrollTop =
          this._scrollView.scrollHeight - scrollHeight + scrollTop;
      }
    },

    CHUNK_SIZE: 7,

    _nextToShow: null,

    _showNextChunk: function () {
      var messagesShown = 0;
      while (this._nextToShow && messagesShown < this.CHUNK_SIZE) {
        $(this._nextToShow).show();
        this._nextToShow = this._nextToShow.previousSibling;
        messagesShown++;
      }
    },

    _isAtBottom: function () {
      var scrollView = this._scrollView;
      var lastScroll = scrollView.scrollTop;
      scrollView.scrollTop += 1;

      // scrollTop is clamped to the max value if we already are in the bottom
      var isAtBottom = scrollView.scrollTop === lastScroll;
      scrollView.scrollTop = lastScroll;
      return isAtBottom;
    },

    _onRemoveMessage: function (message) {
      console.log('[conversation] Looking for message ', message);
      var newArray = [];
      this.messageViews.forEach(function (view) {
        if (view.model === message) {
          console.log('[conversation] Message found and removed');
          if (typeof view.clear !== 'undefined') {
            view.clear();
          }
          view.$el.remove();
          view.stopListening();
        } else {
          newArray.push(view); // add the rest
        }
      });
      this.messageViews = newArray;
    },

    _setContactTypingActive: function (from) {
      if (from.msisdn === this.contact.get('phone')) {
        this.$el.find('ul.messages').removeClass('idle');
        this.$el.find('ul.messages').addClass('active');
      }
    },

    _setContactTypingIdle: function (from) {
      if (from.msisdn === this.contact.get('phone')) {
        this.$el.find('ul.messages').removeClass('active');
        this.$el.find('ul.messages').addClass('idle');
      }
    },

    sendTypingActive: function () {
      this._sendTyping('active');
    },

    sendTypingIdle: function () {
      this._sendTyping('idle');
    },

    _sendTyping: function (state) {
      var _this = this;

      // Clear timeout still typing
      if (this.typingTimeout && state === 'active') {
        window.clearTimeout(this.typingTimeout);
      } else if (this.typingTimeout) {  // Send idle, clear timeout
        window.clearTimeout(this.typingTimeout);
        this.typingTimeout = null;
        global.rtc.typing(_this.model.id, state);
      } else {  // No timeout set, start typing
        global.rtc.typing(_this.model.id, state);
      }

      if (state === 'active') {
        this.typingTimeout = window.setTimeout(function () {
          global.rtc.typing(_this.model.id, 'idle');
          _this.typingTimeout = null;
        }, TYPING_EVENTS_TIMEOUT * 1000);
      }
    },

    close: function () {
      this.sendTypingIdle();
    },

    goToImageViewer: function (evt) {
      evt.preventDefault();
      var link = $(evt.target).parent().attr('href');
      link += '/' + this.$el.find('#conversation .page-wrapper').scrollTop();
      global.router.navigate(link, {trigger: true});
    },

    goToInbox: function (evt) {
      evt.preventDefault();
      var link = $(evt.target).attr('href');
      global.rtc.unsubscribe(this.contact.get('phone'));
      global.router.navigate(link, {trigger: true});
    },

    showComposeImage: function (evt) {
      if (evt) { evt.preventDefault(); }
      global.router.navigate('conversation/' + this.model.get('id') +
        '/sendimage', { trigger: true });
    },

    setProgressIndicator: function (value) {
      if (value < 100) {
        this.$el.find('.progressContainer').css('display', 'table');
      } else {
        this.$el.find('.progressContainer').css('display', 'none');
      }
      this.$el.find('.progressContainer progress.pack-activity').val(value);
    }
  });

  return Conversation;
});
