var lib = require('./lib');

exports.ptype = 101; // must be unique per service, see dMap.js

function _c(val) {
  return val && val._content;
}

// http://www.flickr.com/services/api/flickr.contacts.getList.html
exports.contact = {
  id: function (data) {
    return data.nsid;
  },
  name: function (data) {
    return _c(data.realname);
  },
  photo: function (data) {
    if (!data.iconserver || parseInt(data.iconserver, 10) === 0) return null;
    return [
      "http://farm", data.iconfarm,
      ".staticflickr.com/", data.iconserver,
      "/buddyicons/", data.nsid,
      ".jpg"
    ].join("");
  },
  oembed: function (data) {
    var ret = {
      type: 'contact',
      title: _c(data.realname),
      handle: data.path_alias,
      url: _c(data.profileurl),
      description: _c(data.description),
      provider_name: 'flickr'
    };

    if (data.iconserver > 0) {
      ret.thumbnail_url = [
        "http://farm", data.iconfarm,
        ".staticflickr.com/", data.iconserver,
        "/buddyicons/", data.nsid,
        ".jpg"
      ].join("");
    }

    return ret;
  }
};

exports.profile = {
  name: function (data) {
    return data.realname && data.realname._content;
  },
  oembed: function (data) {
    var ret = {
      type: 'contact',
      url: data.profileurl._content,
      provider_name: 'flickr',
      id: data.id
    };
    if (data.realname) ret.title = data.realname._content;
    return ret;
  }
};

// http://www.flickr.com/services/api/flickr.people.getPhotos.html
exports.photo = {
  media: 'source',
  at: function(data) {
    return lib.dateUploaded(data);
  },
  earliest: function (data) {
    // Ideally we'd pass in the timezone offset from
    // pi.auth.profile.timezone.offset here, but we don't have access to it in
    // the map yet
    if (!lib.dateTaken(data)) {
      return lib.dateUploaded(data);
    }

    return Math.min(lib.dateTaken(data), lib.dateUploaded(data));
  },
  oembed: function (data) {

    var ret = {
      type          : 'photo',
      title         : data.title,
      provider_name : 'flickr'
    };

    // get the thumbnail url
    if (data.url_t) {
      ret.thumbnail_url = data.url_t;
    }

    // get the largest image for the photo url
    var photoTypes = ["url_l", "url_c", "url_z", "url_n", "url_m", "url_q",
      "url_s", "url_t", "url_sq"];
    for (var i = 0; i < photoTypes.length; i++) {
      var photoType = photoTypes[i];
      if (data[photoType]) {
        ret.url = data[photoType];
        break;
      }
    }

    return ret;
  }
};

exports.defaults = {
  self: 'profile',
  photos: 'photo',
  contacts: 'contact',
  photos_feed: 'photo'
};

exports.types = {
  photos: ['photo:flickr/photos'],
  contacts: ['contact:flickr/contacts'],
  photos_feed: ['photo:flickr/photos_feed']
};
