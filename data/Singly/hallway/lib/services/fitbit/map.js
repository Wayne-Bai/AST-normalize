exports.device = {
  at: function(data) {
    return (new Date(data.lastSyncTime)).getTime();
  }
};

exports.profile = {
  id: 'encodedId',
  photo: 'avatar',
  oembed: function(data) {
    var ret = {type:'contact'};
    ret.id = data.encodedId;
    ret.url = 'http://www.fitbit.com/user/' + ret.id;
    ret.title = data.fullName;
    ret.thumbnail_url = data.avatar;
    ret.provider_name = 'fitbit';
    if (data.city && data.state && data.country) {
      ret.location = data.city + ', ' + data.state + ', ' + data.country;
    }
    return ret;
  }
};

exports.defaults = {
  self       : 'profile',
  activities : 'activity',
  devices    : 'device',
  fat        : 'fat',
  sleep      : 'sleep',
  weight     : 'weight'
};

