/* These are models for all the stuff we're keeping track of
   Ideally no UI will be in here */

// If the last update was a chat from a person, and another chat comes
// in in this amount of time, we combine the two into one message:
var CHAT_COMBINE_CUTOFF = 60*1000; // 1 minute
// If a page lasts less than this amount of time, we don't bother
// showing it:
var PAGE_CUTOFF_TIME = 5000; // 5 seconds

var peers = {};
var activities = [];

function makeId(name) {
  name = name || "obj";
  makeId.counter++;
  return name + makeId.counter;
}
makeId.counter = 0;

var pendingInvites = 0;
var INVITE_EXPIRE_TIME = 5*60*1000;
function addPendingInvites(n) {
  var origPendingInvites = pendingInvites;
  pendingInvites += n;
  if (pendingInvites < 0) {
    pendingInvites = 0;
  }
  if (origPendingInvites && ! pendingInvites) {
    UI.notifyAllUsersHere();
    addon.port.emit("allUsersHere");
  }
  if (n > 0) {
    clearTimeout(addPendingInvites.timeoutId);
    addPendingInvites.timeoutId = setTimeout(function () {
      pendingInvites = 0;
      renderUsers();
    }, INVITE_EXPIRE_TIME);
  }
  renderUsers();
}

function getPeer(id) {
  assert(id, "Bad id for getPeer:", id);
  if (! peers[id]) {
    peers[id] = Peer(id);
  }
  return peers[id];
}

function allPeers() {
  var result = [];
  for (var id in peers) {
    if (! getPeer(id).gone) {
      result.push(getPeer(id));
    }
  }
  return result;
}

