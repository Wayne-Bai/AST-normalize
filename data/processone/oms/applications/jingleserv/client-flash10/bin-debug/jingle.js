function FlashJingleSession(jid, sid) {
  this.jid = jid;
  this.sid = sid;
  this.initiator = jid;
  if (!this.sid) {
    this.initiator = Model.Connection.myResource.jid;
    this.sid = generateRandomName(8);
  }
}
FlashJingleSession.prototype = {
  initiateCall: function() {
    var res = flashJingleService.flash.startCall(jid);
    if (!res.transports || !res.transports.length)
      return false;

    this.id = res.id;
    flashJingleService.servicesByFlashId[this.id] = this;

    this.sendJinglePacket("session-initiate", this.initiator,
                          this._onSessionInitiateAcked.createDelegate(this),
                          "candidates", res.transports);

    return true;
  },

  acceptCall: function() {
    flashJingleService.log("SC:AC: "+this._selectedCandidate);
    flashJingleService.flash.sessionAccepted(this.id);
    this.sendJinglePacket("session-accept", this.jid, null,
                          "candidates", [{id:this._selectedCandidate}]);
    callStarted(this.jid);
  },

  endCall: function(reason) {
    this.sendJinglePacket("session-terminate", this.initiator, null,
                          "reason", [["success"]]);
    flashJingleService.flash.endCall(this.id);
    callEnded(this.jid, reason);
    this.sessionClosed();
  },

  streamSelected: function(candidateId) {
    this._selectedCandidate = candidateId;
    flashJingleService.log("SC:SS: "+this._selectedCandidate);
  },

  streamSelectionFailed: function() {
    this.endCall("Connection problem");
  },

  _onSessionInitiateAcked: function(pkt) {
    if (pkt.getType() != "result") {
      flashJingleService.flash.endCall(this.id);
      callEnded(this.jid, "Connection problem");
      this.sessionClosed();
      return;
    }
  },

  onPacket: function(pkt, query) {
    var action = query.getAttribute("action");

    if (action == "session-initiate") {
      this.sendAck(pkt.getID());

      var candidates = this._extractCandidates(pkt, query);
      this.id = flashJingleService.flash.callRequested(this.jid, candidates);
      flashJingleService.servicesByFlashId[this.id] = this;

      newCallRequested(this.jid, this);

      this.sendJinglePacket("session-info", this.jid, null, "info", {name: "ringing"});
    } else if (action == "session-accept") {
      var candidates = this._extractCandidates(pkt, query);
      flashJingleService.flash.streamSelectedReceived(this.id, candidates[0].id);
      this.sendAck(pkt.getID());
      callStarted(this.jid);
    } else if (action == "session-info") {
      this.sendAck(pkt.getID());
    } else if (action == "session-terminate") {
      this.sendAck(pkt.getID());
      flashJingleService.flash.callEnded(this.id);
      callEnded(this.jid);
      this.sessionClosed();
    }
  },

  _extractCandidates: function(pkt, query) {
    var candidates = [];
    var relays = query.getElementsByTagName("relay");
    for (var i = 0; i < relays.length; i++)
      candidates[i] = {id: relays[i].getAttribute("id"),
                       url: relays[i].getAttribute("url"),
                       token: relays[i].getAttribute("token")}
    return candidates;
  },

  sessionClosed: function() {
    delete flashJingleService.servicesByFlashId[this.id];
    delete flashJingleService.servicesBySid[this.sid];
  },

  sendAck: function(id) {
    var iq = new JSJaCIQ();

    flashJingleService.log("-> ack");
    iq.setIQ(this.jid, "result", id);
    Model.Connection._conObj.send(iq);
  },

  sendJinglePacket: function(action, initiator, callback, type, arg) {
    var iq = new JSJaCIQ();
    var nodes;

    iq.setIQ(this.jid, "set");

    if (type == "candidates") {
      var c = [];
      for (var i = 0; i < arg.length; i++) {
        var args = {id: arg[i].id};
        if (arg[i].url)
            args.url = arg[i].url;
        if (arg[i].token)
            args.token = arg[i].token;
        c[i] = ["relay", args];
      }

      nodes = [["content", {creator: "initiator", name: "voice"},
               [["transport", {xmlns: "p1:jingle:transports:rtmp:0"}, c]]]];
      flashJingleService.log("SJP: "+uneval(c));
    } else if (type == "reason") {
      nodes = [["reason", {}, arg]];
    } else if (type == "info") {
      var name = arg.name;
      delete arg.name;
      arg.xmlns = "p1:jingle:apps:rtp:0:info"
      nodes = [[name, arg]];
    }
    iq.appendNode("jingle", {xmlns: "urn:xmpp:jingle:1", sid: this.sid,
                             action: action, initiator: initiator},
                            nodes);
    Model.Connection._conObj.send(iq, callback);
    flashJingleService.log("-> "+action)//+" "+iq.xml());
  }
}

function FlashJingleService() {
}
FlashJingleService.prototype = {
  servicesBySid: {},
  servicesByFlashId: {},

  initiateCall: function(jid) {
    this._findFlash();

    var session = new FlashJingleSession(jid);
    this.servicesBySid[session.sid] = session;

    session.initiateCall();

    return session;
  },

  onPacket: function(pkt, query) {
    this._findFlash();

    var sid = query.getAttribute("sid");
    this.log("<- "+query.getAttribute("action"));
    if (this.servicesBySid[sid]) {
      this.servicesBySid[sid].onPacket(pkt, query);
      return;
    }
    if (pkt.getType() == "set" && query.getAttribute("action") == "session-initiate") {
      this.servicesBySid[sid] = new FlashJingleSession(pkt.getFrom(), sid)
      this.servicesBySid[sid].onPacket(pkt, query);
    }
  },

  _findFlash: function() {
    if (!this.flash)
      this.flash = document.getElementById("FlashyJingle");
  },

  log: function(msg) {
    return;
    var el = document.getElementById("FlashyJingle");
    el.value+=msg+"\n";
    el.scrollTop = el.scrollHeight
  },

  _flash: {
    startCall: function(jid) {
      flashJingleService.log("=> startCall("+jid+")");
      return {id:"a", transports: [{id:1, url: "url", token: "token1"},{id:2, url: "url", token: "token2"}]}
    },

    callRequested: function(jid, transports) {
      flashJingleService.log("=> callRequested("+jid+", "+uneval(transports)+")");
      setTimeout(function() {
        streamSelected("b", 1);
        flashJingleService.log("<= streamSelected()");
      }, 500);
      return "b";
    },

    sessionAccepted: function(id) {
      flashJingleService.log("=> sessionAccepted()")
    },

    streamSelectedReceived: function(id, transportId) {
      flashJingleService.log("=> streamSelectedReceived("+transportId+")")
    },

    endCall: function(id) {
      flashJingleService.log("=> endCall()")
    },

    callEnded: function(id) {
      flashJingleService.log("=> callEnded()")
    }
  }
}

var flashJingleService = new FlashJingleService();

function streamSelected(id, candidateId) {
  flashJingleService.servicesByFlashId[id].streamSelected(candidateId);
}

function streamSelectionFailed(id) {
  flashJingleService.servicesByFlashId[id].streamSelectionFailed();
}

Model.Connection.xmppServices["urn:xmpp:jingle:1"] =
  flashJingleService.onPacket.createDelegate(flashJingleService);
