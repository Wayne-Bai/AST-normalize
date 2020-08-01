exports.ptype = 103; // must be unique per service, see dMap.js

exports.profile = {
  id: function(data) {
    return data.id && data.id.$t;
  },
  at: function(data) {
    return data.updated && data.updated.$t && Date.parse(data.updated.$t);
  }
};

exports.contact = {
  id: function(data) {
    return data.id.$t.substring(data.id.$t.lastIndexOf('/') + 1);
  },
  at: function(data) {
    return data.updated && data.updated.$t && Date.parse(data.updated.$t);
  },
  oembed: function(data) {
    var ret = {type:'contact'};
    ret.title = data.title.$t;
    if (data.gd$email) ret.email = data.gd$email[0].address;
    if (data.gd$phoneNumber) ret.phone = data.gd$phoneNumber[0].$t;
    if (Array.isArray(data.link)) for(var i = 0; i < data.link.length; i++) {
      var link = data.link[i];
      // TODO someday create temporary valid urls to protected resources?
      if (link.rel.indexOf('#photo') > 0 && link.gd$etag) {
        ret.thumbnail_note =
          "https://api.singly.com/id/ENTRYID?media=true&access_token=TOKEN";
      }
    }
    ret.provider_name = 'gcontacts';
    return ret;
  },
  text: function(data) {
    return Array.isArray(data.gd$email) && data.gd$email[0].address;
  }
};

exports.defaults = {
  self: 'profile',
  contacts: 'contact'
};

exports.types = {
  contacts: ['contact:gcontacts/contacts']
};

// serve back the media
exports.media = {
  contact: function(auth, entry, res) {
    if (!entry.data.link) return res.send('missing url', 404);
    for(var i = 0; i < entry.data.link.length; i++) {
      var link = entry.data.link[i];
      // TODO depending on access token being alive and auto-refreshed by
      // self.js, need to fix gdata-js to expose a function to do this
      if (link.rel.indexOf('#photo') > 0) {
        return res.redirect(link.href + (link.href.indexOf('?') ? '&' : '?') +
                            'oauth_token=' + auth.token.access_token);
      }
    }
    res.send('no photo',404);
  }
};
