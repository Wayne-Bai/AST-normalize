// ex: set ts=2 softtabstop=2 shiftwidth=2: 

// keeps Strophe quiet
Strophe.log = function(){};
var fm = Ext.util.Format;

var jabber = {
  u_n: '',
  p_w: '',
  con: null,
  myJid: '',
  nTrials: 0,
  maxTrials: 1,
  keepOffline:false,
  init: function(presence, status, type){
    this.status = {presence:presence, status:status, type:type};
  },
  
  quit: function(){
    roster.clear();
    if (this.con && this.con.connected) {
        this.keepOffline = true;
        this.setPresence(null, null, 'unavailable'); // workaround for a strophe v1.0.1 bug
        this.con.disconnect();
    }
  },
  
  /**
   * Registers handlers for XMPP stanzas
   * @param {JSJaCHttpBindingConnection} con
   */
  setupCon: function(){

    this.con.addHandler(this.handle.message, null, 'message', 'chat', null, null);
  },
  
  doLogin: function(username, password){
    try {
      this.con = new Strophe.Connection('/http-bind/');
      
      this.setupCon();
      
      Ext.apply(this, {
        u_n: username
        ,p_w: password
        ,myJid: username + '@' +config.jabber_domain
      });
      
      this.con.connect(this.myJid, password, function (status) {
        if (status === Strophe.Status.CONNECTED) {
            $(document).trigger('jabConnected');
        } else if (status === Strophe.Status.DISCONNECTED) {
            $(document).trigger('jabDisconnected');
        }
      });
    } 
    catch (e) {
      console.log(e.toString());
    }
    finally {
      return false;
    }
  },
  send:function(packet) {
    try {
      this.con.send(packet);
    
    } catch(e) {
      Ext.MessageBox.alert('Error sending packet', e.message);
    }
  },
  /**
   * Sends a message
   * @param {String} user
   * @param {String} msg
   */
  sendMsg: function(user, txt){
    var msg = $msg({to: user, type: 'chat'})
      .c('active', {xmlns:'http://jabber.org/protocol/chatstates'}).up()
      .c('body').t(txt);
    this.con.send(msg)
    return true;
  },

  sendComposing: function(user, status) {
    var msg = $msg({to: user, type: 'chat'})
      .c(status ? 'composing' : 'active', {xmlns:'http://jabber.org/protocol/chatstates'});
    this.con.send(msg)
    return true;
  },
  
  getRoster: function(){
    var iq = $iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'});
    this.con.sendIQ(iq, this.handle.iqRoster);
  },

  getChatHistory: function(jid, start) {
    /*
    <iq type='get' id='xyz1'>
      <retrieve xmlns='http://www.xmpp.org/extensions/xep-0136.html#ns'
            with='setti@fbk.eu/Home' start='2010-04-07T09:05:34.000000Z'>
        <set xmlns='http://jabber.org/protocol/rsm'>
          <max>30</max>
        </set>
      </retrieve>
    </iq>
    */
    var iq = $iq({type: 'get'})
      .c('retrieve', {
        xmlns:'http://www.xmpp.org/extensions/xep-0136.html#ns'
        ,'with': jid
        ,start: start
      });/*
      .c('set', {
        xmlns: 'http://jabber.org/protocol/rsm'
      })
      .c('max').t('30').up();*/
    
    this.con.sendIQ(iq, this.handle.iqChatHistory);
  },
  
  listHistory: function(jid, after, before) {
    /*
    <iq type='get' id='xyz1'>
      <list xmlns='http://www.xmpp.org/extensions/xep-0136.html#ns'
            with='user@example.com'>
        <set xmlns='http://jabber.org/protocol/rsm'>
          <max>30</max>
        </set>
      </list>
    </iq>
    */
    var iq = $iq({type: 'get'})
      .c('list', {
        xmlns:'http://www.xmpp.org/extensions/xep-0136.html#ns'
        ,'with': jid
      })
      .c('set', {
        xmlns: 'http://jabber.org/protocol/rsm'
      })
      .c('max').t('30').up();

    if (after)
      iq = iq.c('after').t(after);
    else if (before)
      iq = iq.c('before').t(before);
    else
      iq = iq.c('before');

    if (!this.listHistoryRequest)
      this.listHistoryRequest = {};

    this.con.sendIQ(iq, this.handle.iqListHistory);
    this.listHistoryRequest[$(iq.tree()).attr('id')] = jid;
  },
  
  setPresence: function(show, status, type, force) {
    this.status = {presence:show, status:status, type:type};

    if (!force && !roster.roster.length) //don't send presence if not online
      return true;

    var attr = {};
    if (type) attr = {type:type};

    var pres = $pres(attr);
    if (status !== null)
      pres = pres.c('status').t(status).up();
    if (show !== null)
      pres.c('show').t(show);

    this.send(pres.tree()); 

    //save status in the west panel
    if(westPanel.showedUser && westPanel.showedUser.id === user.id){
      setChatStatus(fm.htmlEncode(status).smilize().urlize());
    }
  },

  resumeRoster: function() {
    rosterStore.resumeEvents();
    rosterStore.reload();
  },

  isConnected: function(){
    return false;
  },

  handle: {
    message: function(message){
      var jMessage = $(message)
        ,tmp, body
        ,jui = jabberui;


      // set current timestamp
      var x
        ,timestamp
        ;//,node = aJSJaCPacket.getNode();
      var from = Strophe.getBareJidFromJid(
        jMessage.attr('from')
      );
      
      tmp = jMessage.find('composing');
      if (tmp.length) {
        jui.composing(from, true);
        return true;
      }
      
      //if not composing, then it's not composing ;)
      jui.composing(from, false);

      tmp = jMessage.find('body');
      if (tmp.length) {
        var x;
        body = $(tmp[0]).text();
        jMessage.find('x').each(function(){
          x = $(this);
          if (x.attr('xmlns') == 'jabber:x:delay'){
            return false;
          }
        });
      
        if (x) {
          var stamp = x.attr('stamp');
          timestamp = new Date(Date.UTC(stamp.substring(0,4),stamp.substring(4,6)-1,
            stamp.substring(6,8), stamp.substring(9,11), stamp.substring(12,14),
            stamp.substring(15,17)
          ));
        } else
          timestamp = new Date();

        // add message to the chat window
        jui.addMsg(from, body, timestamp);
        return true;
      } 
      
      tmp = jMessage.find('paused');
      if (tmp.length) {
        return true;
      }

      return true;
    },
    
    presence: function(presence){
      var jP = $(presence),
        ptype = jP.attr('type'),
        from = jP.attr('from'),
        jid = Strophe.getBareJidFromJid(from),
        resource = Strophe.getResourceFromJid(from);

      //TODO: fix this (jabber.resource is empty)
      if ((ptype === 'unavailable') && (jid === jabber.myJid) && (resource !== jabber.resource)) {
        // if a disconnection message comes from another resource of this user, discard this message.
        // This check prevents that the users seems to be offline 30s after page refresh
        return true;
      }

      var presence = ''
        ,status = '',
        tmp;

      tmp = jP.find('show');
      if (tmp.length) {
        presence = $(tmp[0]).text();
      }
      tmp = jP.find('status');
      if (tmp.length) {
        status = $(tmp[0]).text();
      }

      jabber.dTask.delay(500);

      roster.setPresence(jid, presence, status, ptype);
      return true;
    },

    connected: function(){
      var j = jabber;
      j.resource = Strophe.getResourceFromJid(j.con.jid);

      j.getRoster();
    },
    
    disconnected: function(){
      var j = jabber;

      if (j.keepOffline){
        Ext.getCmp('buddylist').gridPanel.view.emptyText = 'You are offline. Click <span class="a" onclick="resetJabberConnection()"><b>here</b></span> to connect.';
        return;
      }
      
      Ext.getCmp('buddylist').gridPanel.view.emptyText = 'Nobody online or there has been problems connecting to the server.<br/><br/>Click <span class="a" onclick="resetJabberConnection()"><b>here</b></span> to try again. If you changed your password recently, please logout and login again with the new password.';
      
      if (j.nTrials++ < j.maxTrials){
        var status = j.status;
        jabberui.init(status.presence, status.status, status.type);
      }
    },
    
    iqRoster: function(iq){
      var r = roster
        ,j = jabber;

      r.clear(); //i hope the new roster replaces the old one...
      
      $(iq).find('item').each(function(){
        var t = $(this)
          ,b = new Buddy(t.attr('jid'), t.attr('name'),
            t.find('group').text());
        r.roster.push(b);
      });

      // set up presence handler and send initial presence
      rosterStore.suspendEvents();
      j.dTask = new Ext.util.DelayedTask(j.resumeRoster);
      j.con.addHandler(j.handle.presence, null, "presence");
      j.setPresence(j.status.presence,
        j.status.status, j.status.type, null, true
      );
    }

    ,iqChatHistory: function(iq){
      iq = $(iq);
      
      var output = []
        ,first, last, count, index, user
        ,tmp;
      window.iq = iq;
     

      iq.find('chat to, chat from').each(function(idx, el){
        var i=$(el);
        output.push([el.tagName, parseInt(i.attr('secs'), 10), i.find('body').text()]);
      });

      var i = 0
        ,clean_output = [];

      // Cleaning duplicate messages
      while(el = output[i++]) {
        if(el[0] == 'from'){
          var next = output[i];
          if(next && (el[1] == next[1]) && (el[2] == next[2])) continue;
        }
        clean_output.push(el);
      }
    
      if (tmp = iq.find('set')){
        var f = tmp.find('first');
        first = f.text();
        last  = tmp.find('last').text();
        count = tmp.find('count').text();
        index = parseInt(f.attr('index'), 10);
      }
      user  = iq.find('chat').attr('with');
      start  = iq.find('chat').attr('start');

      jabberui.showChatHistory({
        user:  user,
        start: start,
        chats: clean_output,
        first: first,
        last:  last,
        count: count,
        index: index,
        items: 30
      });
    }

    ,iqListHistory: function(iq){
      iq = $(iq);
      var output = []
        ,id = iq.attr('id')
        ,j = jabber
        ,user = j.listHistoryRequest[id]
        ,first, last, count, index
        ,tmp;

      delete j.listHistoryRequest[id];

      iq.find('list chat').each(function(idx, i){
        var i=$(i);
        output.push([i.attr('with'), i.attr('start')]);
      });

      if (tmp = iq.find('set')){
        var f = tmp.find('first');
        first = f.text();
        last  = tmp.find('last').text();
        count = tmp.find('count').text();
        index = parseInt(f.attr('index'), 10);
      }
      output.reverse();

      jabberui.showListHistory({
        user:user,
        chats: output,
        first: first,
        last: last,
        count: count,
        index: index,
        items: 30
      });
    }
  }
};

$(document).bind('jabConnected', function(){
  jabber.handle.connected();
}).bind('jabDisconnected', function(){
  jabber.handle.disconnected();
});

/**
 * Buddy type
 * @param {String} jid
 * @param {String} subscription Must be "none", "to", "from", "both"
 * @param {String} name Nickname
 * @param {String} group
 * @param {String} presence
 * @param {String} status
 * @param {String} type
 */
var Buddy = function(jid, name, group, presence, status, type){
  Ext.apply(this, {
    jid: jid
    ,name: name
    ,group: group
    ,presence: presence
    ,status: status
    ,type: type
  });

  for (var el in ['presence','status','type']) {
    if (typeof(this[el]) == 'undefined') 
      this[el] = '';
  }


  /**
   * Compares self to another Buddy object
   * @param {Buddy} buddy
   */
  this.compareTo = function (buddy) {
    return this.jid === buddy.jid;
  };


  /**
   * Updates buddy attributes without overwriting presence data
   * @param {Buddy} buddy
   */
  this.update = function (buddy) {
    Ext.copyTo(this, buddy, 'jid,subscription,name,group');
  };
};

