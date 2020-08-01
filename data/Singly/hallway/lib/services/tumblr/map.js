exports.ptype = 108; // must be unique per service, see dMap.js

exports.blog = {
  photo: function(data) {
    if (!data.url) return undefined;
    var u = require('url').parse(data.url);
    if (u && u.hostname) return 'http://api.tumblr.com/v2/blog/'+u.hostname+'/avatar/512';
    return undefined;
  },
  id: 'name',
  at: function(data) {
    return data.updated * 1000;
  },
  oembed: function(data) {
    var ret = {type:'contact'};
    ret.url = data.url;
    ret.title = data.title;
    ret.description = data.description;
    ret.handle = data.name;
    ret.thumbnail_url = 'http:/api.tumblr.com/v2/blog/'+data.name+'.tumblr.com/avatar/512';
    ret.provider_name = 'tumblr';
    return ret;
  },
  text: 'name'
};

var ent = require('ent');
function strip(html) {
  if (!html) return html;
  return ent.decode(html.replace(/<\S[^><]*>/g, " ").replace(/\s+/g, " "));
}
exports.post = {
  at: function(data) {
    return data.timestamp * 1000;
  },
  earliest: function(data) {
    return data.timestamp * 1000;
  },
  oembed: function(data) {
    var ret;
    if (data.type === 'photo') {
      ret = {type:'photo'};
      // sometimes tumblr returns 0 size!
      // https://github.com/Singly/API/issues/43
      if (data.photos[0].original_size.height > 0) {
        ret.height = data.photos[0].original_size.height;
      }
      if (data.photos[0].original_size.width > 0) {
        ret.width = data.photos[0].original_size.width;
      }
      ret.url = data.photos[0].original_size.url;
      if (data.title) ret.title = data.title;
      if (data.caption) ret.description = strip(data.caption);
      ret.provider_name = 'tumblr';
      if (data.post_url) ret.provider_url = data.post_url;
      if (data.blog_name) ret.author_name = data.blog_name;
      return ret;
    }
    if (data.type === 'link') {
      ret = {type:'link'};
      ret.title = data.title;
      if (data.description) ret.description = strip(data.description);
      ret.url = data.url;
      ret.provider_name = 'tumblr';
      if (data.post_url) ret.provider_url = data.post_url;
      if (data.blog_name) ret.author_name = data.blog_name;
      return ret;
    }
    if (data.type === 'video') {
      ret = {type:'video'};
      if (data.title) ret.title = data.title;
      if (data.caption) ret.description = strip(data.caption);
      ret.url = data.permalink_url || data.post_url;
      if (data.thumbnail_url) ret.thumbnail_url = data.thumbnail_url;
      if (data.player && data.player.length > 0) {
        data.html = data.player[data.player.length-1].embed_code;
      }
      ret.provider_name = 'tumblr';
      if (data.post_url) ret.provider_url = data.post_url;
      if (data.blog_name) ret.author_name = data.blog_name;
      return ret;
    }
    if (data.type === 'quote') {
      ret = {type:'link'};
      ret.title = data.source_title;
      ret.description = data.text;
      ret.url = data.source_url;
      ret.provider_name = 'tumblr';
      if (data.post_url) ret.provider_url = data.post_url;
      if (data.blog_name) ret.author_name = data.blog_name;
      return ret;
    }
    return undefined;
  },
  text: function(data) {
    var ret = data.title || "";
    if (data.body) {
      if (ret) ret += ": ";
      ret += strip(data.body);
    }
    if (data.description) {
      if (ret) ret += ": ";
      ret += strip(data.description);
    }
    if (data.text) {
      if (ret) ret += ": ";
      ret += strip(data.text);
    }
    if (data.caption) {
      if (ret) ret += ": ";
      ret += strip(data.caption);
    }
    return ret.length > 0 ? ret : undefined;
  },
  author: function(data) {
    if (!data.blog_name) return undefined;
    var ret = {};
    ret.name =  data.blog_name;
    ret.url = 'http://'+data.blog_name+'.tumblr.com';
    ret.photo = 'http://api.tumblr.com/v2/blog/'+data.blog_name+'.tumblr.com/avatar/512';
    return ret;
  },
  participants: function(data) {
    var ret = {};
    if (data.blog_name) ret[data.blog_name] = {"author": true};
    // tumblr dashboard things frequently have thousands of notes for popular
    // blogs, limit exposure
    if (Array.isArray(data.notes)) data.notes.slice(0,16).forEach(function(note){
      if (note.blog_name) ret[note.blog_name] = ret[note.blog_name] || {};
    });
    return (Object.keys(ret).length > 0) ? ret : undefined;
  }
};


exports.user = {
  id: 'name',
  photo: function(data) {
    var url = require('url');
    for(var i in data.blogs){
      if (!data.blogs[i].primary) continue;
      var u = url.parse(data.blogs[i].url);
      if (u && u.hostname) {
        return 'http://api.tumblr.com/v2/blog/'+u.hostname+'/avatar/512';
      }
    }
    return undefined;
  },
  at: function(data) {
    for(var i in data.blogs){
      if (!data.blogs[i].primary) continue;
      if (data.updated > 0) return data.updated * 1000;
    }
    return Date.now();
  }
};

exports.defaults = {
  following: 'blog',
  dashboard: 'post',
  posts: 'post',
  self: 'user'
};

exports.types = {
  photos: ['photo:tumblr/posts'],
  photos_feed: ['photo:tumblr/dashboard'],
  news: ['link:tumblr/posts', 'quote:tumblr/posts'],
  news_feed: ['link:tumblr/dashboard', 'quote:tumblr/dashboard'],
  videos: ['videos:tumblr/posts'],
  videos_feed: ['videos:tumblr/dashboard'],
  statuses: ['text:tumblr/posts'],
  statuses_feed: ['text:tumblr/dashboard'],
  contacts: ['blog:tumblr/following']
};

exports.pumps = {
  types: {
    post: function(entry) {
      if (!entry.types) entry.types = {};
      if (entry.data.type) entry.types[entry.data.type] = true;
    }
  }
};

exports.guid = {
  'post': function(entry) {
    if (!entry.data.link_url) return undefined;
    // match instagrammys
    var match = /instagr.am\/p\/([^\/]+)\//.exec(entry.data.link_url);
    if (match) return 'guid:instagram/#'+match[1];
    return undefined;
  }
};
