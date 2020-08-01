// vim: set et sw=4 ts=4 sts=4 fdm=marker ff=unix fenc=gbk nobomb:
/**
 * ����ʱ���
 *
 * @author mingcheng<i.feelinglucky#gmail.com>
 * @date   2010-06-09
 * @link   http://www.gracecode.com/
 */

KISSY.add("countdown", function(S) {
    var Util = YAHOO.util, Dom = Util.Dom , 
        Event = Util.Event, Lang = YAHOO.lang;

    // Ĭ������
    var defConfig = {
        autoStart: true, // �Զ���ʼ
        interval:  1000, // ���������
        separatorCls: 'separator', // �������ʽ����
        timeLeft: 0 // ʣ��ʱ�䣬��λΪ��
    };

    var ON_START = 'start', ON_TURN = 'turn', ON_FINISHED = 'finished', ON_STOP = 'stop';

    // �죬Сʱ�����ӣ���
    var TIME = [3600 * 24, 3600, 60, 1], 
        countTimeLeft = function(timeLeft) {
            var result = [];
            S.each(TIME, function(c){
                result.push(parseInt(timeLeft/c, 10));
                timeLeft = timeLeft % c;
            });

            return result.reverse();
        };

    var countdown = function(items, config) {
        var self = this, tmp = [];

        config = S.merge(defConfig, config);
        if (!Lang.isArray(items)) {
            items = S.makeArray(items); // @TODO ���õ�ת��Ϊ����İ취
        }

        // ��ʽ���ڵ��б�
        S.each(items || [], function(c) {
            if (!Dom.hasClass(c, config.separatorCls || 'separator')) {
                tmp.push(c);
            } else {
                if (tmp.length) {
                    items.push(tmp); tmp = [];
                }
            }
        });
        if (tmp.length) { items.push(tmp); }

        // ������ʵ��
        self.items     = items.reverse();
        self.config    = config;
        self.timeLeft  = config.timeLeft || 0;

        // �Զ����У�
        if (config.autoStart) {
            self.start();
        }
    };

    S.augment(countdown, {
        stop: function() {
            var self = this;
            if (self.timer) {
                self.timer.cancel();
            }

            self.fire(ON_STOP);
        },

        turn: function() {
            var self = this, items = self.items, format = self.format;

            // �Ѿ����
            if (self.timeLeft < 0) {
                self.fire(ON_FINISHED);
                self.stop();
                return true;
            }

            var results = countTimeLeft(self.timeLeft);

            for(var i = 0, len = items.length; i < len; i++) {
                var show = items[i], result = results[i];
                if (!Lang.isUndefined(show) && !Lang.isUndefined(result)) {
                    var result = (results[i]).toString(), k,
                        offset = show.length > result.length;

                    // ǰ�ò��㲹��
                    if (offset > 0) {
                        for(k = 0; k < offset; k++) {
                            result = '0' + result;
                        }
                    }

                    for(k = 0; k < show.length; k++) {
                        show[k].className = 'c' + result.charAt(k);
                    }
                }
            }

            self.fire(ON_TURN);
            self.timeLeft--;
        },

        start: function() {
            var self = this, config = self.config;
            self.fire(ON_START);
            self.timer = S.later(self.turn, config.interval || 1000, true, self);
        }
    });

    S.augment(countdown, S.EventTarget);
    S.Countdown = countdown;
});
