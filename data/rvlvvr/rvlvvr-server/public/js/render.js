var MAX_LIMIT = 30;

var $ = require('jquery');
var moment = require('moment');

var feed = $('#feed');
var body = $('body');

var updateInterval = null;

var truncateMessages = function(elements) {
  if (elements.length > MAX_LIMIT) {
    elements.slice(MAX_LIMIT, elements.length).remove();
  };
};

exports.render = function (data) {
  if (feed.find('li[data-created="' + data.created + '"]').length === 0) {
    var isPublic = data.public ? 'public' : 'private';
    var li = $('<li data-created="' + data.created + '" class="' + isPublic + '"><div class="avatars"></div></li>');
    var senderAvatar = $('<div><img src="' + data.senderAvatar + '"></img></div>');
    var senderLabel = $('<span class="label">' + data.sender + '</span>');

    var div = $('<div class="para"></div>');

    if (!data.public) {
      var pre = $('<pre></pre>');
      pre.text(data.text);
      div.append(pre);

      var small = $('<img class="lock" src="/images/lock.svg">');
      senderAvatar.append(small);
    } else {
      div.html(decodeURIComponent(escape(data.html)));
    }

    li.find('.avatars').append(senderAvatar.append(senderLabel));

    var timeEl = $('<time></time>');
    timeEl.text(moment.unix(data.created).fromNow());
    li.append(timeEl);

    if (data.sender !== data.receiver && body.hasClass('feed')) {
      var recipient = $('<div class="recipient"></div>');
      var receiverAvatar = $('<img src="' + data.receiverAvatar + '"></img>');
      var receiverLabel = $('<span class="label">' + data.receiver + '</span>');
      li.find('.avatars').append(recipient.append(receiverAvatar).append(receiverLabel));
    } else {
      li.addClass('broadcast');
    }

    li.append(div);
    feed.prepend(li);

    truncateMessages(feed.find('li'))
  }

  if (!updateInterval) {
    var updateTime = function (li) {
      var originalTimeEl = li.find('time')[0];
      originalTimeEl.remove();
      var dataCreated = li.attr('data-created');
      var timeEl = $('<time></time>');
      timeEl.text(moment.unix(dataCreated).fromNow());
      li.append(timeEl);
    };

    updateInterval = setInterval(function() {
      feed.find('li').each(function(i) {
        updateTime($(this));
      });
    }, 60000);
  }
};
