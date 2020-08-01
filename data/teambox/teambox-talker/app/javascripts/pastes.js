Talker.Paste = {};

// Rewrite an attribution in a changeset
Talker.Paste.rewriteAttributions = function(cs, attrib, userId) {
  var re = new RegExp("\\*" + attrib, "g");
  return cs.replace(re, "*" + userId);
}
// Create an attribution pool from a changeset, extracting user ids from
// the changeset and replacing w/ indexes in the attribution pool.
Talker.Paste.createAttributions = function(cs) {
  var pool = [];
  var authors = {};
  var parts = cs.split("*");
  for (var i=0; i < parts.length; i++) {
    var id = parts[i].match(/^\d+/);
    if (id) { // this part is an attribution
      var num = authors[id];
      if (num == null) { // add the author to the pool
        authors[id] = num = pool.length;
        pool.push(["author", id]);
      }
      parts[i] = parts[i].replace(/^\d+/, num);
    }
  };
  return { changeset: parts.join("*"), pool: pool };
}

Talker.userColors = {};
Talker.Paste.Updater = function(editor) {
  var self = this;
  
  self.addColor = function(userId, color) {
    Talker.userColors[userId] = color;
    editor.setAuthorInfo(userId.toString(), {bgcolor: color});
  };
  
  self.onInitialContent = function(event) {
    if (event.attributions) {
      var attribs = Talker.Paste.createAttributions(event.attributions);
      editor.setBaseAttributedText({text: event.content + "\n", attribs: attribs.changeset },
                                   { numToAttrib: attribs.pool });
    } else {
      editor.setBaseText(event.content + "\n");
    }
    return false;
  };
  
  self.onDiffReceived = function(event) {
    var attribs = Talker.Paste.createAttributions(event.content);
    try {
      editor.applyChangesToBase(attribs.changeset, event.user.id.toString(),
                                { numToAttrib: attribs.pool });
    } catch (e) {
      editor.setEditable(false);
      Talker.client.close();
      alert("Looks like your paste is out of sync with the server. Please refresh to edit this paste again.");
    }
  };
  
  self.onMessageReceived = function(event) {
    // Setting initial text
    if (event.initial) {
      return self.onInitialContent(event);
    }
    
    // Do not apply local diff
    if (event.user.id == Talker.currentUser.id) return false;
    
    self.addColor(event.user.id.toString(), event.color);
    self.onDiffReceived(event);
  };
  
  self.onToken = function(event) {
    var cs = editor.prepareUserChangeset();
    if (cs && cs.changeset) {
      var diff = Talker.Paste.rewriteAttributions(cs.changeset, 0, Talker.currentUser.id);
      // Send to server
      Talker.client.send({type: 'message', content: diff, color: Talker.currentUser.color});
      // Reset local copy when sent
      editor.applyPreparedChangesetToBase();
    }
  };
};