var Peer = Class(mixinEvents({
  constructor: function (id) {
    this.id = id;
    this.avatar = null;
    this.name = null;
    this.color = null;
    this.isSelf = this.id == clientId;
    this.tabs = {};
    this.pagesByUrl = {};
    this.viewingPagesByTab = {};
    this.lastMessage = Date.now();
    setTimeout(function () {
      renderUsers();
      renderBar();
    });
  },

  update: function (msg) {
    this.avatar = msg.avatar || this.avatar;
    this.name = msg.name || this.name;
    this.color = msg.color || this.color;
    renderUsers();
    renderBar();
    renderActivity();
  },

  setGone: function (gone) {
    var changed = ((! this.gone) && gone) || (this.gone && ! gone);
    this.gone = gone;
    if (changed) {
      if (gone) {
        activities.push(LeaveActivity(this));
      }
      renderUsers();
    }
  },

  getTab: function (tabId) {
    if (! this.tabs[tabId]) {
      this.tabs[tabId] = Tab(this, tabId);
    }
    return this.tabs[tabId];
  },

  allTabs: function () {
    var result = [];
    for (var id in this.tabs) {
      result.push(this.tabs[id]);
    }
    return result;
  },

  addPage: function (page) {
    var shortUrl = page.url.replace(/#.*/, "");
    if (this.pagesByUrl[shortUrl]) {
      this.pagesByUrl[shortUrl].duplicated = true;
    }
    this.pagesByUrl[shortUrl] = page;
    var viewingTabId = page.viewingTabId();
    if (viewingTabId) {
      this.viewingPagesByTab[viewingTabId] = page;
    }
  },

  setActiveTab: function (tabId) {
    for (var id in this.tabs) {
      if (id == tabId) {
        this.tabs[id].active = true;
      } else {
        this.tabs[id].active = false;
      }
    }
    renderActivity();
  },

  getActiveTab: function () {
    for (var id in this.tabs) {
      if (this.tabs[id].active) {
        return this.tabs[id];
      }
    }
    return null;
  }

}));

addon.port.on("peer", function (msg, joined) {
  var peer = getPeer(msg.clientId);
  peer.update(msg);
  if (joined) {
    activities.push(JoinActivity(peer));
    addPendingInvites(-1);
  }
  renderActivity();
});

var Tab = Class({

  constructor: function (peer, tabId) {
    this.peer = peer;
    this.id = tabId;
    this.live = true;
    // FIXME: not sure this is good to do as a bool on each item,
    // as opposed to an attribute on peer:
    this.active = false;
    this.history = [];
    this.currentTitle = null;
    this.currentUrl = null;
    this.time = Date.now();
    this.state = "normal";
  },

  current: function () {
    if (this.history.length) {
      return this.history[this.history.length-1];
    } else {
      var blank = Page("about:blank", "");
      blank.tab = this;
      return blank;
    }
  },

  setActive: function () {
    this.peer.setActiveTab(this.id);
  },

  addPage: function (page) {
    if (this.history.length && page.url == this.history[this.history.length-1].url) {
      // A re-add of an existing page
      return;
    }
    page.tab = this;
    page.tabIndex = this.history.length;
    this.history.push(page);
    this.currentTitle = page.title;
    this.currentUrl = page.url;
    this.time = Math.max(this.time, page.time);
    this.peer.addPage(page);
  },

  activityComponent: function () {
    return UI.PageVisit({
      name: this.peer.name,
      avatar: this.peer.avatar,
      active: this.active,
      state: this.state,
      page: this.current()
    });
  },

  updateTime: function (time) {
    this.time = Math.max(this.time, time);
  }
});

var resourceDataBase = location.href.replace(/\/[^\/]*\/[^\/]*$/, "");

var Page = Class({

  constructor: function (url, title, time) {
    // FIXME: wish we had a stable ID here
    this.id = makeId("page");
    this.url = url;
    this.title = title;
    this.tab = null;
    this.historyIndex = null;
    this.duplicated = false;
    this.time = time;
  },

  viewingTabId: function () {
    /* Returns the tabId this page is viewing, or null if it's not doing so */
    if (this.url.indexOf(resourceDataBase) !== 0) {
      return null;
    }
    var match = (/mirror\/blank.html\?tabId=([^&]*)/).exec(this.url.replace(/#.*/, ""));
    return match ? match[1] : null;
  },

  activityComponent: function () {
    var current = this.tab.current() == this;
    if (this.duplicated) {
      return null;
    }
    if (ignoreUrl(this.url)) {
      if (current && this.tab.active) {
        // Show an ignored URL if it's the thing the person is actually looking at
      } else {
        return null;
      }
    }
    if (! current) {
      var next = this.tab.history[this.tabIndex + 1];
      if (next.time - this.time < PAGE_CUTOFF_TIME) {
        return null;
      }
    }
    if ((! this.tab.live) && current && (this.tab.time - this.time < PAGE_CUTOFF_TIME)) {
      return null;
    }
    var participants = [];
    if (current) {
      allPeers().forEach(function (p) {
        if (p == this.tab.peer) {
          return;
        }
        var shortUrl = this.url.replace(/#.*/, "");
        var otherPage = p.pagesByUrl[shortUrl];
        if (otherPage && otherPage == otherPage.tab.current() && otherPage.tab.state != "dead") {
          participants.push(p);
        } else {
          otherPage = p.viewingPagesByTab[this.tab.id];
          if (otherPage && otherPage == otherPage.tab.current() && otherPage.tab.state != "dead") {
            participants.push(p);
          }
        }
      }, this);
      var thisViewing = this.viewingTabId();
      if (thisViewing) {
        allPeers().forEach(function (p) {
          if (p == this.tab.peer) {
            return;
          }
          if (p.tabs[thisViewing]) {
            participants.push(p);
          }
        }, this);
      }
    }
    return UI.PageVisit({
      name: this.tab.peer.name,
      avatar: this.tab.peer.avatar,
      active: this.tab.active && current,
      state: current ? this.tab.state : "dead",
      page: this,
      participants: participants
    });
  }
});

hub.on("pageshow", function (msg) {
  var page = Page(msg.tab.url, msg.tab.title, Date.now() - msg.tab.lastPageShowAgo);
  var tab = msg.peer.getTab(msg.tab.id);
  tab.addPage(page);
  if (msg.tab.active) {
    tab.setActive();
  }
  tab.state = msg.tab.state;
  renderActivity();
});

hub.on("titleupdate", function (msg) {
  var tab = msg.peer.getTab(msg.tab.id);
  tab.current().title = tab.currentTitle = msg.tab.title;
  renderActivity();
});

hub.on("stateChange", function (msg) {
  var tab = msg.peer.getTab(msg.tab.id);
  tab.state = msg.tab.state;
  renderActivity();
});

hub.on("tab-init", function (msg) {
  msg.tabs.forEach(function (t) {
    var page = Page(t.url, t.title, Date.now() - t.lastEventAgo);
    var tab = msg.peer.getTab(t.id);
    tab.addPage(page);
    if (t.active) {
      tab.setActive();
    }
  });
  renderActivity();
});

hub.on("activate", function (msg) {
  var tab = msg.peer.setActiveTab(msg.tab.id);
  // Update time? Does it matter?
  renderActivity();
});

hub.on("close", function (msg) {
  var tab = msg.peer.getTab(msg.tab.id);
  tab.live = false;
  tab.state = "dead";
  tab.time = msg.tab.closedAgo ? Date.now() - tab.closedAgo : Date.now();
  renderActivity();
});

var ChatMessage = Class({
  constructor: function (peer, text) {
    this.id = makeId("chat");
    this.peer = peer;
    this.text = text;
    this.time = Date.now();
  },
  activityComponent: function () {
    return UI.Chat({
      name: this.peer.name,
      avatar: this.peer.avatar,
      time: this.time,
      text: this.text,
      key: this.id
    });
  }
});

addon.port.on("chat", function (msg) {
  addChatActivity(msg.clientId, msg.text);
});

function addChatActivity(peerId, text) {
  var peer = getPeer(peerId);
  var chatMessage = ChatMessage(peer, text);
  if (activities.length) {
    var last = activities[activities.length-1];
    if (last instanceof ChatMessage && last.peer == peer &&
        last.time + CHAT_COMBINE_CUTOFF > Date.now()) {
      last.text += "\n" + text;
      last.time = Date.now();
      renderActivity();
      return;
    }
  }
  activities.push(chatMessage);
  renderActivity();
}

var JoinActivity = Class({
  constructor: function (peer) {
    this.id = makeId("join");
    this.peer = peer;
    this.time = Date.now();
  },
  activityComponent: function () {
    return UI.Join({
      name: this.peer.name,
      avatar: this.peer.avatar,
      time: this.time,
      key: this.id
    });
  }
});

var LeaveActivity = Class({
  constructor: function (peer) {
    this.id = makeId("leave");
    this.peer = peer;
    this.time = Date.now();
  },
  activityComponent: function () {
    return UI.Leave({
      name: this.peer.name,
      avatar: this.peer.avatar,
      time: this.time,
      key: this.id
    });
  }
});

var InvitedActivity = Class({
  constructor: function (peer, invitees) {
    this.id = makeId("invited");
    this.peer = peer;
    this.invitees = invitees;
    this.time = Date.now();
  },
  activityComponent: function () {
    return UI.Invited({
      name: this.peer.name,
      avatar: this.peer.avatar,
      time: this.time,
      invitees: this.invitees,
      key: this.id
    });
  }
});

hub.on("invited", function (msg) {
  var invited = InvitedActivity(msg.peer, msg.invitees);
  addPendingInvites(msg.invitees.length);
  activities.push(invited);
  renderActivity();
});

var PushActivity = Class({
  constructor: function (peer, url, title, localTabId, reloaded) {
    this.id = makeId("push");
    this.peer = peer;
    this.url = url;
    this.localTabId = localTabId;
    this.reloaded = reloaded;
    this.time = Date.now();
  },
  activityComponent: function () {
    return null;
    throw new Error("Not implemented");
  }
});

addon.port.on("push", function (msg, localTabId, reloaded) {
  var peer = getPeer(msg.clientId);
  var push = PushActivity(peer, msg.url, msg.title || msg.url, localTabId, reloaded);
  activities.push(push);
  renderActivity();
});

var JoinedMirror = Class({
  constructor: function (peer, localTabId) {
    this.id = makeId("joinedMirror");
    this.peer = peer;
    this.localTabId = localTabId;
    this.time = Date.now();
  },
  activityComponent: function () {
    return UI.JoinedMirror({
      name: this.peer.name,
      avatar: this.peer.avatar,
      time: this.time,
      tab: this.peer.getTab(this.localTabId),
      key: this.id
    });
  }
});

addon.port.on("joinedMirror", function (msg, localTabId) {
  var peer = getPeer(msg.clientId);
  var joined = JoinedMirror(peer, localTabId);
  activities.push(joined);
  renderActivity();
});



/************************************************************
 * UI event handling
 ************************************************************/

// FIXME: this is lame, should just put in an explicit handler
UI.events.on("spectate", function (page) {
  addon.port.emit("spectate", page.tab.id);
});

UI.events.on("showCamera", function () {
  var base = location.href.replace(/\/[^\/]*$/, "");
  addon.port.emit("visitPage", base + "/../interaction-cam/index.html");
});

UI.events.on("avatarClick", function (peerId) {
  var peer = getPeer(peerId);
  var tab = peer.getActiveTab();
  if (! tab) {
    return;
  }
  var url = tab.current().url;
  addon.port.emit("visitPage", url);
});

UI.events.on("openNotes", function () {
  var notesUrl = "https://etherpad.mozilla.org/" + groupId + "-session-log";
  addon.port.emit("visitPage", notesUrl);
});

/************************************************************
 * Rendering
 ************************************************************/

var userGrid;

function renderUsers() {
  if (! userGrid) {
    userGrid = UI.UserGrid();
    $("#user-container").empty();
    React.renderComponent(userGrid, $("#user-container")[0]);
  }
  var users = [UI.PeerAvatar({
    isSelf: true,
    id: selfIdentity.id,
    name: selfIdentity.name,
    avatar: selfIdentity.avatar
  })];
  allPeers().forEach(function (p) {
    if (p.isSelf) {
      return;
    }
    users.push(UI.PeerAvatar({
      isSelf: false,
      id: p.id,
      avatar: p.avatar,
      name: p.name,
      key: "peer"+p.id
    }));
  });
  userGrid.setState({users: users, waiting: pendingInvites});
}

var activityList;

function ignoreUrl(url) {
  if (url.indexOf("about:") === 0) {
    return true;
  }
  if (url.search(/^resource:.*interaction-cam/) != -1) {
    return true;
  }
  var logUrl = "https://etherpad.mozilla.org/" + groupId + "-session-log";
  if (url.indexOf(logUrl) === 0) {
    return true;
  }
  return false;
}

function renderActivity() {
  if (! activityList) {
    activityList = UI.ActivityList();
    $("#activity-stream-container").empty();
    React.renderComponent(activityList, $("#activity-stream-container")[0]);
  }
  var sorted = activities.slice();
  allPeers().forEach(function (p) {
    var tabs = [];
    p.allTabs().forEach(function (t) {
      t.history.forEach(function (page) {
        sorted.push(page);
      });
    }, this);
  }, this);
  sorted.sort(function (a, b) {return a.time < b.time;});
  var components = [];
  sorted.forEach(function (i) {
    var component = i.activityComponent();
    if (component) {
      components.push(component);
    }
  });
  activityList.setState({activities: components});
}

var chatField;

function renderChatField() {
  if (! chatField) {
    chatField = UI.ChatField({
      onChatSubmit: function (text) {
        addon.port.emit("chat", text);
        if (text.indexOf("/") !== 0) {
          addChatActivity(clientId, text);
        }
      }
    });
    $("#chat-field-container").empty();
    React.renderComponent(chatField, $("#chat-field-container")[0]);
  }
}

var bar;
var currentTabState = "normal";

function renderBar() {
  if (! bar) {
    bar = UI.Bar({
      onPresentClick: function (presenting) {
        if (currentTabState == "presenting") {
          addon.port.emit("setPresenting", false);
        } else if (currentTabState == "viewing") {
          addon.port.emit("closeViewing");
        } else {
          addon.port.emit("setPresenting", true);
          addon.port.emit("pushPresenting", null);
        }
      }
    });
    $("#bar-container").empty();
    React.renderComponent(bar, $("#bar-container")[0]);
  }
  var peers = [];
  allPeers().forEach(function (p) {
    if (! p.isSelf) {
      peers.push({peer: p, sharing: false});
    }
  });
  bar.setState({
    presenting: currentTabState == "presenting",
    viewing: currentTabState == "viewing",
    peers: peers
  });
}

// Due to Bootstrap we can't use a React handler for this:
UI.events.on("shareToPeer", function (peerId) {
  if (currentTabState == "presenting") {
    addon.port.emit("pushPresenting", peerId);
  } else {
    addon.port.emit("push", peerId);
  }
});

addon.port.on("setCurrentTabState", function (state) {
  currentTabState = state;
  renderBar();
});

$(renderBar);

function dumpState() {
  var lines = [];
  lines.push('Self: ' + clientId);
  for (var peerId in peers) {
    var peer = peers[peerId];
    lines = lines.concat([
      'Peer: ' + peer.id + (peer.isSelf ? ' SELF' : ''),
      '  name: ' + peer.name,
      '  avatar: <img height=40 width=40 src="' + peer.avatar + '">',
      '  color: ' + peer.color,
      '  tabs:']);
    for (var tabId in peer.tabs) {
      var tab = peer.tabs[tabId];
      lines = lines.concat([
        '    Tab ID ' + tab.id + (tab.live ? '' : ' DEAD'),
        '      url: ' + tab.currentUrl,
        '      title: ' + tab.currentTitle
      ]);
      tab.history.forEach(function (p, index) {
        if (! index) {
          return;
        }
        lines.push('      history: ' + p.url);
      });
    }
  }
  lines.push('Activities:');
  activities.forEach(function (a) {
    if (a instanceof ChatMessage) {
      lines.push('  Chat from ' + a.peer.name + ' at ' + a.time);
      lines.push('    ' + a.text);
    } else if (a instanceof JoinActivity) {
      lines.push('  Joined Session: ' + a.peer.name + ' at ' + a.time);
    } else if (a instanceof PushActivity) {
      lines.push('  Push from ' + a.peer.name + ' at ' + a.time);
      lines.push('    url: ' + a.url);
      lines.push('    resulted in: ' + a.localTabId + (a.reloaded ? ' RELOAD' : ''));
    } else if (a instanceof JoinedMirror) {
      lines.push('  Joined Mirror ' + a.peer.name);
      lines.push('    joined tab: ' + a.localTabId);
    } else {
      lines.push('Unknown activity: ' + JSON.stringify(a));
    }
  });
  return lines.join("\n");
}
