var socket = io.connect(hostname, {
  'sync disconnect on unload' : true,
  'reconnect' : false
});

// Storage for the ID of the interval used to blink the title
// when there is a message waiting for the user.
var intervalID = undefined;
var windowFocused = true;
 
// Array of chat objects
var chats = new Array();

// Mapping of server_channel -> length of the longest nick amongst users in the channel.
// Used to space nicks and messages evenly.
var longestNickInChannel = {};
 
// Maps the name of a given server to the user's nick on that server.
var usernicks = {};

// Message status icons for no message, low and high priority message statuses.
const NO_MSG_ICON = '/images/icons/graydot.png';
const LP_MSG_ICON = '/images/icons/greendot.png';
const HP_MSG_ICON = '/images/icons/reddot.png';

// Constant identifiers for different types of channel notifications.
const CN_JOIN = 'joined';
const CN_PART = 'departed';
const CN_NICK = 'changedNick';
const CN_ACTN = 'action';
const CN_MODE = 'setMode';
const CN_WHOI = 'whois';
const CN_TOPC = 'chanTopic';
const CN_CTCP = 'ctcp';

// Messages longer than 447 characters get truncated; break messages into 400-character parts.
const MSG_SIZE_LIM = 400;

// String.format method from `fearphage` on stackoverflow:
// https://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
if (!String.prototype.format) {
  String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

String.prototype.replaceAll = function (sub, newstr) {
  var index = this.indexOf(sub);
  var tmp = this;
  while (index >= 0) {
    tmp = tmp.replace(sub, newstr);
    index = tmp.indexOf(sub);
  }
  return tmp;
};

var longestNick = function (nicks) {
  var max = 0;
  for (var i = 0, len = nicks.length; i < len; i++) {
    if (nicks[i].length > max) {
      max = nicks[i].length;
    }
  }
  return max;
};

var secondsSinceEpoch = function () {
  return Math.round((new Date()).getTime() / 1000.0);
};

var formattedMessageTime = function () {
  var date = new Date();
  var hours = date.getHours() + '';
  var mins = date.getMinutes() + '';
  if (mins.length === 1) {
    mins = '0' + mins;
  }
  if (hours.length === 1) {
    hours = '0' + hours;
  }
  return hours + ':' + mins;
};

// Protect the user from themselves.
var sanitize = function (string) {
  return string.replaceAll('"', '&#34;').replaceAll("'", '&#39;')
               .replaceAll('>', '&gt;').replaceAll('<', '&lt;')
               .replaceAll('/', '&#47;').replaceAll('\\', '&#92;');
};


var chatElement = function (type, server, channel) {
  var $elems = $(type + '[data-server="' + server + '"]');
  for (var i = 0, len = $elems.length; i < len; i++) {
    var $elem = $($elems[i]);
    var e_channel = $elem.data('channel');
    if (channel != undefined && e_channel.toLowerCase() === channel.toLowerCase()) {
      return $elem;
    }
  }
  return undefined;
};

var setActiveTab = function (server, channel) {
  $('div.active').first().attr('class', 'content');
  chatElement('dd', server, channel).attr('class', 'active');
  chatElement('div', server, channel).attr('class', 'content active');
};

// Array remove - By John Resig
Array.prototype.remove = function (start, end) {
  var tail = this.slice((end || start) + 1 || this.length);
  this.length = start < 0 ? this.length + start : start;
  return this.push.apply(this, tail);
};

const COMMAND_HELP = '' +
  'Any commands not in this list must be sent using the format specified by the IRC standard.<br />' +
  'part - Leave the currently selected channel.<br />' +
  'join &lt;channel&gt; - Join "channel" on the server hosting the currently selected channel.<br />' +
  'connect &lt;server&gt; &lt;channel1,channel2,...&gt; - Connect to the specified channels on "server".<br />' +
  'msg/privmsg &lt;nick&gt; &lt;msg&gt; - Send "msg" to "nick" on the server hosting the currently selected channel.<br />' +
  'nick &lt;newnick&gt; - Sets your nick on the server hosting the currently selected channel to "newnick".<br />' +
  'me/action &lt;action&gt; - Send an ACTION event that will appear as &lt;your nick&gt; &lt;action&gt;.<br />' +
  'clear - Clear all the messages from the selected channel.<br />' +
  'ignore &lt;nick&gt; - Ignore messages from a person with a given nick.<br />' +
  'unignore &lt;nick&gt; - Unignore a person with a given nick.<br />' +
  'help - Display this help message.';

// Map command names to a pair (Array) of the minimum expected number of arguments and
// the handler function to be called to process the command.
// Handler functions should be defined (in the form `function cmd_(...) {...}`) at the
// end of the file.
const COMMANDS = {
  'part'     : [0, cmdPart],
  'join'     : [1, cmdJoin],
  'connect'  : [2, cmdConnect],
  'msg'      : [2, cmdPrivmsg],
  'privmsg'  : [2, cmdPrivmsg],
  'nick'     : [1, cmdNick],
  'me'       : [1, cmdAction],
  'action'   : [1, cmdAction],
  'clear'    : [0, cmdClear],
  'ignore'   : [1, cmdIgnore],
  'unignore' : [1, cmdUnignore],
  'help'     : [0, cmdHelp]
};

var handleCommand = function (cmdstr) {
  var activeServer = $('dd.active').first().data('server');
  var activeChannel = $('dd.active').first().data('channel');
  var parts = cmdstr.split(' ');
  var cmdSpec = COMMANDS[parts[0].toLowerCase()];
  if (typeof cmdSpec === 'undefined') {
    socket.emit('rawCommand', {
      command : cmdstr,
      server  : activeServer
    });
  } else {
    if (parts.length - 1 >= cmdSpec[0]) {
      cmdSpec[1](activeServer, activeChannel, parts.slice(1));
    } else {
      Notifier.error(
        'Not enough arguments supplied to ' + parts[0] + ' command. '+
        'Use /help to learn more about the builtin commands.',
        'Missing Arguments'
      );
    }
  }
};

// Return the input string with urls wrapped in anchor tags
// and images in a clearing lightbox at the end for inline viewing
var htmlify = function (string) {
  var isURL = /^https?:\/\/(www\.)?\S+$/;
  var isImg = /^https?:\/\/(www\.)?\S+\/\S+\.(jpg|jpeg|gif|png|bmp)$/;
  var tokens = string.split(' ');
  var images = [];
  var html = '';
  // Need a function to convert the sanitized input into its original desanitized form
  // so that the regexes above will match both the user's input and incoming content.
  var desanitize = function (string) {
    return string.replaceAll('&#34;', '"').replaceAll('&#39;', "'")
                 .replaceAll('&gt;', '>').replaceAll('&lt;', '<')
                 .replaceAll('&#47;', '/').replaceAll('&#92;', '\\');
  };

  for (var i = 0, len = tokens.length; i < len; i++) {
    var token = desanitize(tokens[i]);
    if (isURL.test(token)) {
      if (isImg.test(token)) {
        images.push(tokens[i]);
      }
      html += '<a href="' + tokens[i] + '" target="_blank">' + tokens[i] + '</a> ';
    } else {
      html += tokens[i] + ' ';
    }
  }
  if (images.length > 0) {
    html += '<br /><br /><ul class="inline-list">';
    for (var i = 0, len = images.length; i < len; i++) {
      html += '<li><a target="_blank" href="' + images[i] + '">' +
              '<img class="thumbnail" src="' + images[i] + '" /></a></li>';
    }
    html += '</ul>';
  }
  return html;
};

var addMessage = function (data) {
  var $msgDiv = chatElement('div', data.server, data.channel);
  var $tab = chatElement('dd', data.server, data.channel).find('a').first();
  var chat = chats[chatIndex(chats, data.server, data.channel)];
  var time = formattedMessageTime(); // From users.js

  var highlight = '';
  if (data.from === usernicks[data.server]) {
    highlight = ' self'; // Space needed to separate class names
  } else if (data.message.indexOf(usernicks[data.server]) != -1) {
    highlight = ' mention';
  }

  var color = chat.colorForNick(data.from);

  var spaces = '&nbsp;';
  var maxSpaces = longestNickInChannel[data.server + data.channel];
  for (var i = maxSpaces - data.from.length - 1; i >= 0; i--) {
    spaces += '&nbsp;';
  }
  var $newMsg = $(
    '<div class="message">' +
    '  <div class="messageContent' + highlight + '">' +
    '    <span class="nick-' + color + ' bold">' + spaces + data.from + '</span>' +
    '    <span class="right timestamp">' + time + '</span>' +
    '    <span>' + htmlify(data.message) + '</span>' +
    '  </div>' +
    '</div>'
  );
  var st1 = $msgDiv.scrollTop();
  var scrollDist = $msgDiv[0].scrollHeight - $msgDiv[0].offsetHeight - $msgDiv[0].scrollTop;
  $msgDiv.append($newMsg); // Display the new message
  if (scrollDist >= 25) {
    $msgDiv.scrollTop(st1);
  } else {
    $msgDiv.scrollTop($msgDiv[0].scrollHeight);
  }
};

var setStatusIcon = function (server, channel, type) {
  var icon = NO_MSG_ICON;
  if (type === 'high') {
    icon = HP_MSG_ICON;
  } else if (type === 'low') {
    icon = LP_MSG_ICON;
  }
  var ce = $('dd[data-server="' + server + '"][data-channel="' + channel + '"] img').first();
  // Only update the orb color if we are either clearing the notification or the
  // incoming message priority is higher than that which the current status represents.
  if (icon === NO_MSG_ICON || ce.attr('src') !== HP_MSG_ICON) {
    ce.attr('src', icon);
  }
};

var clearNotifications = function (evt) {
  var server = $(evt.currentTarget).data('server');
  var channel = $(evt.currentTarget).data('channel');
  setStatusIcon(server, channel, 'none');
  chatElement('dd', server, channel).find('img').first().attr('src', NO_MSG_ICON);
};

// Add a new tab to the list of chat tabs and a content div to contain
// the nick list and messages.
var addChatSection = function (server, chanOrNick) {
  var $newTab = $(
    '<dd data-server="' + server + '" data-channel="' + chanOrNick + '">' +
    '  <a href="#panel_' + label(server, chanOrNick) + '">' +
    '    <img class="statusIcon" src="' + NO_MSG_ICON + '" />' +
    '    <span>'+ chanOrNick + '</span>' +
    '  </a>' +
    '</dd>'
  );
  $('dl#chatList').append($newTab);
  $newTab.click(clearNotifications);
  $('div#chatContent').append($(
    '<div class="content" id="panel_' + label(server, chanOrNick) + '" ' +
         'data-server="' + server + '" data-channel="' + chanOrNick + '">' +
    '</div>'
  ));
  // Set the height for this and any other chat content areas to fit nicely.
  $('div.content').height(($(window).height() - 130) + 'px');
};

var joinChat = function (server, channel) {
  var chat = chats[chatIndex(chats, server, channel)];
  if (typeof chat === 'undefined') {
    chat = new Chat(server, channel);
    chats.push(chat);
    addChatSection(server, channel);
  }
  return chat;
};

var titleBlinker = function (origTitle, altTitle) {
  return (function () {
    document.title = altTitle;
    setTimeout(function () {
      document.title = origTitle;
    }, 500);
  });
};

// Display a message about some occurrence in the channel.
// the newdata field is only required for events involving some data changing.
// This could be a user's nick being changed, or something else.
var channelNotification = function (type, server, channel, data, newdata) {
  var message;
  if (type === CN_JOIN) {
    message = data.nick + ' has joined ' + channel + '.';
  } else if (type === CN_PART) {
    message = data.nick + ' has parted from ' + channel + '. ';
    if (typeof data.reason !== 'undefined') {
      message += 'Reason: ' + data.reason;
    }
  } else if (type === CN_NICK) {
    message = data.old + ' has changed their nick to ' + data.new + '.';
  } else if (type === CN_ACTN) {
    message = 'Action: ' + data.nick + ' ' + data.action;
  } else if (type === CN_MODE) {
    if (typeof data.arg === 'undefined') {
      message = data.nick + ' set ' + data.mode + ' in ' + channel + '.';
    } else {
      message = data.nick + ' set ' + data.mode + ' on ' + data.arg + ' in ' + channel + '.';
    }
  } else if (type === CN_WHOI) {
    message = 'Whois info: ' + data.info;
  } else if (type === CN_TOPC) {
    message = 'Topic for ' + channel + ': ' + data.topic;
  } else if (type === CN_CTCP) {
    message = 'CTCP info: ' + data.info;
  } else {
    message = 'Unknown notification type: ' + type;
  }
  addMessage({
    from    : 'System',
    server  : server,
    channel : channel,
    message : message
  });
};

var notifyConnectionLost = function () {
  var msg = 'The connection to the aIRChat server was lost. Refresh the page to reconnect. ' +
            'You will be automatically reconnected to the channels you were in.';
  Notifier.warning('The connection to the server was lost.', 'Connection Lost');
  var $tabs = $('dl#chatList dd');
  for (var i = $tabs.length - 1; i >= 0; i--) {
    var $tab = $($tabs[i]);
    addMessage({
      from    : 'System',
      server  : $tab.data('server'),
      channel : $tab.data('channel'),
      message : msg
    });
  }
};

socket.on('connect', function () {
  Notifier.success(
    'You have successfully connected to your aIRChat server.',
    'Connection Successful'
  );
});

socket.on('disconnect', function () {
  notifyConnectionLost();
});

socket.on('authReq', function (data) {
  var key = stash.get('ACKey');
  if (typeof key === 'undefined') {
    socket.emit('createSession');
  } else {
    socket.emit('authenticate', {key: key});
  }
});

socket.on('badAuth', function () {
  Notifier.warning(
    'Did not find a valid session key. Creating a new one.',
    'Missing Session Key'
  );
  socket.emit('createSession');
});

socket.on('newID', function (data) {
  stash.set('ACKey', data.key);
});

socket.on('action', function (data) {
  var actData = {nick: data.nick, action: data.message};
  channelNotification(CN_ACTN, data.server, data.channel, actData);
});

socket.on('topic', function (data) {
  channelNotification(CN_TOPC, data.server, data.channel, {topic: data.topic});
});

socket.on('ctcp', function (data) {
  channelNotification(CN_CTCP, data.server, data.channel, {info: data.info});
});

socket.on('setMode', function (data) {
  channelNotification(CN_MODE, data.server, data.channel, {arg: data.on, nick: data.by, mode: data.mode});
});

socket.on('gotWhois', function (data) {
  if (chatIndex(chats, data.server, data.channel) === -1) {
    joinChat(data.server, data.channel);
  }
  channelNotification(CN_WHOI, data.server, data.channel, {info: data.info});
});

socket.on('serverNotification', function (data) {
  var fn;
  if (data.type === 'error') {
    fn = Notifier.error;
  } else if (data.type === 'info') {
    fn = Notifier.info;
  } else if (data.type === 'warning') {
    fn = Notifier.warning;
  } else if (data.type === 'success') {
    fn = Notifier.success;
  } else {
    fn = Notifier.info;
  }
  fn(data.message, 'Server Notification');
});

function gotMessage(data) {
  if (isIgnored(data.server, data.from)) {
    return;
  }
  var $activeDiv = $('div.active').first();
  var chat = chats[chatIndex(chats, data.server, data.channel)];
  if (typeof chat === 'undefined') {
    // Got a PM from another user
    chat = joinChat(data.server, data.from);
    chat.users = [usernicks[data.server], data.from, 'System'];
  }
  if ( $activeDiv.data('server') !== data.server
    || $activeDiv.data('channel') !== data.channel ) {
    if (data.message.indexOf(usernicks[data.server]) !== -1) {
      data.priority = 'high';
    }
    setStatusIcon(data.server, data.channel, data.priority);
  }
  if (!windowFocused && typeof intervalID === 'undefined') {
    var newTitle = ((data.priority === 'low') ? '[*]' : '[!]') + ' aIRChat';
    intervalID = setInterval(titleBlinker('aIRChat', newTitle), 1000);
  }
  addMessage(data);
}

socket.on('gotMessage', gotMessage);

socket.on('backlog', function (messages) {
  for (var i = 0; i < messages.length; i++) {
    gotMessage(messages[i]);
  }
});

socket.on('serverConnected', function (data) {
  usernicks[data.server] = data.nick;
  Notifier.info(
    'You have been connected to ' + data.server + '.',
    'Connection Successful'
  );
});

// Create a listing of nicks for the appropriate channel.
// The list will not be rendered until the channel is the active one.
socket.on('nickList', function (data) {
  var chat = chats[chatIndex(chats, data.server, data.channel)];
  if (typeof chat === 'undefined') {
    chat = joinChat(data.server, data.channel);
  }
  longestNickInChannel[data.server + data.channel] = longestNick(data.nicks);
  for (var i = 0, len = data.nicks.length; i < len; i++) {
    chat.addUser(data.nicks[i]);
  }
  chat.addUser('System');
});

// Add a new nick to the list of nicks for the provided channel. 
// Create a new chat tab if the aIRChat user is the one joining.
socket.on('joined', function (data) {
  if (data.nick === usernicks[data.server] ) {
    joinChat(data.server, data.channel);
    Notifier.info('Joined ' + data.channel + '.', 'Joined Channel');
    if ($('dd.active').length === 0) { // No active chats
      setActiveTab(data.server, data.channel);
    }
  } else {
    var chat = chats[chatIndex(chats, data.server, data.channel)];
    chat.addUser(data.nick);
    channelNotification(CN_JOIN, data.server, data.channel, {nick: data.nick});
  }
  if (data.nick.length > longestNickInChannel[data.server + data.channel]) {
    longestNickInChannel[data.server + data.channel] = data.nick.length;
  }
});

// Display a message telling the user they were kicked from the channel.
// Also deactivate the send mechanism for this channel.
socket.on('kicked', function (data) {
  if (data.nick === usernicks[data.server]) {
    addMessage({
      from    : 'System',
      server  : data.server,
      channel : data.channel,
      message : 'You were kicked by ' + data.by + '. Reason provided: ' + data.reason
    });
  } else {
    addMessage({
      from    : 'System',
      server  : data.server,
      channel : data.channel,
      message : data.nick + ' was kicked by ' + data.by + ', reason: ' + data.reason
    });
    var chat = chats[chatIndex(chats, data.server, data.channel)];
    chat.removeUser(data.nick);
    longestNickInChannel[data.server + data.channel] = longestNick(chat.users);
  }
});

socket.on('newNick', function (data) {
  if (data.new.length > longestNickInChannel[data.server + data.channel]) {
    longestNickInChannel[data.server + data.channel] = data.new.length;
  }
  var chat = chats[chatIndex(chats, data.server, data.channel)];
  if (data.old === usernicks[data.server]) {
    usernicks[data.server] = data.new;
  } else {
    chat.removeUser(data.old);
    chat.addUser(data.new);
  }
  // Rename the tab of an affected private chat
  if (chatElement('dd', data.server, data.old) /* exists */) {
    var label = $(
      'dd[data-server="' + data.server + '"][data-channel="' + data.old + '"] a span'
    ).last();
    var newLabel = label.text().replace(data.old, data.new);
    channelNotification(CN_NICK, data.server, data.old, {old: data.old, new: data.new});
    label.text(newLabel);
    var pchat = chats[chatIndex(chats, data.server, data.old)];
    pchat.channel = data.new;
    chatElement('dd', data.server, data.old).data('channel', data.new);
    chatElement('div', data.server, data.old).data('channel', data.new);
  }
  channelNotification(CN_NICK, data.server, data.channel, {old: data.old, new: data.new});
});

socket.on('invited', function (data) {
  var msg = 'You have been invited to the channel ' + data.to;
  msg += ' on ' + data.server + ' by ' + data.by + '\n';
  msg += 'Would you like to join this channel now?';
  if (confirm(msg)) {
    socket.emit('joinChannel', {server: data.server, channel: data.to});
  }
});

socket.on('userLeft', function (data) {
  var chat = chats[chatIndex(chats, data.server, data.from)];
  if (typeof chat === 'undefined') {
    return;
  }
  chat.removeUser(data.nick);
  channelNotification(CN_PART, data.server, data.from, {nick: data.nick, reason: data.reason});
  longestNickInChannel[data.server + data.channel] = longestNick(chat.users);
});

$('#messageInput').focus(function () {
  var server = $('div.active').first().data('server');
  var channel = $('div.active').first().data('channel');
  if (typeof server !== 'undefined' && typeof channel !== 'undefined') {
    var chat = chats[chatIndex(chats, server, channel)];
    $('#messageInput').tabcomplete(chat.users, {hint: 'select'});
  }
});

$('#messageInput').keypress(function (evt) {
  var server = $('div.active').first().data('server');
  var dest = $('div.active').first().data('channel');
  if (evt.which === 13) { // On [Enter]
    if ($('div.tabs-content').length === 0 || !server) {
      Notifier.warning(
        'You cannot send a message until you join and select a chat.',
        'Missing Selection'
      );
      return;
    }
    var $ta = $('#messageInput');
    if ($ta.val().length === 0) {
      return;
    }
    if ($ta.val()[0] === '/') {
      var command = $ta.val().slice(1);
      handleCommand(command);
    } else {
      addMessage({
        server  : server,
        channel : dest, 
        from    : usernicks[server], 
        message : sanitize($ta.val())
      });
      for (var bytesSent = 0; bytesSent < $ta.val().length; bytesSent += MSG_SIZE_LIM) {
        socket.emit('writeChat', {
          server      : server, 
          destination : dest, 
          message     : $ta.val().slice(bytesSent, bytesSent + MSG_SIZE_LIM)
        });
      }
    }
    $ta.val('');
  }
});

// TODO
// Make sure the channel name is valid
$('a#joinNewChannel').click(function (evt) {
  var server = $('div.active').data('server');
  var chanName = $('#newChannelName').val();
  if (typeof server === 'undefined') {
    Notifier.warning(
      'You must select a chat tab for a channel belonging to the ' +
      'same server the channel you wish to join is in.',
      'Missing Selection'
    );
  } else if (chanName === '') {
    Notifier.warning(
      'You must provide a channel name (eg: #aIRChat) to join.',
      'Missing Input'
    );
  } else if (chanName[0] !== '#') {
    // This is a less-than-perfect quick check that will catch the most obvious mistake
    // a user might make by writing 'aIRChat' instead of '#aIRChat', but could be better.
    Notifier.warning(
      chanName + ' is not a valid channel name. Did you mean #' + chanName + '?',
      'Invalid Input'
    );
  } else {
    socket.emit('joinChannel', {
      server  : server, 
      channel : chanName
    });
  }
});

$('a#connectToNewServer').click(function (evt) {
  var serverName = $('#newServerAddr').val();
  var firstChannel = $('#newServerChannel').val();
  var username = $('#serverNick').val();
  var portNumber = parseInt($('#portNum').val());
  var nickservPassword = $('#nickPass').val();
  var shouldUseSSL = $('#useSSL')[0].checked;
  if ( serverName === '' 
    || firstChannel === '' 
    || username === ''
    || isNaN(portNumber) ) {
    Notifier.warning(
      'You must specify both the server address and a channel to join to ' +
      'connect to a new server.',
      'Missing Input'
    );
  } else {
    socket.emit('serverJoin', {
      server   : serverName,
      nick     : username,
      channels : [firstChannel],
      portNum  : portNumber,
      password : nickservPassword,
      useSSL   : shouldUseSSL
    });
    // Wait until the channel is joined before we add it to faves.
    //addFavoriteConnection(serverName, [], username, portNumber, nickservPassword, shouldUseSSL);
    Notifier.info(
      'Submitted request to connect to ' + serverName + '. You should connect shortly.',
      'Request Submitted'
    );
  }
});

$('a#showNickList').click(function (evt) {
  var channel = $('div.active').first().data('channel');
  var server = $('div.active').first().data('server');
  if (typeof channel === 'undefined' || typeof server === 'undefined') {
    Notifier.warning(
      'No channel was selected to get the list of users for.',
      'Missing Selection'
    );
    return;
  }
  var chat = chats[chatIndex(chats, server, channel)];
  var users = chat.users.sort().join(', ');
  addMessage({
    server  : server,
    channel : channel,
    from    : 'System',
    message : 'Users in ' + channel + ' on ' + server + ' : ' + users
  });
});

$('a#sendPrivMsg').click(function (evt) {
  var msg = $('#privMsgContents').val();
  var nick = $('#privMsgNick').val();
  var server = $('div.active').first().data('server');
  if (chatElement('div', server, nick) /* exists */) {
    Notifier.warning(
      'You already have a private chat open with this user.',
      'Chat Already Exists'
    );
  } else if (msg === '' || nick === '') {
    Notifier.warning(
      'You must specify the nick of the user to send your message to ' +
      'as well as a message to send.',
      'Missing Input'
    );
  } else if (typeof server === 'undefined') {
    Notifier.warning(
      'You must select a chat tab for a channel on the server that the user ' +
      'you wish to send your message to is on.',
      'Missing Selection'
    );
  } else {
    var chat = joinChat(server, nick);
    chat.users = [usernicks[server], nick, 'System'];
    addMessage({
      server  : server, 
      channel : nick, 
      from    : usernicks[server], 
      message : msg
    });
    socket.emit('writeChat', {
      server      : server, 
      destination : nick, 
      message     : msg
    });
  }
});

$('a[data-reveal-id=newChannel]').click(function (evt) {
  var server = $('div.active').first().data('server');
  if (typeof server !== 'undefined') {
    $('#newChanServText').text('Join a channel on ' + server);
  }
});

$('a[data-reveal-id=partChannel]').click(function (evt) {
  var channel = $('div.active').first().data('channel');
  var $modalTextSection = $('div#partChannel div.row div.columns p');
  if (typeof channel === 'undefined') {
    $modalTextSection.text('No channel was selected to part from.');
  } else {
    $modalTextSection.text('Are you sure you want to leave ' + channel + '?');
  }
});

$('a#confirmPartChannel').click(function (evt) {
  var channel = $('div.active').first().data('channel');
  var server = $('div.active').first().data('server');
  if (typeof channel === 'undefined' || typeof server === 'undefined') {
    Notifier.warning(
      'You have not selected a channel to leave.',
      'Missing Selection'
    );
    return;
  }
  var index = chatIndex(chats, server, channel);
  chats.remove(index);
  $('dd.active').first().remove();
  $('div.active').first().remove();
  if (channel[0] === '#') { // Channel, not a private chat
    socket.emit('part', {
      server  : server, 
      channel : channel, 
      message : 'aIRChat client parted.'
    });
  }
  if (chats.length > 0) {
    var newIndex = (index === chats.length) ? (index - 1) : index;
    var chat = chats[newIndex];
    setActiveTab(chat.server, chat.channel);
  }
});

$('a#changeNickConfirm').click(function (evt) {
  var newNick = $('input#newNickInput').val();
  var server = $('dd.active').first().data('server');
  if (newNick.length === 0) {
    Notifier.error('You have not provided a new nick.', 'Missing Field');
  } else if (typeof server === 'undefined') {
    Notifier.warning(
      'To change your nick on a server, you must first select ' +
      'a chat tab for a channel on that server.',
      'Missing Selection'
    );
  } else {
    socket.emit('changeNick', {
      server : server,
      nick   : newNick
    });
  }
});

$('a#showAdvancedOpts').click(function (evt) {
  $('div#advancedServerOpts').slideToggle('fast');
});

/* Store a new favorite network.
 * server, channels, and nick are required.
 * If not provided, port, password, and ssl default to 6667, null, and false respectively.
 */
function addFavoriteConnection(server, channels, nick, port, password, ssl) {
  if (typeof port === 'undefined' || isNaN(port)) {
    port = 6667;
  }
  if ( typeof password === 'undefined' 
    || typeof password.length === 'undefined'
    || password.length === 0 ) {
    password = null;
  }
  if (typeof ssl === 'undefined' || !ssl) {
    ssl = false;
  }
  var faves = stash.get('favorites');
  faves[server] = {
    channels   : channels,
    nick       : nick,
    portNum    : port,
    nickPass   : password,
    useSSL     : ssl,
    ignoreList : []
  };
  stash.set('favorites', faves);
};

function removeFavoriteConnection(server) {
  var faves = stash.get('favorites');
  delete faves[server];
  stash.set('favorites', faves);
};

$(window).on('resize', function (evt) {
  $('div.content').height(($(window).height() - 130) + 'px');
});

$(document).ready(function () {
  if (typeof stash.get('ACIgnoreList') === 'undefined') {
    stash.set('ACIgnoreList', {});
  }
});

$(window).focus(function (evt) {
  windowFocused = true;
  if (intervalID != undefined) {
    clearInterval(intervalID);
    intervalID = undefined;
  }
});

$(window).blur(function (evt) {
  windowFocused = false;
});

$(window).unload(function () {
  socket.disconnect();
});

function isIgnored(server, nick) {
  var ignored = stash.get('ACIgnoreList');
  return typeof ignored !== 'undefined'
      && typeof ignored[server] !== 'undefined'
      && ignored[server].indexOf(nick) >= 0;
}

function cmdPart(server, channel, args) {
  var message = 'aIRChat user parted.';
  if (args.length > 0) {
    message = args.join(' ');
  }
  socket.emit('part', {
    server  : server,
    channel : channel,
    message : message
  });
  $('dd.active').first().remove();
  $('div.active').first().remove();
  var oldIndex = chatIndex(chats, server, channel);
  chats.remove(oldIndex);
  var faveChans = getFavoriteChannels(server);
  faveChans.remove(faveChans.indexOf(channel));
  if (chats.length > 0) {
    var newIndex = (oldIndex === chats.length) ? (oldIndex - 1) : oldIndex;
    var chat = chats[newIndex];
    setActiveTab(chat.server, chat.channel);
  }
}

function cmdJoin(server, channel, args) {
  socket.emit('joinChannel', {
    server  : server,
    channel : args[0]
  });
}

function cmdConnect(server, channel, args) {
  socket.emit('serverJoin', {
    channels : args[1].split(','),
    server   : args[0],
    nick     : usernicks[server]
  });
}

function cmdPrivmsg(server, channel, args) {
  var message = args.slice(1).join(' ');
  socket.emit('writeChat', {
    destination : args[0],
    server      : server,
    message     : message
  });
  var chat = joinChat(server, args[0]);
  chat.users = [usernicks[server], args[0], 'System'];
  addMessage({
    server  : server,
    channel : args[0],
    from    : usernicks[server],
    message : message
  });
}

function cmdNick(server, channel, args) {
  socket.emit('changeNick', {
    server : server,
    nick   : args[0]
  });
}

function cmdAction(server, channel, args) {
  var message = args.join(' ');
  socket.emit('writeChat', {
    destination : channel,
    server      : server,
    message     : '\x01ACTION ' + message + '\x01'
  });
  var actData = {action: message, nick: usernicks[server]};
  channelNotification(CN_ACTN, server, channel, actData);
}

function cmdClear(server, channel, args) {
  chatElement('div', server, channel).find('.message').remove();
  var chat = chats[chatIndex(chats, server, channel)];
  longestNickInChannel[server + channel] = longestNick(chat.users);
}

function cmdIgnore(server, channel, args) {
  var nick = args[0];
  var ignored = stash.get('ACIgnoreList');
  if (typeof ignored === 'undefined') {
    ignored = {};
  } 
  if (typeof ignored[server] === 'undefined') {
    ignored[server] = new Array();
  }
  ignored[server].push(nick);
  stash.set('ACIgnoreList', ignored);
}

function cmdUnignore(server, channel, args) {
  var nick = args[0];
  var ignored = stash.get('ACIgnoreList');
  if ( typeof ignored         === 'undefined'
    || typeof ignored[server] === 'undefined'
    || ignored[server].indexOf(nick) === -1 ) {
    return;
  }
  var index = ignored[server].indexOf(nick);
  ignored[server].remove(index);
  stash.set('ACIgnoreList', ignored);
}

function cmdHelp(server, channel, args) {
  addMessage({
    server  : server,
    channel : channel,
    from    : 'System',
    message : COMMAND_HELP
  });
}

