exports.user = {
  photo: "avatar_url",
  oembed: function(data) {
    var ret = {type:'contact'};
    ret.title = data.name;
    if(data.avatar_url) ret.thumbnail_url = data.avatar_url;
    ret.url = "http://stocktwits.com/"+data.username;
    ret.provider_name = 'stocktwits';
    return ret;
  }
};

exports.defaults = {
  self: 'user',
  following: 'user',
  followers: 'user'
};

exports.types = {
  contacts: ['user:stocktwits/following']
};
