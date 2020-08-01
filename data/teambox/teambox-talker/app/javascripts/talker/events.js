Talker.sentCount = 0;

// Event management functions
Talker.sendMessage = function(message) {
  var talkerEvent = {
    id: 'pending',
    type: 'message',
    user: Talker.currentUser,
    time: parseInt(new Date().getTime() / 1000),
    paste: false
  };
  
  if (typeof message == 'string'){
    talkerEvent.content = message;
  } else {
    $.extend(true, talkerEvent, message);
  }
  
  Talker.client.send(talkerEvent);
  Talker.trigger('MessageReceived', talkerEvent);
};

Talker.sendAction = function(message, options) {
  Talker.sendMessage($.extend({content: message, action: true}, options));
};

Talker.insertMessage = function(talkerEvent, content) {
  if (content) {
    talkerEvent.content = content;
  }
  
  var lastInsertion = Talker.lastInsertionEvent;
  var blockquote = Talker.getLastRow().find('blockquote');

  if (lastInsertion && lastInsertion.user.name == talkerEvent.user.name &&
                       lastInsertion.type == 'message' &&
                       !talkerEvent.private &&
                       !lastInsertion.private &&
                       blockquote[0]) {
    
    blockquote = blockquote.append(eventToLine(talkerEvent));
    
  } else {
    var escapedName = h(talkerEvent.user.name);
    $('<tr author="' + escapedName + '" class="message event user_' + talkerEvent.user.id 
        + (talkerEvent.user.id == Talker.currentUser.id ? ' me' : ' ')
        + (talkerEvent.private ? ' private' : '')
        + '">'
        + '<td class="author" title="' + escapedName + '">'
        +   truncate(escapedName, 8)
        +   ' <img src="' + avatarUrl(talkerEvent.user) + '" alt="' + escapedName + '" class="avatar" />'
        +   '<b class="blockquote_tail"><!-- display fix --></b>'
        + '</td>'
        + '<td class="message">'
        +   '<blockquote>' + eventToLine(talkerEvent) + '</blockquote>'
        + '</td>'
      + '</tr>').appendTo('#log');
  }

  Talker.lastInsertionEvent = talkerEvent;

  Talker.trigger('MessageInsertion', talkerEvent);
}

Talker.insertNotice = function(talkerEvent, content) {
  if (content) talkerEvent.content = content;
  
  // We accept no HTML in notices
  talkerEvent.content = h(talkerEvent.content);

  $('<tr author="' + h(talkerEvent.user.name) + '" class="notice event user_' + talkerEvent.user.id + '">'
    + '<td class="author"></td>'
    + '<td class="message">' + eventToLine(talkerEvent) + '</td></tr>')
    .appendTo('#log');
  
  Talker.lastInsertionEvent = talkerEvent;

  Talker.trigger('NoticeInsertion', talkerEvent);
}

function eventToLine(talkerEvent) {
  if (talkerEvent.id == 'pending'){
    return  '<div id="event_pending_' + (Talker.sentCount++) + '" class="line" pending="true" time="' + talkerEvent.time + '">' 
          +   (Talker.isPaste(talkerEvent) ? '<img src="/images/loader.gif" height="11" width="16" alt="loading..." />' : talkerEvent.content)
          + '</div>';
  } else {
    return '<div id="event_' + talkerEvent.id + '" class="line" time="' + talkerEvent.time + '">' + talkerEvent.content + '</div>';
  }
}
