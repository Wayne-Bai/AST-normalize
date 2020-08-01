(function (ng, undefined) {
    'use strict';
    var module = ng.module('lrNotifier', []);
    module.provider('lrNotifier', function () {
        var
            channel = {},
            timer = 3000;

        this.setTimer = function setTimer(value) {
            timer = ng.isNumber(value) === true ? value : timer;
        };

        this.$get = ['$timeout', function (timeout) {

            function pushNotification(channelName, notification) {
                if (channel[channelName] !== undefined) {
                    channel[channelName].push(notification);
                    timeout(function () {
                        removeNotification(channelName, notification);
                    }, timer);
                }
            }

            function logNotification(channel, level, message) {
                var notif = {level: level, message: message};
                pushNotification(channel, notif);
                return notif;
            }

            function getChannel(channelName) {
                return channel[channelName] === undefined ? channel[channelName] = [] : channel[channelName];
            }

            function removeNotification(channelName, notification) {
                var index;
                if (channel[channelName] !== undefined) {
                    index = channel[channelName].indexOf(notification);
                    channel[channelName].splice(index, 1);
                }
            }

            return function channelFactory(channel) {
                return {
                    getChannel: ng.bind(this, getChannel, channel),
                    pushNotification: ng.bind(this, pushNotification, channel),
                    removeNotification: ng.bind(this, removeNotification, channel),
                    info: ng.bind(this, logNotification, channel, 'info'),
                    warn: ng.bind(this, logNotification, channel, 'warn'),
                    error: ng.bind(this, logNotification, channel, 'error'),
                    success: ng.bind(this, logNotification, channel, 'success')
                };
            };

        }];

    });

    module.directive('lrNotificationStackContainer', ['lrNotifier', function (notifier) {
        return {
            controller: ['lrNotifier', '$attrs', function stackController(notifier, $attrs) {
                var channelName = $attrs.lrNotificationStackContainer || 'global';
                var channel = notifier(channelName);
                this.notifications = notifier(channelName).getChannel();
                this.removeNotification = channel.removeNotification;
            }],
            controllerAs: 'lrNotifierCtrl'
        };
    }])


})(angular);
